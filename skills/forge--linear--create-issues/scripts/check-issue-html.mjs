// Regex-based markup lint and Markdown parity check for issue.html produced by render-issue.mjs.
// NOT an HTML parser and NOT a DOM/visibility check: it pattern-matches the generator's own markup (class names,
// data-* attributes) after stripping <script>/<template>/<style> bodies. It catches CDN/external references, proof
// leaks, missing Task/AC/Summary/case fields, overlay markup without scrim/anchor, and Markdown drift.
// Real verification still requires a browser DOM with JavaScript disabled: scripts/browser/check-issue-dom.mjs
// (headless Chrome) or an equivalent Playwright run, per references/html-rendering-safety.md.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findFormalizationLeaks } from './validate-issue-body.mjs';

const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const stripInert = (html) => html.replace(/<(script|template|style)\b[\s\S]*?<\/\1>/gi, '');
const blocksOf = (html, tag, cls) => [...html.matchAll(new RegExp(`<${tag} class="${cls}"([^>]*)>([\\s\\S]*?)</${tag}>`, 'g'))];
const attr = (attrs, name) => (attrs.match(new RegExp(`${name}="([^"]*)"`)) || [])[1];

function parseArticle(html) {
  const tasks = blocksOf(html, 'li', 'task').map(([, a, inner]) => ({
    id: attr(a, 'data-task'), name: decode((inner.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1] || ''),
    points: +((inner.match(/<span class="pts">(\d+)/) || [])[1] || 0),
  }));
  const acs = blocksOf(html, 'article', 'ac').map(([, a, inner]) => {
    const dd = [...inner.matchAll(/<dd>([\s\S]*?)<\/dd>/g)].map((m) => decode(m[1]));
    return { id: attr(a, 'data-ac'), task: attr(a, 'data-task'),
      summary: decode((inner.match(/<h3 class="ac-summary">([\s\S]*?)<\/h3>/) || [])[1] || ''), gwt: dd };
  });
  const testCases = blocksOf(html, 'article', 'test-case ac').map(([, a, inner]) => ({
    id: attr(a, 'data-test'), acRef: attr(a, 'data-for-ac'),
    summary: decode((inner.match(/<h3 class="ac-summary">([\s\S]*?)<\/h3>/) || [])[1] || ''),
    fields: [...inner.matchAll(/<dd>([\s\S]*?)<\/dd>/g)].map(m=>decode(m[1])),
  }));
  const protos = [...html.matchAll(/<figure class="proto proto-(\w+)" id="([^"]+)"[^>]*>([\s\S]*?)<\/figure>/g)]
    .map(([, kind, id, inner]) => ({ kind, id, inner }));
  return { tasks, acs, testCases, protos };
}

export function parseMarkdown(md) {
  const parts = md.split(/\n---\n/);
  return parts.map((part) => {
    const tasks = [...part.matchAll(/^### (T\d+)(?:：|: )(.+?)(?:（(\d+) 点）| \((\d+) points\))$/gm)]
      .map(([, id, name, a, b]) => ({ id, name: name.trim(), points: +(a || b) }));
    const acs = [...part.matchAll(/^- \[ \] \*\*\[(T\d+)\]\[(AC-\d+)\] (.+)\*\*\n {2}- Given[：:] ?(.+)\n {2}- When[：:] ?(.+)\n {2}- Then[：:] ?(.+)$/gm)]
      .map(([, task, id, summary, given, when, then]) => ({ id, task, summary: summary.trim(), gwt: [decode(given),decode(when),decode(then)] }));
    const testCases = [...part.matchAll(/^- \[ \] \*\*\[(TC-\d+)\] (.+)\*\*\n {2}- (?:对应验收标准|Acceptance criterion)[：:] ?(AC-\d+) · .+\n {2}- Given[：:] ?(.+)\n {2}- When[：:] ?(.+)\n {2}- Then[：:] ?(.+)$/gm)]
      .map(([, id, summary, acRef, given, when, then]) => ({ id, acRef, summary: summary.trim(), fields: [decode(given),decode(when),decode(then)] }));
    return { tasks, acs, testCases };
  });
}

export function checkIssueHtml(html, md) {
  const errors = [], err = (m) => errors.push(m);
  if (!/^<!doctype html>/i.test(html.trim())) err('missing <!doctype html>');
  const mode = (html.match(/<body[^>]*data-mode="([^"]+)"/) || [])[1];
  // self-contained: no remote stylesheet, script, font, image or import
  if (/<(?:script|link|img|iframe|source|video|audio)\b[^>]*(?:src|href)\s*=\s*["']\s*(?:https?:)?\/\//i.test(html)) err('references a remote resource (CDN)');
  if (/@import|url\(\s*["']?\s*(?:https?:)?\/\//i.test(html)) err('CSS imports a remote resource');
  if (/<link\b[^>]*rel=["']?stylesheet/i.test(html)) err('external stylesheet; inline CSS instead');
  if (/<script\b[^>]*\ssrc=/i.test(html)) err('external script file; issue.html must be a single file');
  if (/class="ttype"|data-type="(?:E2E Test|Storybook Test)"/.test(html)) err('testing implementation labels do not belong in acceptance criteria');
  const visible = stripInert(html);
  const body = (visible.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [])[1] || '';
  if (/<div id="(?:app|root|content)">\s*<\/div>/i.test(body)) err('empty mount container suggests client-side rendering');
  const text = body.replace(/<\/(p|li|h\d|dd|dt|th|td|summary|div)>/g, '\n').replace(/<[^>]+>/g, '');
  for (const leak of findFormalizationLeaks(text)) err(`proof leak in visible HTML: ${leak.text.trim()}`);

  const articles = [...body.matchAll(/<article class="spec" id="spec-(zh|en)"[^>]*>([\s\S]*?)<\/article>(?=<hr class="lang-sep">|<\/main>)/g)];
  const langs = articles.map((a) => a[1]);
  const expect = mode === 'zh-CN' ? ['zh'] : mode === 'zh-en' ? ['zh', 'en'] : null;
  if (!expect) err(`unknown body data-mode ${mode}`);
  else if (JSON.stringify(langs) !== JSON.stringify(expect)) err(`mode ${mode} expects articles ${expect} but found ${langs}`);
  const parsed = articles.map((a) => parseArticle(a[2]));
  const mdParts = md ? parseMarkdown(md) : null;
  if (mdParts && mdParts.length !== parsed.length) err(`Markdown has ${mdParts.length} language parts, HTML has ${parsed.length}`);

  parsed.forEach((p, i) => {
    const lang = langs[i];
    if (p.tasks.length < 1) err(`${lang}: fewer than 1 Task blocks in static DOM`);
    if (!p.acs.length) err(`${lang}: no AC blocks in static DOM`);
    for (const a of p.acs) {
      if (!a.summary) err(`${lang} ${a.id}: missing visible Summary`);
      if (/E2E Test|Storybook Test/.test(a.summary)) err(`${lang} ${a.id}: testing implementation labels do not belong in acceptance criteria`);
      if (a.gwt.length !== 3 || a.gwt.some((x) => !x)) err(`${lang} ${a.id}: Given/When/Then missing`);
      if (!p.tasks.some((t) => t.id === a.task)) err(`${lang} ${a.id}: unknown Task ${a.task}`);
    }
    for (const a of p.acs) if (!p.testCases.some(c=>c.acRef===a.id)) err(`${lang}: ${a.id} has no test case`);
    const caseIds=new Set();
    for (const c of p.testCases) {
      if (!c.id || caseIds.has(c.id)) err(`${lang}: duplicate or missing test ID`);
      caseIds.add(c.id);
      if (!p.acs.some(a=>a.id===c.acRef)) err(`${lang}: test case ${c.id} references an unknown acceptance criterion`);
      if (c.fields.length !== 3 || c.fields.some(x=>!x)) err(`${lang} ${c.id}: test Given/When/Then missing`);
    }
    for (const c of p.protos) {
      if (!/<figcaption>[\s\S]*<b>[^<]+<\/b>[\s\S]*<span class="proto-meta">/.test(c.inner)) err(`${c.id}: figure needs name, trigger and state`);
      if ((c.kind === 'modal' || c.kind === 'drawer') && !(/class="p-scrim"/.test(c.inner) && new RegExp(`class="p-${c.kind}" role="dialog"`).test(c.inner))) err(`${c.id}: ${c.kind} needs its own scrim and dialog frame`);
      if (c.kind === 'menu' && !/class="p-anchor">[\s\S]*class="p-menu"/.test(c.inner)) err(`${c.id}: menu must be anchored to its trigger`);
      if (c.kind === 'page' && /class="p-scrim"/.test(c.inner)) err(`${c.id}: page canvas must not contain an overlay`);
    }
    if (i > 0) {
      const ref = parsed[0];
      const key = (list, k) => JSON.stringify(list.map((x) => x[k]));
      if (key(p.tasks, 'id') !== key(ref.tasks, 'id') || key(p.tasks, 'points') !== key(ref.tasks, 'points')) err('zh-en Task IDs/points differ');
      for (const k of ['id', 'task']) if (key(p.acs, k) !== key(ref.acs, k)) err(`zh-en AC ${k} differ`);
      if (key(p.protos, 'kind') !== key(ref.protos, 'kind')) err('zh-en prototype components differ');
    }
    const m = mdParts && mdParts[i];
    if (m) {
      if (JSON.stringify(m.tasks) !== JSON.stringify(p.tasks)) err(`${lang}: Task list differs from Markdown`);
      if (JSON.stringify(m.testCases) !== JSON.stringify(p.testCases)) err(`${lang}: test cases differ from Markdown`);
      if (JSON.stringify(m.acs) !== JSON.stringify(p.acs)) err(`${lang}: AC ID/Task/Summary/case fields differ from Markdown`);
    }
  });
  return { errors, stats: parsed.map((p, i) => ({ lang: langs[i], tasks: p.tasks.length, acs: p.acs.length, components: p.protos.map((c) => c.kind) })) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [htmlPath, mdPath] = process.argv.slice(2);
  if (!htmlPath) {
    console.error('Usage: node check-issue-html.mjs <issue.html> [issue.md]');
    process.exit(2);
  }
  const result = checkIssueHtml(readFileSync(htmlPath, 'utf8'), mdPath ? readFileSync(mdPath, 'utf8') : null);
  if (result.errors.length) {
    console.error(JSON.stringify({ path: htmlPath, errors: result.errors }, null, 2));
    process.exitCode = 1;
  } else console.log(`issue.html markup lint passed (regex, not DOM validation): ${htmlPath} ${JSON.stringify(result.stats)}`);
}
