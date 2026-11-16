// Audio engine. Created only after a user gesture. A look-ahead scheduler reads the master clock's mapping
// (sourceTimeOf) and restarts cleanly whenever the clock epoch changes (play, pause, seek, replay, rate).
// Mix: voice / music / effects buses (story.mix, overridable via options), a user music trim after the music bus,
// and narration ducking with a soft attack/release; nearby voice windows merge so the music never pumps.
(function (root) {
  const HV = root.HV = root.HV || {};
  const LOOKAHEAD = 0.6, FADE = 0.04;
  const DUCK = { depth: 0.5, attack: 0.35, release: 1.1, merge: 1.8 };

  HV.createAudio = function createAudio(tl, story, options = {}) {
    let ctx = null, master, buses, trim, group = null, epoch = -1, scheduledTo = 0, volume = 0.8, muted = false;
    const live = new Set(), clips = new Map(), problems = [], starts = [], taps = {};
    let musicClip = null;
    const music = story.music || {}, mix = { ...(story.mix || {}), ...(options.mix || {}) };
    // music sits under the narration: base level from story.mix.music (legacy story.music.level), ducked under voice
    const musicLevel = mix.music ?? (music.level != null ? music.level : 1), voiceLevel = mix.voice ?? 1, fxLevel = mix.effects ?? 1;
    let musicTrim = options.musicTrim ?? 1;

    async function decode(src) {
      const embedded = HV.media && HV.media[src];
      const res = await fetch(embedded || src);
      if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
      return ctx.decodeAudioData(await res.arrayBuffer());
    }
    async function loadMedia() {
      const jobs = tl.narration.filter((n) => n.src).map(async (n) => {
        try { clips.set(n, await decode(n.src)); } catch (e) { problems.push(`voice ${n.id}: ${e.message} (file:// needs embed-media.mjs or local HTTP)`); }
      });
      if (music.src) jobs.push(decode(music.src).then((b) => { musicClip = b; }, (e) => problems.push(`music: ${e.message}`)));
      await Promise.all(jobs);
    }

    async function ensure() {
      if (ctx) { if (ctx.state === 'suspended') await ctx.resume(); return ctx.state === 'running'; }
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) { problems.push('Web Audio unavailable'); return false; }
      ctx = new AC({ latencyHint: 'playback' });
      master = ctx.createGain(); master.gain.value = muted ? 0 : volume;
      const limiter = ctx.createDynamicsCompressor(); limiter.threshold.value = -3; limiter.ratio.value = 12;
      master.connect(limiter); limiter.connect(ctx.destination);
      buses = { music: ctx.createGain(), sfx: ctx.createGain(), voice: ctx.createGain() };
      trim = ctx.createGain(); trim.gain.value = musicTrim;
      buses.music.connect(trim); trim.connect(master); buses.sfx.connect(master); buses.voice.connect(master);
      buses.music.gain.value = musicLevel; buses.sfx.gain.value = fxLevel; buses.voice.gain.value = voiceLevel;
      // measurement taps (pre-mute) for local checks; analysers are pulled without reaching the output
      if (ctx.createAnalyser) for (const k of ['voice', 'music']) { taps[k] = ctx.createAnalyser(); taps[k].fftSize = 8192; (k === 'music' ? trim : buses[k]).connect(taps[k]); }
      await ctx.resume();
      await loadMedia();
      return ctx.state === 'running';
    }

    // every scheduling epoch plays through its own group gains; stopping fades them out first, so no clicks
    function openGroup() {
      group = {};
      for (const k of Object.keys(buses)) { const g = ctx.createGain(); g.gain.value = 1; g.connect(buses[k]); group[k] = g; }
    }
    function track(nodes) {
      for (const n of nodes) { live.add(n); n.onended = () => live.delete(n); }
    }
    function stopAll() {
      const now = ctx.currentTime;
      if (group) for (const g of Object.values(group)) { g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(0, now + FADE); }
      for (const n of live) { try { n.stop(now + FADE + 0.02); } catch (e) { /* already stopped */ } }
      live.clear();
      group = null;
    }
    // offset is in media seconds; media plays at clock.rate, so media offset equals elapsed master time
    function startClip(id, buf, bus, clipT, clock, from) {
      const offset = Math.max(0, from - clipT);
      if (offset >= buf.duration) return;
      const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = clock.rate;
      const when = Math.max(ctx.currentTime, clock.sourceTimeOf(clipT + offset));
      // a clip joined mid-way fades in briefly instead of starting on a non-zero sample
      if (offset > 0) { const g = ctx.createGain(); g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(1, when + 0.02); src.connect(g); g.connect(bus); } else src.connect(bus);
      src.start(when, offset);
      track([src]);
      starts.push({ id, when, offset, rate: clock.rate, at: ctx.currentTime });
      if (starts.length > 100) starts.shift();
    }
    // narration windows, merged when the gap is short, so the music settles under the voice instead of pumping
    function duckWindows() {
      const w = [...clips.keys()].map((l) => [l.t, l.end]).sort((a, b) => a[0] - b[0]), out = [];
      for (const [a, b] of w) { const last = out[out.length - 1]; if (last && a - last[1] < DUCK.merge) last[1] = Math.max(last[1], b); else out.push([a, b]); }
      return out;
    }
    function duck(clock, from) {
      const g = buses.music.gain, now = ctx.currentTime, low = musicLevel * DUCK.depth;
      g.cancelScheduledValues(now);
      const inside = duckWindows().find(([a, b]) => a <= from && from < b);
      g.setValueAtTime(inside ? low : musicLevel, now);
      for (const [a, b] of duckWindows()) {
        if (b <= from) continue;
        const sa = clock.sourceTimeOf(a), sb = clock.sourceTimeOf(b);
        if (a > from) { g.setValueAtTime(musicLevel, Math.max(now, sa - DUCK.attack)); g.linearRampToValueAtTime(low, Math.max(now + 0.01, sa)); }
        g.setValueAtTime(low, Math.max(now + 0.02, sb)); g.linearRampToValueAtTime(musicLevel, Math.max(now + 0.03, sb + DUCK.release));
      }
    }

    function pump(clock) {
      if (!ctx || ctx.state !== 'running') return;
      if (!clock.playing) { if (live.size || group) stopAll(); epoch = clock.epoch; return; }
      const t = clock.time();
      let resync = false;
      if (clock.epoch !== epoch) {
        stopAll(); openGroup(); epoch = clock.epoch; scheduledTo = t; resync = true;
        for (const [line, buf] of clips) if (line.t < t && line.t + buf.duration > t) startClip(line.id, buf, group.voice, line.t, clock, t);
        if (musicClip) startClip('music', musicClip, group.music, 0, clock, t);
        duck(clock, t);
      }
      const horizon = Math.min(tl.duration, t + LOOKAHEAD * clock.rate);
      if (horizon <= scheduledTo && !resync) return;
      for (const { ev, offset } of HV.planAudio(tl.score, scheduledTo, horizon, resync, t)) {
        const when = Math.max(ctx.currentTime, clock.sourceTimeOf(ev.t + offset));
        const bus = ev.kind === 'tick' || ev.kind === 'impact' || ev.kind === 'whoosh' ? group.sfx : group.music;
        track(HV.synth.play(ctx, bus, { ...ev, v: ev.v }, when, (ev.d - offset) / clock.rate, offset / clock.rate));
      }
      // clips whose onset fell inside a stalled window join at the current position (or are skipped if finished)
      for (const [line, buf] of clips) {
        if (line.t < scheduledTo || line.t >= horizon) continue;
        startClip(line.id, buf, group.voice, line.t, clock, line.t >= t - HV.planAudio.LATE ? line.t : t);
      }
      scheduledTo = horizon;
    }

    function setVolume(v) { volume = v; if (master && !muted) master.gain.setTargetAtTime(v, ctx.currentTime, 0.02); }
    function setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : volume, ctx.currentTime, 0.02); }
    function setMusicTrim(v) { musicTrim = v; if (trim) trim.gain.setTargetAtTime(v, ctx.currentTime, 0.05); }
    return {
      ensure, pump, setVolume, setMuted, setMusicTrim, taps, duckWindows: () => duckWindows(),
      clipStarts: () => starts.map((s) => ({ ...s })),
      get ctx() { return ctx; },
      get muted() { return muted; },
      get volume() { return volume; },
      get musicTrim() { return musicTrim; },
      running: () => !!ctx && ctx.state === 'running',
      latency: () => (ctx ? (ctx.outputLatency || 0) + (ctx.baseLatency || 0) : 0),
      clipDurations: () => [...clips].map(([line, buf]) => ({ id: line.id, duration: buf.duration })),
      musicGain: () => (buses ? buses.music.gain.value : null),
      mix: () => ({ music: musicLevel, voice: voiceLevel, effects: fxLevel, musicTrim, duck: { ...DUCK } }),
      state: () => ({ context: ctx ? ctx.state : 'none', liveNodes: live.size, voiceClips: clips.size, musicMedia: !!musicClip, scheduledTo, problems: [...problems] }),
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
