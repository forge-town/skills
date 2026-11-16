// Deterministic checks for the HTML-video core: lifetimes, boundaries, seeking, clock, audio planning.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { scriptFromSpec, storyFromScript } from './create-video.mjs';
const storyFromSpec = (sp, lang) => storyFromScript(scriptFromSpec(sp, lang));

const asset = (p) => new URL(`../../assets/html-video/js/${p}`, import.meta.url);
function load(story) {
  const ctx = vm.createContext({ console, Math });
  for (const f of ['core/util.js', 'core/clock.js', 'audio/score.js', 'core/timeline.js', 'visual/particles.js', 'data/story.js']) vm.runInContext(readFileSync(asset(f), 'utf8'), ctx);
  const HV = ctx.HV;
  return { HV, tl: HV.buildTimeline(story || HV.story) };
}
const spec = JSON.parse(readFileSync(new URL('../../assets/issue-html/example.spec.json', import.meta.url), 'utf8'));
const W = 1600, H = 900;

test('bundled example story builds a clean timeline', () => {
  const { tl } = load();
  assert.deepEqual([...tl.errors], []);
  assert.ok(tl.duration > 20 && tl.scenes.length >= 5);
  tl.scenes.forEach((s, i) => { if (i) assert.equal(s.start, tl.scenes[i - 1].end); });
});

test('scene boundaries: exactly one live scene, switching at start', () => {
  const { tl } = load();
  for (const s of tl.scenes.slice(1)) {
    assert.equal(tl.sceneAt(s.start - 1e-4), s.index - 1);
    assert.equal(tl.sceneAt(s.start), s.index);
    const before = tl.frameAt(s.start - 0.02), after = tl.frameAt(s.start + 0.02);
    assert.ok(before.alpha < 0.05, `${s.id}: previous scene fades out before the cut`);
    assert.ok(after.alpha < 0.05, `${s.id}: next scene fades in from zero`);
  }
  assert.equal(tl.sceneAt(tl.duration + 5), tl.scenes.length - 1);
  assert.equal(tl.frameAt(-3).t, 0);
});

test('particles never lead their reveal front or their item reveal', () => {
  const { HV, tl } = load();
  for (const s of tl.scenes) {
    for (let t = s.start; t < s.end; t += 0.05) {
      const f = tl.frameAt(t), n = HV.particles.compute(f, W, H);
      const xs = HV.particles.buf.x.slice(0, n);
      if (s.particles && s.particles.mode === 'stream') for (const x of xs) assert.ok(x <= HV.particles.front(f, W) + 1e-3, `${s.id} t=${t.toFixed(2)} leaked x=${x}`);
      if (s.particles && s.particles.mode === 'converge' && f.local < s.reveals[0] - s.start) assert.equal(n, 0, `${s.id}: particles before first item reveal`);
    }
    const f0 = tl.frameAt(s.start + 1e-3);
    if (s.particles && s.particles.mode === 'stream') {
      const n0 = HV.particles.compute(f0, W, H);
      assert.ok(n0 === 0 || Math.max(...HV.particles.buf.x.slice(0, n0)) < 0, `${s.id}: nothing visible on screen at the first frame`);
    }
  }
});

test('frame evaluation is pure: seeking in any order gives identical frames', () => {
  const { HV, tl } = load();
  const snap = (t) => { const f = tl.frameAt(t), n = HV.particles.compute(f, W, H); return [f.scene.id, n, ...HV.particles.buf.x.slice(0, n), ...HV.particles.buf.a.slice(0, n)].join(','); };
  const times = [0.5, 9.9, 3.3, tl.duration - 0.1, 9.9, 0.5, 21.7];
  const first = times.map(snap), second = [...times].reverse().map(snap).reverse();
  assert.deepEqual(first, second);
});

test('master clock: pause/resume, seek, restart and rate changes never accumulate drift', () => {
  const { HV, tl } = load();
  let now = 100;
  const c = HV.createClock({ duration: tl.duration, now: () => now });
  c.play(); now += 2; assert.ok(Math.abs(c.time() - 2) < 1e-9);
  c.pause(); now += 5; assert.ok(Math.abs(c.time() - 2) < 1e-9);
  c.play(); now += 1; assert.ok(Math.abs(c.time() - 3) < 1e-9);
  c.setRate(2); now += 1; assert.ok(Math.abs(c.time() - 5) < 1e-9);
  assert.ok(Math.abs(c.sourceTimeOf(7) - (now + 1)) < 1e-9, 'audio mapping follows the same anchor');
  c.setRate(0.5); now += 2; assert.ok(Math.abs(c.time() - 6) < 1e-9);
  const e = c.epoch; c.seek(10); assert.equal(c.epoch, e + 1); now += 1; assert.ok(Math.abs(c.time() - 10.5) < 1e-9);
  // 10 000 tiny frames at 1.5× land exactly where one big step lands
  c.setRate(1.5); const t0 = c.time(); for (let i = 0; i < 10000; i++) { now += 0.0001; c.time(); }
  assert.ok(Math.abs(c.time() - (t0 + 1.5)) < 1e-6);
  now += 1000; assert.equal(c.time(), tl.duration); assert.ok(c.ended());
  c.restart(); assert.equal(c.time(), 0); assert.ok(c.playing);
  c.setSource(() => 5); assert.equal(c.time(), 0);
});

test('audio plan: windows tile without gaps or duplicates, and resync resumes sustained cues', () => {
  const { HV, tl } = load();
  const all = tl.score;
  let seen = 0;
  for (let a = 0; a < tl.duration; a += 0.37) seen += HV.planAudio(all, a, Math.min(tl.duration, a + 0.37), false).length;
  assert.equal(seen, all.filter((e) => e.t < tl.duration).length);
  const pad = all.find((e) => e.kind === 'warmpad' && e.t > 5);
  const mid = pad.t + pad.d / 2, plan = HV.planAudio(all, mid, mid + 0.5, true);
  const resumed = plan.find((p) => p.ev === pad);
  assert.ok(resumed && Math.abs(resumed.offset - pad.d / 2) < 1e-9);
});

test('default score is continuous, consonant and resolved; cut effects exist only in the opt-in cinematic style', () => {
  const { HV, tl } = load();
  assert.ok(tl.score.length && !tl.score.some((e) => ['impact', 'tick', 'whoosh', 'kick', 'hat', 'clap', 'bass'].includes(e.kind)), 'no percussion or cut effects by default');
  for (const s of tl.scenes.slice(1)) assert.ok(tl.score.some((e) => e.t < s.start - 0.05 && e.t + e.d > s.start + 0.05), `${s.id}: music sustains through the cut`);
  const music = tl.score.filter((e) => e.kind === 'piano' || e.kind === 'warmpad'), root = HV.story.music.root;
  const scale = new Set([0, 2, 4, 5, 7, 9, 11].map((x) => (root + x) % 12));
  for (const e of music) for (const n of [].concat(e.n)) assert.ok(scale.has(n % 12), `note ${n} stays in the key`);
  const notes = music.flatMap((e) => [].concat(e.n));
  assert.ok(Math.max(...notes) <= 84 && Math.min(...notes) >= 36, 'no harsh highs or rumbling lows');
  for (const e of music) assert.ok(e.t >= 0 && e.t + e.d <= tl.duration + 1e-6, 'nothing outlives the film');
  const lastStart = Math.max(...music.map((e) => e.t)), last = music.filter((e) => e.t > lastStart - 1);
  assert.ok(last.every((e) => [].concat(e.n).every((n) => [0, 4, 7].includes((n - root + 120) % 12))), 'ends on the tonic chord');
  for (let i = 0; i < music.length; i++) for (let j = i + 1; j < music.length && music[j].t < music[i].t + music[i].d; j++)
    if (music[i].kind === 'piano' && music[j].kind === 'piano' && music[i].n === music[j].n) assert.ok(music[i].t + music[i].d - music[j].t <= 0.05 + 1e-9, 're-struck pitches damp the previous note (≤ 50 ms release overlap)');
  const cine = HV.buildTimeline({ ...HV.story, effects: 'cinematic', music: { style: 'pulse', bpm: 96 }, scenes: HV.story.scenes.map((s) => ({ ...s, energy: 0.6 })) });
  for (const s of cine.scenes.slice(1)) assert.ok(cine.score.some((e) => e.kind === 'impact' && Math.abs(e.t - s.start) < 1e-9));
  for (const s of cine.scenes) for (const r of s.reveals) assert.ok(cine.score.some((e) => e.kind === 'tick' && Math.abs(e.t - r) < 1e-9));
  assert.ok(cine.score.some((e) => e.kind === 'bass'), 'pulse score remains available on request');
});

test('narration clips must fit their scene; captions follow the master time', () => {
  const story = storyFromSpec(spec, 'en');
  const { tl } = load(story);
  assert.deepEqual([...tl.errors], []);
  const line = tl.narration[1];
  assert.equal(tl.captionAt(line.t + 0.01), line.text);
  assert.equal(tl.captionAt(line.t - 0.01), '');
  const bad = structuredClone(story); bad.narration[0].dur = 999;
  assert.ok(load(bad).tl.errors.some((e) => e.includes('must fit')));
  assert.ok(story.narration.every((n) => n.src === null), 'demo does not pretend to have recorded voice');
});

test('story generator only uses approved spec content', () => {
  const story = storyFromSpec(spec, 'zh');
  const tasks = story.scenes.find((s) => s.id === 'overview');
  assert.deepEqual(tasks.items.map((i) => i.label), spec.langs.zh.tasks.map((t) => t.name));
  assert.equal(story.scenes.find((s) => s.id === 'flow').items.join('|'), spec.langs.zh.userFlow.join('|'));
  assert.throws(() => storyFromSpec({ ...spec, langs: { zh: spec.langs.zh } }, 'en'));
});
