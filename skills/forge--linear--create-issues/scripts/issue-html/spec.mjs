// Validates an approved issue spec before anything is written. Errors are collected, never auto-fixed.
import { LANGS, KINDS, L, hasText } from './common.mjs';

const FLOW_KINDS = ['start', 'process', 'decision', 'source', 'success', 'error', 'finish'];
const OVERLAY_KINDS = ['modal', 'drawer', 'menu'];

export function validateSpec(spec) {
  const errors = [];
  const err = (path, msg) => errors.push(`${path}: ${msg}`);
  const langs = LANGS[spec.mode];
  if (!langs) return [`mode: must be zh-CN or zh-en, got ${JSON.stringify(spec.mode)}`];
  for (const lang of ['zh', 'en']) {
    const present = !!(spec.langs && spec.langs[lang]);
    if (langs.includes(lang) && !present) err(`langs.${lang}`, `required by ${spec.mode}`);
    if (!langs.includes(lang) && present) err(`langs.${lang}`, `${spec.mode} must not contain this language`);
  }
  if (errors.length) return errors;
  for (const lang of langs) if (!hasText(spec.title, lang)) err(`title.${lang}`, 'missing');

  const meta = spec.meta || {};
  for (const key of ['product', 'domain', 'type', 'estimate', 'priority']) if (meta[key] == null || meta[key] === '') err(`meta.${key}`, 'missing');
  if (![8, 16].includes(meta.estimate)) err('meta.estimate', 'must be 8 or 16');

  const components = spec.components || [];
  const compIds = new Set();
  components.forEach((c, i) => {
    const p = `components[${i}]`;
    if (!/^[a-z][a-z0-9-]*$/.test(c.id || '')) err(p, 'id must be kebab-case');
    if (compIds.has(c.id)) err(p, `duplicate id ${c.id}`);
    compIds.add(c.id);
    if (!KINDS.includes(c.kind)) err(p, `kind must be one of ${KINDS.join(', ')}`);
    for (const lang of langs) for (const key of ['name', 'trigger', 'state']) if (!hasText(c[key], lang)) err(`${p}.${key}.${lang}`, 'missing');
    if (OVERLAY_KINDS.includes(c.kind)) {
      const base = components.find((b) => b.id === c.base);
      if (!base || base.kind !== 'page') err(`${p}.base`, 'overlay components must reference a page component as their base');
    }
    if (c.kind === 'menu' && !(c.anchor && c.items && c.items.length)) err(p, 'menu needs anchor and items');
    if ((c.kind === 'modal' || c.kind === 'drawer') && !(c.title && c.blocks)) err(p, `${c.kind} needs title and blocks`);
    if (c.kind === 'page' && !c.blocks) err(p, 'page needs blocks');
  });

  const ref = spec.langs[langs[0]];
  for (const lang of langs) {
    const s = spec.langs[lang], p = `langs.${lang}`;
    if (!Array.isArray(s.summary) || s.summary.length < 4) err(`${p}.summary`, 'needs the collapsed summary lines');
    const tasks = s.tasks || [];
    if (tasks.length < 1 || tasks.length > 4) err(`${p}.tasks`, 'needs 1–4 tasks');
    tasks.forEach((t, i) => {
      if (t.id !== `T${i + 1}`) err(`${p}.tasks[${i}]`, `id must be T${i + 1}`);
      if (![1, 2, 4, 8].includes(t.points)) err(`${p}.tasks[${i}]`, 'points must be 1, 2, 4 or 8');
      if (!t.name || !(t.items && t.items.length)) err(`${p}.tasks[${i}]`, 'needs name and items');
    });
    const sum = tasks.reduce((a, t) => a + (t.points || 0), 0);
    if (sum !== meta.estimate) err(`${p}.tasks`, `points sum ${sum} ≠ estimate ${meta.estimate}`);
    if (Object.hasOwn(s, 'bonus')) err(`${p}.bonus`, 'removed field; remove the extra challenge from this spec');
    if (Array.isArray(s.summary) && s.summary.some((line) => /\bBonus\b|额外挑战/iu.test(line))) err(`${p}.summary`, 'must only summarize the agreed tasks, without an extra challenge');
    const acs = s.acs || [];
    acs.forEach((a, i) => {
      const q = `${p}.acs[${i}]`;
      if (a.id !== `AC-${String(i + 1).padStart(2, '0')}`) err(q, `id must be AC-${String(i + 1).padStart(2, '0')}`);
      if (!tasks.some((t) => t.id === a.task)) err(q, `unknown task ${a.task}`);
      for (const key of ['summary','given','when','then']) if (!a[key] || !String(a[key]).trim()) err(q, `${key} missing`);
    });
    const tests = s.testCases || [];
    const testIds = new Set();
    tests.forEach((c,i)=>{
      const q=`${p}.testCases[${i}]`;
      if (!/^TC-\d{2,}$/.test(c.id || '') || testIds.has(c.id)) err(q,'test case ID must be unique TC-xx');
      testIds.add(c.id);
      if (!acs.some(a=>a.id===c.acRef)) err(q,`unknown acceptance criterion ${c.acRef}`);
      for (const key of ['summary','given','when','then']) if (!String(c[key] || '').trim()) err(q,`${key} missing`);
    });
    for (const a of acs) if (!tests.some(c=>c.acRef===a.id)) err(`${p}.testCases`,`${a.id} has no test case`);
    for (const t of tasks) if (!acs.some((a) => a.task === t.id)) err(`${p}.acs`, `${t.id} has no AC`);
    if (lang !== langs[0]) {
      const same = (a, b, key) => JSON.stringify(a.map((x) => x[key])) === JSON.stringify(b.map((x) => x[key]));
      if (!same(tasks, ref.tasks, 'id') || !same(tasks, ref.tasks, 'points')) err(`${p}.tasks`, 'Task IDs/points must mirror zh');
      for (const key of ['id','acRef']) if (!same(tests, ref.testCases || [], key)) err(`${p}.testCases`, `test ${key} must mirror zh`);
      for (const key of ['id', 'task']) if (!same(acs, ref.acs, key)) err(`${p}.acs`, `AC ${key} must mirror zh`);
    }
  }
  if (spec.flow) errors.push(...validateFlow(spec.flow, langs));
  return errors;
}

export function validateFlow(flow, langs) {
  const errors = [], err = (m) => errors.push(`flow: ${m}`);
  if (!/^[a-z][a-z0-9-]*$/.test(flow.id || '')) err('id must be kebab-case');
  if (!['TB', 'LR'].includes(flow.direction)) err('direction must be TB or LR');
  const ids = new Set();
  for (const n of flow.nodes || []) {
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(n.id || '')) err(`bad node id ${n.id}`);
    if (ids.has(n.id)) err(`duplicate node ${n.id}`);
    ids.add(n.id);
    if (!FLOW_KINDS.includes(n.kind)) err(`node ${n.id} kind ${n.kind} not allowed`);
    for (const lang of langs) if (!hasText(n.label, lang)) err(`node ${n.id} missing ${lang} label`);
  }
  const out = new Map([...ids].map((id) => [id, []]));
  for (const e of flow.edges || []) {
    if (!ids.has(e.from) || !ids.has(e.to)) { err(`edge ${e.from}→${e.to} references a missing node`); continue; }
    if (e.from === e.to) err(`self edge on ${e.from}`);
    const from = flow.nodes.find((n) => n.id === e.from);
    if (from.kind === 'decision') for (const lang of langs) if (!hasText(e.label, lang)) err(`branch ${e.from}→${e.to} missing ${lang} label`);
    out.get(e.from).push(e.to);
  }
  const starts = (flow.nodes || []).filter((n) => n.kind === 'start');
  if (starts.length !== 1) err('exactly one start node is required');
  else {
    const seen = new Set([starts[0].id]), queue = [starts[0].id];
    while (queue.length) for (const next of out.get(queue.shift())) if (!seen.has(next)) { seen.add(next); queue.push(next); }
    for (const id of ids) if (!seen.has(id)) err(`node ${id} unreachable from start`);
  }
  for (const lang of langs) if (!flow.svg || !flow.svg[lang]) err(`svg.${lang}: provide the layout-engine SVG (Graphviz/Mermaid) for this language`);
  return errors;
}

// Rendered SVG must be self-contained and inert: no scripts, handlers or remote references.
export function checkSvg(svg, label) {
  const problems = [];
  if (!/^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(svg)) problems.push(`${label}: not an SVG document`);
  if (/<script|\son\w+=|<foreignObject/i.test(svg)) problems.push(`${label}: SVG contains script or event handlers`);
  if (/(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i.test(svg)) problems.push(`${label}: SVG references remote resources`);
  return problems;
}

export const flowLabel = (node, lang) => L(node.label, lang);
