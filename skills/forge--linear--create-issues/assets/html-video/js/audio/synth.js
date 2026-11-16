// Small Web Audio instrument set: warm default voices (piano, warmpad) plus the opt-in cinematic kit and effects. Each voice returns the source nodes
// it started so the engine can stop them on pause or seek.
(function (root) {
  const HV = root.HV = root.HV || {};
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  let noise = null;
  const noiseBuf = (ctx) => {
    if (noise && noise.sampleRate === ctx.sampleRate) return noise;
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    let s = 1;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
    return noise;
  };
  const gainEnv = (ctx, out, when, v, dur, attack = 0.004) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(v, when + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(attack + 0.01, dur));
    g.connect(out);
    return g;
  };
  const osc = (ctx, type, f, when, dur, dest) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, when); o.connect(dest); o.start(when); o.stop(when + dur + 0.05); return o;
  };
  const noiseSrc = (ctx, when, dur, dest) => {
    const n = ctx.createBufferSource(); n.buffer = noiseBuf(ctx); n.loop = true; n.connect(dest); n.start(when); n.stop(when + dur + 0.05); return n;
  };

  // Warm default voices. Exact harmonic partials (no detune, so no beating), natural per-partial decay, a gentle damper
  // at the note end, and a join-in-progress path: `age` (source s since the note's onset) starts the envelope at its
  // decayed level after a short fade instead of re-attacking.
  const PARTIALS = [1, 0.42, 0.2, 0.1, 0.05, 0.025];
  function piano(ctx, out, ev, when, dur, age = 0) {
    const f0 = hz(ev.n), base = Math.max(0.8, Math.min(3.2, 2.4 * Math.pow(220 / f0, 0.35))), nodes = [];
    const fade = age > 0 ? 0.03 : 0.006, damp = 0.09;
    PARTIALS.forEach((amp, k) => {
      const f = f0 * (k + 1);
      if (f > 4500) return; // keep the top soft: nothing harsh above ~4.5 kHz
      const tau = base / (1 + 0.7 * k), level = ev.v * amp * Math.exp(-age / tau) * 0.5;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(level, when + fade);
      g.gain.setTargetAtTime(0, when + fade, tau);
      g.gain.setTargetAtTime(0, when + Math.max(fade, dur - damp), damp / 3);
      g.connect(out);
      nodes.push(osc(ctx, 'sine', f, when, dur + 0.2, g));
    });
    return nodes;
  }
  function warmpad(ctx, out, ev, when, dur, age = 0) {
    const g = ctx.createGain(), full = dur + age, atk = Math.min(2, full / 3), rel = Math.min(1.6, full / 3);
    const inAtk = Math.max(0, atk - age), start = age > 0 ? Math.min(1, age / atk) * ev.v : 0;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(age > 0 ? start : 0.0001, when + 0.03);
    g.gain.linearRampToValueAtTime(ev.v, when + Math.max(0.04, inAtk));
    g.gain.setValueAtTime(ev.v, when + Math.max(0.05, inAtk, dur - rel));
    g.gain.linearRampToValueAtTime(0, when + dur);
    g.connect(out);
    return ev.n.flatMap((n) => [[1, 1], [2, 0.12]].map(([h, a]) => {
      const p = ctx.createGain(); p.gain.value = a; p.connect(g);
      return osc(ctx, 'sine', hz(n) * h, when, dur, p);
    }));
  }

  const VOICES = {
    piano, warmpad,
    kick(ctx, out, ev, when, dur) {
      const g = gainEnv(ctx, out, when, ev.v, Math.min(dur, 0.35)), o = osc(ctx, 'sine', 140, when, 0.35, g);
      o.frequency.exponentialRampToValueAtTime(42, when + 0.12);
      return [o];
    },
    hat(ctx, out, ev, when, dur) {
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
      f.connect(gainEnv(ctx, out, when, ev.v, Math.min(dur, 0.06), 0.001));
      return [noiseSrc(ctx, when, 0.08, f)];
    },
    clap(ctx, out, ev, when, dur) {
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 1.2;
      f.connect(gainEnv(ctx, out, when, ev.v, Math.min(dur, 0.2), 0.002));
      return [noiseSrc(ctx, when, 0.22, f)];
    },
    bass(ctx, out, ev, when, dur) {
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 12;
      f.frequency.setValueAtTime(2200, when); f.frequency.exponentialRampToValueAtTime(260, when + Math.max(0.05, dur));
      f.connect(gainEnv(ctx, out, when, ev.v, dur, 0.003));
      return [osc(ctx, 'sawtooth', hz(ev.n), when, dur, f)];
    },
    pad(ctx, out, ev, when, dur) {
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400;
      const g = ctx.createGain(), atk = Math.min(0.4, dur / 3);
      g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(ev.v, when + atk);
      g.gain.setValueAtTime(ev.v, when + Math.max(atk, dur - 0.3)); g.gain.linearRampToValueAtTime(0, when + dur);
      f.connect(g); g.connect(out);
      return ev.n.flatMap((n) => [-8, 8].map((det) => { const o = osc(ctx, 'sawtooth', hz(n), when, dur, f); o.detune.value = det; return o; }));
    },
    impact(ctx, out, ev, when) {
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(5000, when); f.frequency.exponentialRampToValueAtTime(200, when + 0.6);
      f.connect(gainEnv(ctx, out, when, 0.35 * ev.v, 0.7, 0.002));
      const o = osc(ctx, 'sine', 90, when, 0.6, gainEnv(ctx, out, when, 0.6 * ev.v, 0.6));
      o.frequency.exponentialRampToValueAtTime(35, when + 0.5);
      return [noiseSrc(ctx, when, 0.7, f), o];
    },
    tick(ctx, out, ev, when) {
      return [osc(ctx, 'square', 1320 * Math.pow(2, ((ev.n || 0) % 5) / 12), when, 0.06, gainEnv(ctx, out, when, 0.05 * ev.v, 0.06, 0.001))];
    },
    whoosh(ctx, out, ev, when, dur) {
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
      f.frequency.setValueAtTime(300, when); f.frequency.exponentialRampToValueAtTime(6000, when + Math.max(0.1, dur));
      f.connect(gainEnv(ctx, out, when, 0.25 * ev.v, dur, Math.min(0.3, dur / 2)));
      return [noiseSrc(ctx, when, dur, f)];
    },
  };

  // dur and age are already in source seconds (master ÷ rate); pitch stays the same at non-1× rates
  HV.synth = {
    kinds: Object.keys(VOICES),
    play(ctx, out, ev, when, dur, age = 0) { const voice = VOICES[ev.kind]; return voice ? voice(ctx, out, ev, when, dur, age) : []; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
