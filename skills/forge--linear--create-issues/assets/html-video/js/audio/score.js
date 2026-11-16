// Deterministic cue sheet: synth music plus the timeline's sound-effect cues, all on the master timeline.
// Default `warm`: a soft piano-like phrase on a global bar grid that ignores scene cuts, so task transitions never
// reset or jolt the music. Major key, stable tonic, close voice-leading, damped at each chord change, faded in and
// resolved on the tonic at the end. `pulse` is the old beat-driven synth score, kept for opt-in cinematic themes.
// Edit story.music (style, bpm, root, progression, chordBars, pattern, level) to change the track.
(function (root) {
  const HV = root.HV = root.HV || {};
  const DEFAULT_PATTERN = [0, null, 12, 0, 3, null, 0, 7, 0, null, 10, 0, 3, 5, null, 12];
  // degree → bass offset and a close right-hand voicing (semitones from the key root), chosen for smooth voice-leading
  const CHORDS = {
    I: { bass: 0, v: [12, 16, 19] }, ii: { bass: 2, v: [14, 17, 21] }, IV: { bass: 5, v: [12, 17, 21] },
    V: { bass: 7, v: [11, 14, 19] }, vi: { bass: -3, v: [12, 16, 21] },
  };
  // eighth-free, quarter-note broken chord over two bars; numbers index the voicing, null = rest
  const WARM_PATTERN = [null, 0, 1, 2, null, 1, 2, 1];

  function warm(tl, m, push) {
    // a re-struck pitch damps its previous note (as a piano would), so identical partials never stack or cancel
    const ringing = new Map();
    const add = (t, kind, d, n, v) => {
      if (kind === 'piano') { const prev = ringing.get(n); if (prev && prev.t + prev.d > t) prev.d = +(t - prev.t + 0.04).toFixed(5); }
      const ev = push(t, kind, d, n, v);
      if (kind === 'piano') ringing.set(n, ev);
    };
    const bpm = m.bpm || 72, beat = 60 / bpm, bars = m.chordBars || 2, slot = 4 * beat * bars, D = tl.duration;
    const key = m.root ?? 53, prog = (m.progression || []).every((d) => CHORDS[d]) && m.progression?.length ? m.progression : ['I', 'vi', 'IV', 'V'];
    // grid slots, then a final tonic chord placed `ring` seconds before the end so it rings out instead of being cut;
    // the slot before it stretches to meet it (no gap, no early reset)
    const pattern = m.pattern || WARM_PATTERN, ring = Math.min(6, D / 2), n = Math.max(1, Math.floor((D - ring) / slot)) + 1;
    for (let k = 0; k < n; k++) {
      const last = k === n - 1, t0 = last ? (n === 1 ? 0 : Math.max(0, D - ring)) : k * slot, end = last ? D : k === n - 2 ? Math.max(0, D - ring) : (k + 1) * slot;
      const name = last ? 'I' : k === n - 2 && n > 2 ? 'V' : prog[k % prog.length], c = CHORDS[name];
      const voicing = c.v.map((x) => key + x), bass = key - 12 + c.bass;
      if (end - t0 < 0.3) continue;
      add(t0, 'warmpad', end - t0, voicing.map((x) => x - 12), 0.05);
      if (k === 0) add(t0 + 2 * beat, 'piano', end - t0 - 2 * beat, bass, 0.2); else add(t0, 'piano', end - t0 - (last ? 0.6 : 0), bass, 0.26);
      if (last) { // closing tonic: one soft rolled chord that rings out
        voicing.forEach((x, i) => add(t0 + 0.09 * (i + 1), 'piano', end - t0 - 0.09 * (i + 1) - 0.6, x, 0.12));
        continue;
      }
      if (k === 0) continue; // the first bars only breathe in: pad and bass under the fade-in
      for (let s = 0; t0 + s * beat < end - 0.2; s++) {
        const idx = pattern[s % pattern.length], t = t0 + s * beat;
        if (idx == null) continue;
        add(t, 'piano', end - t, voicing[idx], (s % 8 < 4 ? 0.13 : 0.11) * (s % 4 === 1 ? 1.08 : 1));
      }
      if (k % 2 === 1 && t0 + 4 * beat < end - 0.5) add(t0 + 4 * beat, 'piano', end - t0 - 4 * beat, voicing[1] + 12, 0.07);
    }
  }

  function pulse(tl, m, add) {
    const beat = tl.beat, rootNote = m.root ?? 45, prog = m.progression || [0, -4, 3, -2], pattern = m.pattern || DEFAULT_PATTERN;
    const chord = m.chord || [0, 3, 7, 12];
    for (const s of tl.scenes) {
      const e = s.energy ?? 0.5, beats = Math.round(s.len / beat);
      for (let b = 0; b < beats; b++) {
        const t = s.start + b * beat, g = Math.round(t / beat), off = prog[Math.floor(g / 4) % prog.length];
        if (g % 4 === 0) add(t, 'pad', Math.min(4 * beat, s.end - t), chord.map((c) => rootNote + 12 + off + c), 0.035 + 0.035 * e);
        if (e >= 0.3 || (e >= 0.15 && b % 2 === 0)) add(t, 'kick', 0.35, 0, 0.55 + 0.4 * e);
        if (e >= 0.5) add(t + beat / 2, 'hat', 0.06, 0, 0.12 + 0.1 * e);
        if (e >= 0.65 && g % 2 === 1) add(t, 'clap', 0.2, 0, 0.25);
        if (e >= 0.55) {
          for (let k = 0; k < 4; k++) {
            const step = pattern[(b * 4 + k) % pattern.length];
            if (step == null) continue;
            add(t + (k * beat) / 4, 'bass', (beat / 4) * 0.9, rootNote + off + step, 0.08 + 0.06 * e);
          }
        }
      }
    }
  }

  HV.buildScore = function buildScore(tl, story) {
    const m = story.music || {}, ev = [];
    const add = (t, kind, d, n, v) => { const e = { t: +t.toFixed(5), kind, d: +d.toFixed(5), n, v }; ev.push(e); return e; };
    if (!m.src && m.style !== 'none') (m.style === 'pulse' ? pulse : warm)(tl, m, add);
    for (const c of tl.sfx) ev.push({ ...c });
    return ev.sort((a, b) => a.t - b.t);
  };

  // Which cues to start for the master-time window [from, to), given the current master time `now`.
  // - On a resync (play, seek, rate change) sustained cues already sounding at `from` restart mid-way with an offset.
  // - If the scheduler fell behind (throttled or stalled frame loop, so now > from), cues whose onset was missed are
  //   never replayed late: fully expired cues are dropped, still-sounding ones join at offset now − t.
  const LATE = 0.03, TAIL = 0.05;
  HV.planAudio = function planAudio(events, from, to, resync, now = from) {
    const out = [];
    for (const ev of events) {
      if (ev.t >= to) break;
      if (ev.t >= from) {
        if (ev.t >= now - LATE) out.push({ ev, offset: 0 });
        else if (ev.t + ev.d > now + TAIL) out.push({ ev, offset: now - ev.t });
      } else if (resync && ev.t + ev.d > from + TAIL) out.push({ ev, offset: from - ev.t });
    }
    return out;
  };
  HV.planAudio.LATE = LATE;
  HV.score = { CHORDS };
})(typeof window !== 'undefined' ? window : globalThis);
