// Audio engine regression tests against a deterministic AudioContext stub (no real audio output).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const asset = (p) => new URL(`../../assets/html-video/js/${p}`, import.meta.url);
const gains = [];
const param = () => {
  const p = { value: 1, calls: [] };
  for (const m of ['cancelScheduledValues', 'setValueAtTime', 'linearRampToValueAtTime', 'setTargetAtTime']) p[m] = (...a) => { p.calls.push([m, ...a]); return p; };
  gains.push(p);
  return p;
};

function setup({ score = [], narration = [], duration = 10, clipSeconds = 2, story = {} } = {}) {
  const synthCalls = [], sources = [];
  class FakeContext {
    constructor() { this.currentTime = 100; this.state = 'running'; this.destination = {}; this.sampleRate = 48000; }
    createGain() { return { gain: param(), connect() {} }; }
    createDynamicsCompressor() { return { threshold: {}, ratio: {}, connect() {} }; }
    createBufferSource() {
      const src = { playbackRate: { value: 1 }, connect() {}, start(when, offset) { src.when = when; src.offset = offset; }, stop(at) { src.stoppedAt = at; } };
      sources.push(src);
      return src;
    }
    async decodeAudioData() { return { duration: clipSeconds }; }
    async resume() { this.state = 'running'; }
  }
  const ctx = vm.createContext({ console, Math, AudioContext: FakeContext, fetch: async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }) });
  for (const f of ['core/clock.js', 'audio/score.js', 'audio/engine.js']) vm.runInContext(readFileSync(asset(f), 'utf8'), ctx);
  ctx.HV.synth = { play(c, bus, ev, when, dur, age) { synthCalls.push({ t: ev.t, kind: ev.kind, when, dur, age, now: c.currentTime }); return []; } };
  const tl = { duration, narration, score };
  const audio = ctx.HV.createAudio(tl, story);
  return { HV: ctx.HV, audio, synthCalls, sources, tl };
}
const close = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

test('stalled frame loop: expired cues are not replayed, sustained cues resume mid-way, future cues keep their time', async () => {
  const score = [
    { t: 0, d: 0.2, kind: 'impact', v: 1 }, { t: 1, d: 0.2, kind: 'impact', v: 1 }, { t: 2.5, d: 3, kind: 'pad', v: 1 },
    { t: 3, d: 0.2, kind: 'tick', v: 1 }, { t: 4.4, d: 0.2, kind: 'impact', v: 1 },
  ];
  const { HV, audio, synthCalls } = setup({ score });
  await audio.ensure();
  const clock = HV.createClock({ duration: 10, now: () => audio.ctx.currentTime });
  clock.play(); audio.pump(clock);
  synthCalls.length = 0;
  audio.ctx.currentTime = 104; // 4 s without a pump
  audio.pump(clock);
  assert.deepEqual(synthCalls.filter((c) => c.t === 1 || c.t === 3), [], 'no stale transient replayed');
  const pad = synthCalls.find((c) => c.kind === 'pad');
  assert.ok(pad && close(pad.when, 104) && close(pad.dur, 1.5), `pad joins at offset 1.5 s: ${JSON.stringify(pad)}`);
  const next = synthCalls.find((c) => c.t === 4.4);
  assert.ok(next && close(next.when, 104.4), 'future cue keeps its scheduled time');
  synthCalls.length = 0; audio.pump(clock);
  assert.deepEqual(synthCalls, [], 'no duplicate scheduling on the next pump');
});

test('stall at 2× rate converts offsets and durations to source time', async () => {
  const { HV, audio, synthCalls } = setup({ score: [{ t: 1, d: 0.2, kind: 'tick', v: 1 }, { t: 2.5, d: 3, kind: 'pad', v: 1 }, { t: 4.4, d: 0.2, kind: 'impact', v: 1 }] });
  await audio.ensure();
  const clock = HV.createClock({ duration: 10, now: () => audio.ctx.currentTime });
  clock.setRate(2); clock.play(); audio.pump(clock);
  synthCalls.length = 0;
  audio.ctx.currentTime = 102; // master 4 s
  audio.pump(clock);
  assert.ok(!synthCalls.some((c) => c.t === 1));
  const pad = synthCalls.find((c) => c.kind === 'pad');
  assert.ok(close(pad.when, 102) && close(pad.dur, 0.75), JSON.stringify(pad));
  assert.ok(close(synthCalls.find((c) => c.t === 4.4).when, 102.2));
});

test('planAudio without a stall is unchanged and late-but-sounding cues get an offset', () => {
  const { HV } = setup();
  const ev = [{ t: 1, d: 0.2 }, { t: 2, d: 2 }, { t: 3, d: 0.1 }];
  const J = (v) => JSON.stringify(v);
  assert.equal(J(HV.planAudio(ev, 0, 4, false).map((p) => p.offset)), J([0, 0, 0]));
  assert.equal(J(HV.planAudio(ev, 0, 4, false, 3.5).map((p) => [p.ev.t, p.offset])), J([[2, 1.5]]));
  assert.equal(J(HV.planAudio(ev, 0, 4, false, 1.01).map((p) => p.offset)), J([0, 0, 0]), 'within jitter tolerance');
});

test('supplied clip: decoded once, starts on time, joins mid-way after a stall or seek, skipped when finished, stops on pause', async () => {
  const line = { id: 'tone', t: 1, d: 2, end: 3, src: 'media/tone.wav' };
  const { HV, audio, sources } = setup({ narration: [line], clipSeconds: 2 });
  await audio.ensure();
  assert.equal(audio.state().voiceClips, 1);
  const clock = HV.createClock({ duration: 10, now: () => audio.ctx.currentTime });
  clock.play(); audio.pump(clock);
  assert.equal(sources.length, 0, 'clip beyond the look-ahead window is not started yet');
  audio.ctx.currentTime = 100.5; audio.pump(clock);
  assert.equal(sources.length, 1);
  assert.ok(close(sources[0].when, 101) && sources[0].offset === 0, 'clip scheduled at its onset');

  clock.seek(0); audio.pump(clock); sources.length = 0;
  audio.ctx.currentTime += 2; audio.pump(clock); // stalled through the onset: master 2 s
  assert.ok(sources.length === 1 && close(sources[0].offset, 1) && close(sources[0].when, audio.ctx.currentTime), JSON.stringify(sources));

  clock.seek(0); audio.pump(clock); sources.length = 0;
  audio.ctx.currentTime += 5; audio.pump(clock); // stalled past the clip end
  assert.equal(sources.length, 0, 'finished clip is not replayed');

  clock.seek(2.25); audio.pump(clock);
  const s = sources.at(-1);
  assert.ok(close(s.offset, 1.25) && s.playbackRate.value === 1);
  clock.setRate(2); audio.pump(clock);
  assert.ok(sources.at(-1).playbackRate.value === 2 && close(sources.at(-1).offset, 1.25), 'rate change restarts at the same media position');
  clock.pause(); audio.pump(clock);
  assert.ok(sources.at(-1).stoppedAt !== undefined, 'pause stops the clip');
  assert.equal(audio.state().liveNodes, 0);
  assert.ok(audio.clipStarts().length >= 3);
});

test('audible time converts output latency at the current rate', () => {
  const { HV } = setup();
  let now = 0;
  const c = HV.createClock({ duration: 60, now: () => now });
  c.seek(10); c.play(); now = 2;
  assert.ok(close(c.audibleTime(0.1), 11.9));
  c.setRate(2); now = 3; // master 14
  assert.ok(close(c.time(), 14) && close(c.audibleTime(0.1), 13.8), '2×: 0.1 s output latency = 0.2 master s');
  c.setRate(0.5); now = 5; // master 15
  assert.ok(close(c.time(), 15) && close(c.audibleTime(0.1), 14.95), '0.5×: 0.1 s output latency = 0.05 master s');
  c.setRate(0.5); assert.ok(close(c.audibleTime(0.1), c.time()), 'never earlier than the latest anchor (no backward jump)');
  c.pause(); assert.equal(c.audibleTime(0.1), c.time(), 'paused frames are exact');
});

test('mix: ducking merges close narration windows, joins mid-note with its age, and fades each epoch out before stopping', async () => {
  const narration = [{ id: 'a', t: 1, d: 2, end: 3, src: 'a.mp3' }, { id: 'b', t: 4, d: 2, end: 6, src: 'b.mp3' }, { id: 'c', t: 9, d: 0.5, end: 9.5, src: 'c.mp3' }];
  const score = [{ t: 0, d: 8, kind: 'warmpad', n: [60], v: 0.05 }, { t: 2, d: 4, kind: 'piano', n: 65, v: 0.1 }];
  const { HV, audio, synthCalls, sources } = setup({ narration, score, duration: 12, story: { mix: { music: 0.6, voice: 1, effects: 0 } } });
  await audio.ensure();
  assert.deepEqual(JSON.parse(JSON.stringify(audio.duckWindows())), [[1, 6], [9, 9.5]], 'a 1 s gap does not release the duck; a 3 s gap does');
  assert.equal(audio.mix().music, 0.6);
  const clock = HV.createClock({ duration: 12, now: () => audio.ctx.currentTime });
  clock.seek(3); clock.play(); audio.pump(clock);
  const piano = synthCalls.find((c) => c.kind === 'piano');
  assert.ok(piano && Math.abs(piano.age - 1) < 1e-9 && Math.abs(piano.dur - 3) < 1e-9, `joins at age 1 s: ${JSON.stringify(piano)}`);
  const n = gains.length;
  clock.seek(7); audio.pump(clock);
  const now = audio.ctx.currentTime;
  const faded = gains.slice(0, n).filter((g) => g.calls.some(([m, v, at]) => m === 'linearRampToValueAtTime' && v === 0 && Math.abs(at - (now + 0.04)) < 1e-9));
  assert.ok(faded.length >= 3, 'previous epoch group gains ramp to zero over 40 ms');
  assert.ok(sources.filter((s) => s.stoppedAt !== undefined).every((s) => s.stoppedAt >= now + 0.04), 'sources stop only after the fade');
  audio.setMusicTrim(0.3);
  assert.equal(audio.musicTrim, 0.3);
});
