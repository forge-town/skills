// Approved task bindings → inert UI documents or Graphviz business flows. No runtime network or layout engine.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { prototypeCanvas } from '../issue-html/prototype.mjs';
import { validateFlow, checkSvg } from '../issue-html/spec.mjs';
import { esc, L } from '../issue-html/common.mjs';

const css = readFileSync(new URL('../../assets/issue-html/issue.css', import.meta.url), 'utf8');
const fail = (message) => { throw new Error(`task visuals: ${message}`); };
const normal = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export function uiDocument(component, components, lang) {
  const surface = prototypeCanvas(component, components, lang);
  // Same shadcn-style renderer + tokens as the PRD. Fixed artboard scaled by the player, no independent responsive timer.
  return `<!doctype html><html lang="${lang === 'zh' ? 'zh-CN' : 'en'}"><head><meta charset="utf-8">`
    + `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">`
    + `<style>${css}\nhtml,body{width:768px;height:480px;overflow:hidden;margin:0;background:#f5f5f5}`
    + `.canvas{width:768px;height:480px;min-height:480px;padding:28px;border:0;border-radius:0;font-size:15px}`
    + `.canvas.canvas-menu{padding-bottom:28px}.p-h{font-size:20px}.p-table td{height:50px}.p-modal{width:520px}.p-drawer{width:400px}`
    + `</style></head><body><div class="canvas canvas-${esc(component.kind)}">${surface}</div></body></html>`;
}
const q = (s) => JSON.stringify(String(s));
function wrap(label) {
  const words = /\s/.test(label) ? label.split(/\s+/) : [...label];
  const lines = [''], max = /[一-鿿]/.test(label) ? 12 : 25, sep = /\s/.test(label) ? ' ' : '';
  for (const word of words) {
    const i = lines.length - 1;
    if (lines[i] && lines[i].length + word.length > max) lines.push(word);
    else lines[i] += (lines[i] ? sep : '') + word;
  }
  return lines.join('\n');
}
// light = calm default (white artboard, neutral ink, semantic success/error outlines); dark = opt-in cinematic themes
const FLOW_TONES = {
  light: { fill: '#ffffff', line: '#d4d4d4', ink: '#0a0a0a', edge: '#737373', label: '#525252', success: '#3f7a5e', error: '#c4362f' },
  dark: { fill: '#111b26', line: '#698091', ink: '#eef4ff', edge: '#8391a8', label: '#c6ff3d', success: '#c6ff3d', error: '#ff6b6b' },
};
export function renderFlow(flow, lang, langs = [lang], tone = 'light') {
  const errors = validateFlow({ ...flow, svg: Object.fromEntries(langs.map((l) => [l, 'generated-by-dot'])) }, langs);
  if (errors.length) fail(errors.join('; '));
  const c = FLOW_TONES[tone] || FLOW_TONES.light;
  const dot = ['digraph G {', `graph [rankdir=${flow.direction}, bgcolor="transparent", pad="0.3", nodesep="0.35", ranksep="0.5"];`,
    `node [shape=box, style="rounded,filled", fillcolor="${c.fill}", color="${c.line}", penwidth=1.4, fontcolor="${c.ink}", fontname="Helvetica", fontsize=20, margin="0.2,0.14"];`,
    `edge [color="${c.edge}", fontcolor="${c.label}", fontname="Helvetica", fontsize=17, arrowsize=0.7, penwidth=1.2];`];
  const outline = (k) => (['success', 'finish'].includes(k) ? `, color="${c.success}", penwidth=2` : k === 'error' ? `, color="${c.error}", penwidth=2` : '');
  for (const n of flow.nodes) dot.push(`${n.id} [id=${q(n.id)}, label=${q(wrap(L(n.label, lang)))}, shape=${n.kind === 'decision' ? 'diamond' : ['start','finish','success','error'].includes(n.kind) ? 'oval' : 'box'}${outline(n.kind)}];`);
  for (const e of flow.edges) dot.push(`${e.from} -> ${e.to}${e.label ? ` [label=${q(L(e.label, lang))}]` : ''};`);
  dot.push('}');
  const result = spawnSync('dot', ['-Tsvg'], { input: dot.join('\n'), encoding: 'utf8', timeout: 10000, maxBuffer: 4e6 });
  if (result.error || result.status !== 0) fail(`Graphviz dot required to render ${flow.id}: ${result.error?.message || result.stderr}`);
  const svg = result.stdout.replace(/<\?xml[^>]*>|<!DOCTYPE[\s\S]*?>/g, '').trim();
  const unsafe = checkSvg(svg, flow.id);
  if (unsafe.length) fail(unsafe.join('; '));
  // Mermaid is an auditable companion, generated from exactly the same nodes and edges as the SVG.
  const mermaid = [`flowchart ${flow.direction}`,
    ...flow.nodes.map((n) => `  ${n.id}${n.kind === 'decision' ? '{' : '['}${q(L(n.label, lang))}${n.kind === 'decision' ? '}' : ']'}`),
    ...flow.edges.map((e) => `  ${e.from} -->${e.label ? `|${q(L(e.label, lang))}|` : ''} ${e.to}`)].join('\n');
  return { svg, mermaid };
}

export function taskVisuals(spec, lang, { tone = 'light' } = {}) {
  if (!spec.video?.tasks) return {};
  const langs = Object.keys(spec.langs), ids = spec.langs[lang].tasks.map((t) => t.id), bindings = spec.video.tasks;
  for (const id of Object.keys(bindings)) if (!ids.includes(id)) fail(`unknown task ${id}`);
  const output = {}, flows = new Map();
  for (const f of spec.video.flows || []) { if (flows.has(f.id)) fail(`duplicate flow ${f.id}`); flows.set(f.id, f); }
  const rendered = new Map();
  for (const id of ids) {
    const b = bindings[id];
    if (!b || !['frontend', 'backend', 'mixed'].includes(b.kind) || !Array.isArray(b.shots) || !b.shots.length) fail(`${id} needs kind and shots`);
    const shots = b.shots.map((shot, i) => {
      if (Boolean(shot.component) === Boolean(shot.flow)) fail(`${id} shot ${i}: choose exactly one component or flow`);
      const phrase = {};
      for (const l of langs) {
        const t = spec.langs[l].tasks.find((t) => t.id === id);
        if (!t) fail(`${id} missing in ${l}`);
        const hasScope = Number.isInteger(shot.on?.scope), hasAc = typeof shot.on?.ac === 'string';
        if (hasScope === hasAc) fail(`${id} shot ${i}: on must select scope index or AC ID`);
        phrase[l] = hasScope ? t.items[shot.on.scope] : spec.langs[l].acs.find((a) => a.id === shot.on.ac && a.task === id)?.summary;
        if (!phrase[l]) fail(`${id} shot ${i}: unknown scope or AC in ${l}`);
      }
      if (shot.component) {
        const c = (spec.components || []).find((x) => x.id === shot.component);
        if (!c) fail(`${id}: unknown component ${shot.component}`);
        if (!L(c.name, lang) || !L(c.state, lang)) fail(`${id}: component ${c.id} missing ${lang} name/state`);
        if (c.base && !(spec.components || []).some((x) => x.id === c.base && x.kind === 'page')) fail(`${id}: missing base page ${c.base}`);
        // weight = how much there is to read on the artboard; the generator turns it into minimum on-screen time
        return { type: 'frontend', source: c.id, label: L(c.name, lang), state: L(c.state, lang), phrase: phrase[lang], weight: (c.blocks || c.items || []).length + (c.base ? 2 : 0), html: uiDocument(c, spec.components, lang) };
      }
      const flow = flows.get(shot.flow) || (spec.flow?.id === shot.flow ? spec.flow : null);
      if (!flow) fail(`${id}: unknown flow ${shot.flow}`);
      if (!rendered.has(flow.id)) rendered.set(flow.id, renderFlow(flow, lang, langs, tone));
      return { type: 'backend', source: flow.id, label: L(flow.name, lang) || spec.langs[lang].tasks.find((t) => t.id === id).name,
        phrase: phrase[lang], weight: flow.nodes.length, ...rendered.get(flow.id) };
    });
    const types = new Set(shots.map((s) => s.type));
    if (b.kind === 'mixed' ? types.size !== 2 : types.size !== 1 || !types.has(b.kind)) fail(`${id}: shots do not match kind ${b.kind}`);
    output[id] = shots;
  }
  return output;
}

// Provider cues are sentence-level: interpolate inside a sentence. Explicitly retain timing provenance.
// locate(): seconds into the clip at which `phrase` is spoken (null when absent at or after character `after`).
export function locate(line, phrase, after = -1) {
  const text = normal(line.text), needle = normal(phrase), pos = needle ? text.indexOf(needle, after + 1) : -1;
  if (pos < 0) return null;
  let at = line.dur * pos / Math.max(1, text.length), timing = 'estimated-text', cursor = 0;
  for (const cue of line.cues || []) {
    const chunk = normal(cue.text), start = text.indexOf(chunk, cursor);
    if (start < 0) continue;
    cursor = start + chunk.length;
    if (pos >= start && pos < cursor) { at = cue.at + cue.dur * (pos - start) / chunk.length; timing = 'sentence-interpolation'; break; }
  }
  return { pos, at, timing };
}

export function timeVisuals(visuals, line, lead) {
  if (!visuals?.length) return undefined;
  let last = -1, lastPos = -1;
  return visuals.map((visual, i) => {
    const hit = locate(line, visual.phrase);
    if (!hit) fail(`phrase for ${visual.source} is not in current narration; review binding/override`);
    if (hit.pos <= lastPos) fail(`shots for ${visual.source} must follow narration order`);
    lastPos = hit.pos;
    let at = lead + hit.at;
    if (i === 0) at = 0; // show the opening interface during the task introduction, too
    if (at <= last) fail(`shots for ${visual.source} must follow narration order`);
    last = at;
    const { phrase, ...rest } = visual;
    return { ...rest, at: +at.toFixed(3), timing: hit.timing };
  });
}
