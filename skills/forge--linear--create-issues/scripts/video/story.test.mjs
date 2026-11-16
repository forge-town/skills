// Per-task coverage, bilingual parity and voice-duration-driven timing for generated story videos.
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
import { scriptFromSpec, storyFromScript, validateNarration, LEAD, TAIL, BREATH } from './create-video.mjs';
import { mp3Duration } from './audio-meta.mjs';
import { distinctAcIds } from './story-text.mjs';

const base = JSON.parse(readFileSync(new URL('../../assets/issue-html/example.spec.json', import.meta.url), 'utf8'));
const asset = (p) => new URL(`../../assets/html-video/js/${p}`, import.meta.url);
function withTasks(n) {
  const s = structuredClone(base);
  delete s.video;
  for (const lang of ['zh', 'en']) {
    const l = s.langs[lang], extra = { id: 'T4', name: lang === 'zh' ? '停用渠道并保留历史记录的确认流程' : 'Disable a channel with a confirmation step that keeps its history', points: 4, items: [lang === 'zh' ? '停用前显示确认 Dialog' : 'Show a confirmation dialog before disabling'] };
    l.tasks = n === 4 ? [...l.tasks, extra] : l.tasks.slice(0, n);
    l.acs = n === 4 ? [...l.acs, { ...l.acs[0], id: 'AC-06', task: 'T4', summary: lang === 'zh' ? '确认后渠道显示为停用' : 'The channel shows as disabled after confirming' }] : l.acs.filter((a) => l.tasks.some((t) => t.id === a.task));
  }
  return s;
}
function timeline(story) {
  const ctx = vm.createContext({ console, Math });
  for (const f of ['core/util.js', 'audio/score.js', 'core/timeline.js']) vm.runInContext(readFileSync(asset(f), 'utf8'), ctx);
  return ctx.HV.buildTimeline(JSON.parse(JSON.stringify(story)));
}
// minimal MPEG-2 Layer III stream: 24 kHz, 48 kbps mono, 144-byte frames of 576 samples (24 ms each)
function fakeMp3(seconds) {
  const frames = Math.round(seconds / 0.024), f = Buffer.alloc(144);
  f[0] = 0xff; f[1] = 0xf3; f[2] = 0x64; f[3] = 0xc0;
  const id3 = Buffer.from([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 10, ...Buffer.alloc(10)]);
  return Buffer.concat([id3, ...Array.from({ length: frames }, () => f)]);
}

for (const n of [1, 2, 3, 4]) {
  for (const lang of ['zh', 'en']) {
    test(`${n} tasks / ${lang}: every Task ID and full name appears in overview, its own scene, chapters and narration, in order`, () => {
      const spec = withTasks(n), tasks = spec.langs[lang].tasks, script = scriptFromSpec(spec, lang), story = storyFromScript(script);
      const overview = story.scenes.find((s) => s.id === 'overview');
      assert.deepEqual(overview.items.map((i) => i.label), tasks.map((t) => t.name));
      assert.deepEqual(overview.items.map((i) => i.tag.split(' · ')[0]), tasks.map((t) => t.id));
      const own = story.scenes.filter((s) => s.task);
      assert.deepEqual(own.map((s) => [s.task, s.headline]), tasks.map((t) => [t.id, t.name]));
      own.forEach((s, i) => {
        const t = tasks[i];
        assert.ok(s.items.some((it) => it.label === t.items[0]), 'scene shows approved task items');
        const keep = distinctAcIds(spec, t.id);
        for (const a of spec.langs[lang].acs.filter((x) => x.task === t.id)) assert.equal(s.items.some((it) => it.tag === a.id && it.label === a.summary), keep.includes(a.id), `${a.id} shown only if distinct`);
        const line = story.narration.find((l) => l.scene === s.id);
        assert.ok(line.text.includes(t.id) && line.text.includes(t.name.replace(/[。.]$/, '')), `narration names ${t.id}`);
      });
      const tl = timeline(story);
      assert.deepEqual([...tl.errors], []);
      const chapterTasks = tl.chapters.filter((c) => /^T\d/.test(c.label)).map((c) => c.label);
      assert.deepEqual(chapterTasks, tasks.map((t) => `${t.id} · ${t.name}`));
      const ovLine = story.narration.find((l) => l.scene === 'overview').text;
      let pos = -1;
      for (const t of tasks) { const at = ovLine.indexOf(t.id); assert.ok(at > pos, `${t.id} in order in the overview narration`); pos = at; }
    });
  }
}

test('zh and en stories have the same scenes, tasks and AC tags (one language per video)', () => {
  const zh = storyFromScript(scriptFromSpec(base, 'zh')), en = storyFromScript(scriptFromSpec(base, 'en'));
  assert.deepEqual(zh.scenes.map((s) => s.id), en.scenes.map((s) => s.id));
  assert.deepEqual(zh.scenes.map((s) => (s.items || []).map((i) => i.tag && i.tag.startsWith('AC') ? i.tag : '').join()), en.scenes.map((s) => (s.items || []).map((i) => i.tag && i.tag.startsWith('AC') ? i.tag : '').join()));
  assert.equal(zh.ui.htmlLang, 'zh-CN'); assert.equal(en.ui.htmlLang, 'en');
  assert.notEqual(zh.ui.poster, en.ui.poster);
  assert.ok(/[一-鿿]/.test(zh.narration[3].text) && !/[一-鿿]/.test(en.narration[3].text.replace(/“.*?”/g, '')));
});

test('scene length follows the measured voice plus breath (no beat grid); items reveal before they are spoken; clips never overlap or cross scenes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vo-')), script = scriptFromSpec(base, 'zh');
  const lengths = script.clips.map((c, i) => 3 + i * 2.3); // includes clips far longer than the old fixed scenes
  // one provider cue spanning each whole clip, so phrase timing is interpolated from text position
  const clips = script.clips.map((c, i) => { writeFileSync(join(dir, `${c.id}.mp3`), fakeMp3(lengths[i])); return { ...c, file: `${c.id}.mp3`, cues: [{ at: 0, dur: lengths[i], text: c.text }] }; });
  assert.ok(Math.abs(mp3Duration(readFileSync(join(dir, clips[0].file))).duration - 3) < 0.025);
  const story = storyFromScript(script, { narration: { lang: 'zh', synthetic: true, clips, voice: 'test-voice', provider: 'test', rate: '+0%' }, mediaDir: dir });
  const tl = timeline(story);
  assert.deepEqual([...tl.errors], []);
  const nominal = [];
  tl.scenes.forEach((s, i) => {
    const line = tl.narration.find((l) => l.scene === s.id), measured = mp3Duration(readFileSync(join(dir, clips[i].file))).duration;
    assert.ok(Math.abs(line.d - measured) < 1e-3, 'narration duration = measured MP3 duration');
    const breath = s.task ? (s.id === tl.scenes.filter((x) => x.task).at(-1).id ? BREATH.lastTask : BREATH.task) : BREATH[s.id] ?? TAIL;
    const shot = s.visuals?.at(-1), need = Math.max(LEAD + measured + breath, shot ? shot.at + 2.4 : 0);
    assert.ok(s.len >= need - 1e-3, `${s.id}: scene holds the whole clip plus breath and the last shot`);
    assert.ok(s.len <= Math.max(need, shot ? shot.at + 6 : 0) + 1e-3, `${s.id}: no padding beyond voice, breath and readable shot time`);
    assert.ok(line.end <= s.end - 1 + 1e-9, `${s.id}: clip ends ≥ 1 s before the scene cut`);
    nominal.push(s.len);
    s.reveals.forEach((r, k) => {
      const label = typeof s.items[k] === 'string' ? s.items[k] : s.items[k].label, norm = (x) => x.replace(/[^\p{L}\p{N}]/gu, '');
      const spokenAt = line.t + line.d * norm(line.text).indexOf(norm(label)) / norm(line.text).length;
      assert.ok(r >= s.start && r <= spokenAt + 1e-3, `${s.id} item ${k} appears before it is spoken (${r.toFixed(2)} vs ${spokenAt.toFixed(2)})`);
      if (k) assert.ok(r > s.reveals[k - 1], 'reveals keep their order');
    });
  });
  assert.ok(new Set(nominal.map((x) => x.toFixed(2))).size > tl.scenes.length / 2, 'scene lengths vary with their narration, not one-size');
  const lines = [...tl.narration].sort((a, b) => a.t - b.t);
  for (let i = 1; i < lines.length; i++) assert.ok(lines[i].t >= lines[i - 1].end, 'no overlapping voice clips');
  assert.equal(tl.captionAt(lines[2].t + 0.2), clips[2].cues[0].text, 'captions follow provider cues on the same timeline');
  assert.equal(story.voice.synthetic, true);
  assert.match(story.voiceNote, /合成|synthetic/);
});

function fullManifest(lang, script = scriptFromSpec(base, lang)) {
  const dir = mkdtempSync(join(tmpdir(), 'man-'));
  const clips = script.clips.map((c) => { writeFileSync(join(dir, `${c.id}.mp3`), fakeMp3(2)); return { ...c, file: `${c.id}.mp3`, cues: [] }; });
  return { dir, script, manifest: { lang, voice: 'test-voice', synthetic: true, provider: 'test', rate: '+0%', clips } };
}
const rejects = (fn, re) => assert.throws(fn, (e) => re.test(e.message), re);

test('narrated build rejects partial, duplicate, wrong-language, stale, extra or unusable manifests (no silent fallback)', () => {
  const { dir, script, manifest } = fullManifest('en');
  assert.doesNotThrow(() => storyFromScript(script, { narration: manifest, mediaDir: dir }));
  const variant = (f) => { const m = structuredClone(manifest); f(m); return () => storyFromScript(script, { narration: m, mediaDir: dir }); };
  rejects(variant((m) => { m.clips = m.clips.filter((c) => c.id !== 'vo-task-t2'); }), /missing clip vo-task-t2/);
  rejects(variant((m) => { m.clips.push({ ...m.clips[4] }); }), /appears 2 times/);
  rejects(variant((m) => { m.lang = 'zh'; }), /language "zh" does not match/);
  rejects(variant((m) => { m.clips[5].text = 'An older wording of this task.'; }), /vo-task-t2 text is stale/);
  rejects(variant((m) => { m.clips.push({ ...m.clips[0], id: 'vo-task-t9', scene: 'task-t9' }); }), /does not belong/);
  rejects(variant((m) => { m.clips[3].file = 'missing.mp3'; }), /unusable/);
  rejects(variant((m) => { m.clips[3].scene = 'intro'; }), /expected overview/);
  assert.doesNotThrow(() => storyFromScript(script), 'low-level story model supports caption-only previews; CLI output requires an explicit choice');
});

test('CLI requires narration, preserves script export and only writes caption-only players with an explicit opt-out', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'video-cli-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const spec = withTasks(2), specPath = join(dir, 'spec.json'), out = join(dir, 'video');
  writeFileSync(specPath, JSON.stringify(spec));
  const cli = new URL('./create-video.mjs', import.meta.url);
  const run = (...args) => spawnSync(process.execPath, [fileURLToPath(cli), specPath, ...args], { encoding: 'utf8' });
  const missing = run('--out', out);
  assert.equal(missing.status, 2); assert.match(missing.stderr, /Narration is required/);
  assert.equal(existsSync(out), false, 'missing voice must not leave a player that looks complete');
  const scriptPath = join(dir, 'script.json'), exportOnly = run('--script-out', scriptPath);
  assert.equal(exportOnly.status, 0); assert.ok(JSON.parse(readFileSync(scriptPath)).clips.length > 2);
  const silent = run('--out', out, '--no-narration');
  assert.equal(silent.status, 0, silent.stderr);
  assert.match(readFileSync(join(out, 'js/data/story.js'), 'utf8'), /"voice":null/);
  const conflict = run('--out', join(dir, 'conflict'), '--narration', 'missing.json', '--no-narration');
  assert.equal(conflict.status, 2); assert.match(conflict.stderr, /not both/);
});

test('CLI packages embedded audio and portable MP3s with measured durations; a stale manifest cannot overwrite a player', (t) => {
  const { dir, manifest } = fullManifest('en');
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const spec = structuredClone(base); delete spec.video;
  const specPath = join(dir, 'spec.json'), manPath = join(dir, 'manifest.json'), out = join(dir, 'video');
  writeFileSync(specPath, JSON.stringify(spec)); writeFileSync(manPath, JSON.stringify(manifest));
  const run = () => spawnSync(process.execPath, [fileURLToPath(new URL('./create-video.mjs', import.meta.url)), specPath,
    '--lang', 'en', '--out', out, '--narration', manPath, '--force'], { encoding: 'utf8' });
  const result = run(); assert.equal(result.status, 0, result.stderr);
  const bundled = JSON.parse(readFileSync(join(out, 'media/manifest.json'))), ctx = vm.createContext({});
  vm.runInContext(readFileSync(join(out, 'js/data/media.js'), 'utf8'), ctx);
  assert.equal(Object.keys(ctx.HV.media).length, manifest.clips.length);
  for (const clip of bundled.clips) {
    const original = readFileSync(join(dir, clip.file));
    assert.deepEqual(readFileSync(join(out, 'media', clip.file)), original);
    assert.deepEqual(Buffer.from(ctx.HV.media[`media/${clip.file}`].split(',')[1], 'base64'), original);
    assert.ok(Math.abs(clip.duration - mp3Duration(original).duration) < .001);
  }
  const before = readFileSync(join(out, 'js/data/story.js'));
  manifest.clips[0].text = 'stale'; writeFileSync(manPath, JSON.stringify(manifest));
  const stale = run(); assert.notEqual(stale.status, 0); assert.match(stale.stderr, /text is stale/);
  assert.deepEqual(readFileSync(join(out, 'js/data/story.js')), before);
});

test('provider sentence overlaps and trailing overshoot are capped to actual clip duration without changing starts or text', (t) => {
  const { dir, script, manifest } = fullManifest('zh');
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const clip = manifest.clips[0];
  clip.cues = [{ at: .1, dur: 1.05, text: 'first sentence' }, { at: 1.1, dur: 1.5, text: 'second sentence' }];
  const story = storyFromScript(script, { narration: manifest, mediaDir: dir }), line = story.narration[0];
  assert.deepEqual(line.cues.map((c) => [c.at, c.text]), clip.cues.map((c) => [c.at, c.text]));
  assert.ok(line.cues[0].at + line.cues[0].dur <= line.cues[1].at);
  assert.ok(Math.abs(line.cues[1].at + line.cues[1].dur - line.dur) < .001);
});

test('reviewed narration overrides keep task coverage and must match the manifest text', () => {
  const t1 = base.langs.zh.tasks[0];
  const text = `第一项任务，${t1.id}：${t1.name}。管理员可以在列表看到名称、类型和状态，也可以从行操作菜单打开详情抽屉。`;
  const script = scriptFromSpec(base, 'zh', { overrides: { 'task-t1': text } });
  assert.equal(script.clips.find((c) => c.id === 'vo-task-t1').text, text);
  assert.ok(script.clips.find((c) => c.id === 'vo-task-t1').override);
  assert.throws(() => scriptFromSpec(base, 'zh', { overrides: { 'task-t1': '第一项任务：查看列表。' } }), /must say T1/);
  assert.throws(() => scriptFromSpec(base, 'zh', { overrides: { 'task-t7': '…' } }), /unknown scene/);
  assert.throws(() => scriptFromSpec(base, 'zh', { overrides: { overview: 'T2，从内置目录添加渠道；T1，查看渠道列表与详情；T3，自定义渠道表单与校验' } }), /in order/);
  const { dir, manifest } = fullManifest('zh');
  assert.throws(() => validateNarration(script, manifest, dir), /vo-task-t1 text is stale/, 'old audio cannot back a reviewed override');
});

test('task scenes say scope once: ACs that restate a scope item are dropped in both languages, distinct ones kept', () => {
  assert.deepEqual(distinctAcIds(base, 'T1'), []);
  assert.deepEqual(distinctAcIds(base, 'T2'), ['AC-03']);
  assert.deepEqual(distinctAcIds(base, 'T3'), ['AC-05']);
  for (const lang of ['zh', 'en']) {
    const sc = scriptFromSpec(base, lang), t1 = sc.clips.find((c) => c.id === 'vo-task-t1').text;
    assert.doesNotMatch(t1, /验收|Acceptance/, 'T1 has no acceptance sentence: both its ACs restate scope');
    for (const a of base.langs[lang].acs.filter((x) => x.task === 'T1')) assert.ok(!t1.includes(a.summary.replace(/[。.]$/, '')), `T1 narration does not re-read ${a.id}`);
    assert.ok(sc.clips.find((c) => c.id === 'vo-task-t2').text.includes(base.langs[lang].acs[2].summary.replace(/^[A-Z]/, (ch) => ch.toLowerCase()).replace(/[。.]$/, '')), 'distinct AC-03 is explained');
    const tags = sc.scenes.filter((x) => x.task).map((x) => x.items.filter((i) => /^AC/.test(i.tag)).map((i) => i.tag).join());
    assert.deepEqual(tags, ['', 'AC-03', 'AC-05']);
  }
});

test('narrative polish: grammatical zh story line, no repeated "so that" in the outcome, intro does not repeat the zh title', () => {
  const zh = scriptFromSpec(base, 'zh'), en = scriptFromSpec(base, 'en'), say = (sc, id) => sc.clips.find((c) => c.id === id).text;
  assert.match(say(zh, 'vo-story'), /希望.*，这样/);
  assert.doesNotMatch(say(zh, 'vo-story'), /，从而新的/);
  for (const [sc, lang] of [[zh, 'zh'], [en, 'en']]) {
    const so = base.langs[lang].story.so.replace(/[。.]$/, '');
    assert.ok(!say(sc, 'vo-outcome').includes(so), `${lang} outcome does not repeat the story outcome`);
    assert.ok(say(sc, 'vo-outcome').includes(base.langs[lang].nonGoals[0].replace(/^[A-Z]/, (c) => c.toLowerCase())), `${lang} outcome states non-goals`);
  }
  assert.ok(!say(zh, 'vo-intro').includes('作为运营管理员'), 'zh intro does not read the user-story title before the story scene');
  assert.match(say(zh, 'vo-flow'), /先.*再.*最后/);
});

test('provenance label derives from the input and every scene has a calm text area particles respect', () => {
  assert.equal(storyFromScript(scriptFromSpec(base, 'en')).sourceIssue, 'fictional demo spec');
  const real = structuredClone(base); delete real.demoNotice; delete real.$comment;
  assert.equal(storyFromScript(scriptFromSpec(real, 'en')).sourceIssue, 'approved issue spec');
  const story = storyFromScript(scriptFromSpec(base, 'zh')), tl = timeline(story);
  const ctx = vm.createContext({ console, Math });
  for (const f of ['core/util.js', 'visual/particles.js']) vm.runInContext(readFileSync(asset(f), 'utf8'), ctx);
  const P = ctx.HV.particles;
  for (const sc of tl.scenes) {
    assert.ok(Array.isArray(sc.quiet) && sc.quiet.length === 4, `${sc.id} has a quiet area`);
    const [x0, y0, x1, y1] = sc.quiet.map((v, i) => v * (i % 2 ? 900 : 1600));
    for (let t = sc.start + 0.2; t < sc.end; t += 0.9) {
      const n = P.compute(tl.frameAt(t), 1600, 900);
      for (let i = 0; i < n; i++) if (P.buf.x[i] >= x0 && P.buf.x[i] <= x1 && P.buf.y[i] >= y0 && P.buf.y[i] <= y1) assert.ok(P.buf.a[i] <= 0.06 + 1e-6, `${sc.id}: particle under copy`);
    }
  }
});
