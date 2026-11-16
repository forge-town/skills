// Approved issue spec → a per-language story-video folder (copy of assets/html-video + js/data/story.js + media.js).
// Only approved fields feed it: title, product/domain, background, user story, every Task (ID, name, items, its ACs),
// user flow and non-goals. Every Task gets an overview node and its own chapter.
// Steps:
//   1) node create-video.mjs <spec.json> --lang zh|en --script-out <script.json>       (narration text per scene)
//   2) <venv>/bin/python narrate.py <script.json> --out <media-dir>                   (default synthetic female voice)
//   3) node create-video.mjs <spec.json> --lang zh|en --out <dir> --narration <media-dir>/manifest.json
//        [--theme calm|acid|dusk] [--alt <href-to-other-language>] [--overrides <reviewed.json>] [--force]
// Default theme `calm`: narration-led timing, gentle fades, continuous backdrop, warm piano score, no effects.
// `acid`/`dusk` are explicitly requested cinematic looks (particles, beams, cut effects, pulse score).
// A player build requires --narration; --no-narration is an explicit opt-out for a user-requested caption-only video.
// The voice manifest must cover every scene exactly once with current text; anything else is rejected (no silent fallback).
// --overrides: reviewed per-scene narration { "<scene-id>": "text" }; task scenes must still name their ID and name.
import { readFileSync, writeFileSync, cpSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mp3Duration } from './audio-meta.mjs';
import { WORDS, UI_TEXT, distinctAcIds } from './story-text.mjs';
import { taskVisuals, timeVisuals, locate } from './task-visuals.mjs';

const TEMPLATE = fileURLToPath(new URL('../../assets/html-video/', import.meta.url));
const L = (v, lang) => (v == null ? '' : typeof v === 'string' ? v : v[lang] ?? '');
// LEAD: the voice starts once the scene has faded in. TAIL: minimum breath after a clip; scenes that close a section
// breathe longer (BREATH). BPM only drives the opt-in cinematic pulse score.
export const BPM = 96, LEAD = 0.7, TAIL = 1.0, MIN_SCENE = 3;
export const BREATH = { intro: 1.2, problem: 1.0, story: 1.5, overview: 1.5, task: 1.3, lastTask: 1.7, flow: 1.2, outcome: 1.4, end: 2.6 };
export const CINEMATIC = new Set(['acid', 'dusk']);
// calm text areas (normalized x0, y0, x1, y1): particles fade to 6 % and beams are clipped out inside them
export const QUIET = { left: [0.04, 0.14, 0.84, 0.82], center: [0.1, 0.22, 0.9, 0.76], nodes: [0, 0.54, 1, 0.82] };

// scene definitions without timing; narration text is written for listening, not read off the bullets
export function scriptFromSpec(spec, lang = 'zh', { overrides = null, theme = 'calm' } = {}) {
  const s = spec.langs[lang];
  if (!s) throw new Error(`spec has no ${lang} content (mode ${spec.mode})`);
  if (s.tasks.length < 1 || s.tasks.length > 4) throw new Error('1–4 tasks are supported');
  const visualMap = taskVisuals(spec, lang, { tone: CINEMATIC.has(theme) ? 'dark' : 'light' });
  const w = WORDS[lang], title = L(spec.title, lang).replace(/^(\[[^\]]+\])+/, '').trim(), n = s.tasks.length;
  const first = (text) => (Array.isArray(text) ? text[0] : text || '').split(/(?<=[。！？.!?])\s*/)[0];
  // only ACs that add a behavior beyond the task's own scope items (same decision for every language)
  const acsOf = (t) => { const keep = distinctAcIds(spec, t.id); return s.acs.filter((a) => a.task === t.id && keep.includes(a.id)); };
  const scenes = [
    { id: 'intro', chapter: w.ch.intro, layout: 'center', energy: 0.2, mist: 0.55, kicker: `${spec.meta.product} · ${spec.meta.domain}`, headline: title,
      particles: { mode: 'burst', count: 420 }, say: w.intro(spec, title, n) },
    s.background && { id: 'problem', chapter: w.ch.problem, layout: 'left', energy: 0.3, mist: 0.35, kicker: w.background, ...(Array.isArray(s.background) ? { items: s.background } : { headline: first(s.background) }),
      particles: { mode: 'drift', count: 140 }, say: w.problemLine(Array.isArray(s.background) ? s.background.join(" ") : s.background) },
    s.story && { id: 'story', chapter: w.ch.story, layout: 'left', energy: 0.35, mist: 0.3, beams: 2, kicker: w.story,
      items: [{ tag: w.as, label: s.story.as }, { tag: w.want, label: s.story.want }, { tag: w.so, label: s.story.so }],
      particles: { mode: 'stream', count: 300, lanes: 4, band: [0.84, 0.96] }, say: w.storyLine(s.story) },
    { id: 'overview', chapter: w.ch.overview, layout: 'nodes', energy: 0.45, mist: 0.25, kicker: w.overview(n),
      items: s.tasks.map((t) => ({ tag: `${t.id} · ${t.points} ${w.pts}`, label: t.name })), particles: { mode: 'converge', count: 150 * n, y: 0.5 },
      say: w.overviewLine(s.tasks) },
    ...s.tasks.map((t, i) => ({ id: `task-${t.id.toLowerCase()}`, task: t.id, visuals: visualMap[t.id], chapter: `${t.id} · ${t.name}`, layout: 'left', energy: 0.4, mist: 0.25, beams: 1,
      kicker: `${w.ordinal(i)} · ${t.id} · ${t.points} ${w.pts}`, headline: t.name,
      items: [...t.items.map((x) => ({ tag: w.scope, label: x })), ...acsOf(t).map((a) => ({ tag: a.id, label: a.summary }))],
      particles: { mode: 'stream', count: 220, lanes: 3, band: [0.86, 0.96], speed: 0.7 }, say: w.taskLine(i, t, acsOf(t), n), breath: i === n - 1 ? BREATH.lastTask : BREATH.task })),
    s.userFlow && s.userFlow.length && { id: 'flow', chapter: w.ch.flow, layout: 'left', energy: 0.6, mist: 0.2, beams: 3, kicker: w.flow, items: s.userFlow,
      particles: { mode: 'stream', count: 360, lanes: 4, band: [0.84, 0.96], speed: 1.1 }, say: w.flowLine(s.userFlow) },
    { id: 'outcome', chapter: w.ch.outcome, layout: 'center', energy: 0.35, mist: 0.45, kicker: w.outcome, headline: s.overview ? first(s.overview) : s.story ? s.story.so : title,
      sub: s.nonGoals && s.nonGoals.length ? w.excludes + s.nonGoals.join(w.join) : '', particles: { mode: 'burst', count: 320 }, say: w.outcomeLine(s, title) },
    { id: 'end', chapter: w.ch.end, layout: 'center', energy: 0.12, mist: 0.5, headline: title, sub: spec.demoNotice ? w.demo : '', particles: { mode: 'drift', count: 100 },
      say: w.endLine(n, !!spec.demoNotice) },
  ].filter(Boolean).map((sc) => ({ breath: BREATH[sc.id] ?? TAIL, ...sc, quiet: QUIET[sc.layout] }));
  if (overrides) applyOverrides(scenes, overrides, s.tasks);
  return { lang, title, fictional: !!(spec.demoNotice || spec.fictional), scenes,
    clips: scenes.map((sc) => ({ id: `vo-${sc.id}`, scene: sc.id, text: sc.say, ...(sc.override ? { override: true } : {}) })) };
}

// reviewed narration overrides keep the task-coverage guarantee: unknown scenes are rejected, task scenes must still
// say their Task ID and full name, and the overview must name every task in order
function applyOverrides(scenes, overrides, tasks) {
  const errors = [];
  for (const [id, text] of Object.entries(overrides)) {
    const sc = scenes.find((x) => x.id === id);
    if (!sc) { errors.push(`override for unknown scene "${id}"`); continue; }
    if (typeof text !== 'string' || !text.trim()) { errors.push(`override for "${id}" is empty`); continue; }
    const t = sc.task && tasks.find((x) => x.id === sc.task);
    if (t && !(text.includes(t.id) && text.includes(t.name))) errors.push(`override for "${id}" must say ${t.id} and "${t.name}"`);
    if (id === 'overview') {
      let pos = -1;
      for (const x of tasks) { const at = text.indexOf(x.id); if (at <= pos || !text.includes(x.name)) errors.push(`overview override must name ${x.id} "${x.name}" in order`); pos = at; }
    }
    sc.say = text.trim(); sc.override = true;
  }
  if (errors.length) throw new Error(`invalid narration overrides:\n- ${errors.join('\n- ')}`);
}

// a narrated build must have one current, decodable clip per scene; partial or stale manifests are rejected
export function validateNarration(script, narration, mediaDir) {
  const errors = [], clips = narration.clips || [], seen = new Map();
  if (narration.lang !== script.lang) errors.push(`manifest language "${narration.lang}" does not match video language "${script.lang}"`);
  if (!narration.voice || narration.synthetic === undefined) errors.push('manifest must state the voice and whether it is synthetic');
  for (const c of clips) seen.set(c.id, (seen.get(c.id) || 0) + 1);
  for (const [id, n] of seen) if (n > 1) errors.push(`clip ${id} appears ${n} times`);
  const expected = new Map(script.clips.map((c) => [c.id, c]));
  for (const id of seen.keys()) if (!expected.has(id)) errors.push(`clip ${id} does not belong to any current scene`);
  for (const [id, want] of expected) {
    const c = clips.find((x) => x.id === id);
    if (!c) { errors.push(`missing clip ${id} (scene ${want.scene})`); continue; }
    if (c.scene !== want.scene) errors.push(`clip ${id} is for scene ${c.scene}, expected ${want.scene}`);
    if (c.text !== want.text) errors.push(`clip ${id} text is stale: regenerate it (or supply the reviewed text via --overrides)`);
    try {
      const d = mp3Duration(readFileSync(join(mediaDir, c.file))).duration;
      if (!(d > 0.3)) errors.push(`clip ${id} audio is too short (${d.toFixed(2)} s)`);
    } catch (e) { errors.push(`clip ${id} audio is unusable: ${e.message}`); }
  }
  if (errors.length) throw new Error(`narration manifest rejected:\n- ${errors.join('\n- ')}`);
}

// Reveal each item shortly before the narration says it (never after the line has finished). Items the narration does
// not quote verbatim (e.g. after a reviewed override) are spread over the clip, keeping order.
function itemTimes(items, line, lead) {
  const labels = items.map((it) => (typeof it === 'string' ? it : it.label)), out = [];
  let after = -1;
  labels.forEach((label, i) => {
    const hit = locate(line, label, after);
    let at = hit ? lead + hit.at - 0.35 : lead + (line.dur * 0.85 * i) / Math.max(1, labels.length);
    if (hit) after = hit.pos;
    at = Math.max(lead * 0.6, at, i ? out[i - 1] + 0.25 : 0);
    out.push(+Math.min(at, lead + line.dur).toFixed(3));
  });
  return out;
}

// timing: scene length = lead + measured clip + breath (longer where a section closes), extended so the last task
// shot stays readable for its complexity. Seconds, not bars: nothing is quantized to a beat grid.
export function storyFromScript(script, { narration = null, mediaDir = '.', theme = 'calm', alt = null } = {}) {
  const lang = script.lang, w = WORDS[lang], cinematic = CINEMATIC.has(theme);
  if (narration) validateNarration(script, narration, mediaDir);
  const byId = new Map((narration ? narration.clips : []).map((c) => [c.id, c]));
  const charSec = lang === 'zh' ? 0.24 : 0.068;
  const narr = [], scenes = script.scenes.map((sc) => {
    const clip = byId.get(`vo-${sc.id}`);
    const dur = clip ? mp3Duration(readFileSync(join(mediaDir, clip.file))).duration : Math.max(1.5, sc.say.length * charSec);
    // Providers can overlap adjacent sentence ends. Keep starts, cap ends to the next start and measured audio end.
    const cues = clip ? (clip.cues || []).map((c, i, all) => ({
      at: +c.at.toFixed(3), dur: +Math.max(0, Math.min(c.dur, (all[i + 1]?.at ?? dur) - c.at, dur - c.at)).toFixed(3), text: c.text,
    })) : null;
    const line = { text: sc.say, dur, cues };
    narr.push({ id: `vo-${sc.id}`, scene: sc.id, at: LEAD, dur: +dur.toFixed(3), text: sc.say, src: clip ? `media/${clip.file}` : null, cues });
    const { say, breath, particles, mist, beams, energy, ...rest } = sc;
    void say;
    const visuals = timeVisuals(sc.visuals, line, LEAD);
    const lastShot = visuals?.[visuals.length - 1];
    const dwell = lastShot ? lastShot.at + Math.min(6, 2.4 + 0.3 * (lastShot.weight || 0)) : 0;
    const len = Math.max(MIN_SCENE, LEAD + dur + Math.max(TAIL, breath ?? TAIL), dwell);
    const motion = cinematic ? { particles, mist, beams, energy } : { drift: 0.012, rise: 8, fade: 0.7, enter: 0.8, exit: 0.7, shotFade: 0.6 };
    return { ...rest, ...motion, ...(visuals ? { visuals } : {}), dur: +len.toFixed(3), ...(rest.items ? { itemAt: itemTimes(rest.items, line, LEAD) } : {}) };
  });
  const voice = narration ? { synthetic: true, provider: narration.provider, voice: narration.voice, rate: narration.rate } : null;
  const music = cinematic ? { style: 'pulse', bpm: BPM, root: 45, progression: [0, -4, 3, -2] }
    : { style: 'warm', bpm: 72, root: 53, progression: ['I', 'vi', 'IV', 'V'], chordBars: 2 };
  // bus levels: the score stays well under the voice; caption-only films let it come forward a little
  const mix = cinematic ? { music: voice ? 0.5 : 0.9, voice: 1, effects: 1 } : { music: voice ? 0.3 : 0.9, voice: 1, effects: 0 };
  return { title: script.title, lang, theme, sourceIssue: script.fictional ? 'fictional demo spec' : 'approved issue spec', ui: { ...UI_TEXT[lang], alt },
    voice, voiceNote: voice ? w.voiceNote(voice.voice) : w.noVoiceNote, effects: cinematic ? 'cinematic' : 'none',
    music, mix, posterAt: 0, scenes, narration: narr };
}

export const storyJs = (story) => `// Generated by scripts/video/create-video.mjs from approved issue content. Scenes, wording, beats, particles,\n`
  + `// theme, music, mix and narration are data; regenerate after changing the spec or the narration media.\n`
  + `(function (root) {\n  const HV = root.HV = root.HV || {};\n  HV.story = ${JSON.stringify(story).replace(/</g, '\\u003c')};\n})(typeof window !== 'undefined' ? window : globalThis);\n`;

function mediaJs(story, mediaDir, narration) {
  const lines = narration.clips.map((c) => `  HV.media[${JSON.stringify(`media/${c.file}`)}] = "data:audio/mpeg;base64,${readFileSync(join(mediaDir, c.file)).toString('base64')}";`);
  return `// Generated: embedded narration (synthetic voice: ${narration.voice}) so the video plays from file://\n`
    + `(function (root) {\n  const HV = root.HV = root.HV || {};\n  HV.media = HV.media || {};\n${lines.join('\n')}\n})(typeof window !== 'undefined' ? window : globalThis);\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
  const specPath = args[0], lang = opt('--lang', 'zh'), out = opt('--out'), scriptOut = opt('--script-out');
  if (!specPath || (!out && !scriptOut)) { console.error('Usage: see header of create-video.mjs'); process.exit(2); }
  const manPath = opt('--narration'), noNarration = args.includes('--no-narration');
  if (args.includes('--narration') && (!manPath || manPath.startsWith('--'))) { console.error('--narration requires a manifest path'); process.exit(2); }
  if (manPath && noNarration) { console.error('Choose --narration or --no-narration, not both'); process.exit(2); }
  if (out && !manPath && !noNarration) {
    console.error('Narration is required by default. Export --script-out, generate speech with narrate.py, then pass --narration <manifest.json>. Use --no-narration only when the user explicitly requests no spoken narration.');
    process.exit(2);
  }
  const ovPath = opt('--overrides'), overrides = ovPath ? JSON.parse(readFileSync(ovPath, 'utf8')) : null;
  const theme = opt('--theme', 'calm');
  const script = scriptFromSpec(JSON.parse(readFileSync(specPath, 'utf8')), lang, { overrides, theme });
  if (scriptOut) { writeFileSync(scriptOut, JSON.stringify({ lang, clips: script.clips }, null, 2)); console.log(`Wrote ${script.clips.length} narration clips to ${scriptOut}`); }
  if (out) {
    if (existsSync(out) && readdirSync(out).length && !args.includes('--force')) { console.error(`${out} is not empty; pass --force`); process.exit(1); }
    const narration = manPath ? JSON.parse(readFileSync(manPath, 'utf8')) : null, mediaDir = manPath ? dirname(resolve(manPath)) : '.';
    if (narration && narration.lang !== lang) { console.error(`narration is ${narration.lang}, video is ${lang}`); process.exit(1); }
    let story;
    try { story = storyFromScript(script, { narration, mediaDir, theme, alt: opt('--alt', null) }); } catch (e) { console.error(e.message); process.exit(1); }
    cpSync(TEMPLATE, out, { recursive: true });
    const diagrams = story.scenes.flatMap((s) => s.visuals || []).filter((v) => v.type === 'backend');
    if (diagrams.length) {
      mkdirSync(join(out, 'visuals'), { recursive: true });
      for (const v of diagrams) for (const ext of ['svg', 'mermaid']) writeFileSync(join(out, 'visuals', `${v.source}.${lang}.${ext === 'mermaid' ? 'mmd' : ext}`), v[ext]);
    }
    writeFileSync(join(out, 'js/data/story.js'), storyJs(story));
    if (narration) {
      writeFileSync(join(out, 'js/data/media.js'), mediaJs(story, mediaDir, narration));
      mkdirSync(join(out, 'media'), { recursive: true });
      for (const c of narration.clips) {
        const dest = join(out, 'media', c.file);
        mkdirSync(dirname(dest), { recursive: true });
        cpSync(join(mediaDir, c.file), dest);
      }
      const clips = narration.clips.map((c) => ({ ...c, duration: story.narration.find((n) => n.id === c.id).dur }));
      writeFileSync(join(out, 'media/manifest.json'), JSON.stringify({ ...narration, clips }, null, 2));
    }
    const total = story.scenes.reduce((a, s) => a + s.dur, 0);
    console.log(`Wrote ${resolve(out)}/index.html: ${story.scenes.length} scenes, ${total.toFixed(1)} s, voice ${narration ? narration.voice : 'none (captions only)'}`);
  }
}
