// Renders a single self-contained issue.html in an editorial long-document layout. The core business content is static,
// script-independent DOM (complete with JavaScript disabled); the only script is an optional inline progressive
// enhancement for the chart reveal. Layout:
// typographic masthead → contents rail → numbered chapters with margin labels. All business content is static DOM.
// Layout skeleton adapted from the lv-editorial-pdf natural-flow handbook (see assets/issue-html/PROVENANCE.md).
import { readFileSync } from 'node:fs';
import { LANGS, UI, esc, L, sectionsFor, anchor, acceptanceFields, testCaseFields, personText, person } from './common.mjs';
import { prototypeSection } from './prototype.mjs';
import { taskTickRows, CHART_REVEAL_SCRIPT, LICENSE_NOTICE } from './chart.mjs';

const CSS_URL = new URL('../../assets/issue-html/issue.css', import.meta.url);
const list = (items) => `<ul>${items.map((x) => `<li>${personText(x)}</li>`).join('')}</ul>`;
const paras = (v) => (Array.isArray(v) ? v : [v]).map((p) => `<p>${personText(p)}</p>`).join('');
const sep = (lang) => (lang === 'zh' ? '：' : ': ');
const num = (i) => String(i + 1).padStart(2, '0');
const MAST = { 'zh-CN': '产品需求文档', 'zh-en': '产品需求文档 · PRODUCT REQUIREMENT' };
const cssString = (s) => `"${String(s).replace(/["\\\n]/g, ' ')}"`;
// printed folio (LV workflow): localized running label + page counter, in the page margin boxes
const folio = (spec) => `@page { @bottom-left { content: ${cssString(`${MAST[spec.mode]} · ${spec.meta.product}`)}; font-size: 7.5pt; color: #6A6963; letter-spacing: .06em; } `
  + '@bottom-right { content: counter(page) " / " counter(pages); font-size: 7.5pt; color: #6A6963; } }';

function sectionBody(spec, lang, key, svgs) {
  const s = spec.langs[lang], u = UI[lang];
  switch (key) {
    case 'background': return `<div class="prose">${paras(s.background)}</div>`;
    case 'overview': return `<div class="prose">${paras(s.overview)}</div>`;
    case 'story': return `<dl class="story"><dt>${u.as}</dt><dd>${person(s.story.as)}</dd><dt>${u.want}</dt><dd>${esc(s.story.want)}</dd><dt>${u.so}</dt><dd>${esc(s.story.so)}</dd></dl>`;
    case 'tasks': return taskTickRows(s.tasks, lang, (id) => `#${lang}-${id}`)
      + `<ol class="tasks">${s.tasks.map((t) => `<li class="task" id="${lang}-${t.id}" data-task="${t.id}">`
      + `<div class="task-head"><span class="tid">${t.id}</span><h3>${esc(t.name)}</h3><span class="pts">${t.points} ${u.points}</span></div>${list(t.items)}</li>`).join('')}</ol>`;
    case 'userFlow': return `<ol class="steps">${s.userFlow.map((x, i) => `<li><span class="step-n">${num(i)}</span><span>${esc(x)}</span></li>`).join('')}</ol>`;
    case 'flow': return `<figure class="flow" data-flow="${esc(spec.flow.id)}"><div class="scroll-x" tabindex="0" role="region" aria-label="${u.flow}">${svgs[lang]}</div></figure>`;
    case 'prototypes': return prototypeSection(spec, lang, (id) => `${lang}-proto-${id}`);
    case 'frontend': return s.frontend.none ? `<p>${esc(s.frontend.none)}</p>`
      : [['pages', 'pages'], ['ui', 'ui'], ['interaction', 'interaction']].filter(([k]) => s.frontend[k]).map(([k, l]) => `<h3>${u[l]}</h3>${list(s.frontend[k])}`).join('');
    case 'tech': return list(s.tech);
    case 'nonGoals': return list(s.nonGoals);
    case 'acs': return `<div class="acs">${s.acs.map((a) => `<article class="ac" id="${lang}-${a.id}" data-ac="${a.id}" data-task="${a.task}">`
      + `<div class="ac-head"><input type="checkbox" disabled aria-label="${a.id}"><a class="tid" href="#${lang}-${a.task}">${a.task}</a><span class="acid">${a.id}</span></div>`
      + `<h3 class="ac-summary">${esc(a.summary)}</h3><dl class="gwt">${acceptanceFields(a,lang).map(([label,value])=>`<dt>${esc(label)}</dt><dd>${personText(value)}</dd>`).join('')}</dl></article>`).join('')}</div>`;
    case 'testCases': return `<div class="test-cases">${s.testCases.map((a) => `<article class="test-case ac" id="${lang}-${a.id}" data-test="${a.id}" data-for-ac="${a.acRef}">`
      + `<div class="ac-head"><input type="checkbox" aria-label="${a.id}"><span class="acid">${a.id}</span></div><h3 class="ac-summary">${esc(a.summary)}</h3>`
      + `<p class="test-reference">${lang==='zh'?'对应验收标准':'Acceptance criterion'}：<a href="#${lang}-${a.acRef}">${a.acRef} · ${esc(s.acs.find(x=>x.id===a.acRef).summary)}</a></p>`
      + `<dl class="gwt">${testCaseFields(a,lang).map(([label,value])=>`<dt>${esc(label)}</dt><dd>${personText(value)}</dd>`).join('')}</dl></article>`).join('')}</div>`;
    default: return '';
  }
}

function article(spec, lang, svgs) {
  const s = spec.langs[lang], u = UI[lang];
  const body = sectionsFor(spec, lang).map((key, i) => `<section class="sec chapter sec-${key}" id="${anchor(lang, key)}" aria-labelledby="${anchor(lang, key)}-h">`
    + `<div class="ch-label" aria-hidden="true"><span class="ch-num">${num(i)}</span></div>`
    + `<div class="ch-body"><h2 id="${anchor(lang, key)}-h">${u[key]}</h2>${sectionBody(spec, lang, key, svgs)}</div></section>`).join('');
  const ref = s.reference || {};
  const refs = [[u.parent, ref.parent], [u.related, ref.related]].filter(([, v]) => v);
  const refHtml = refs.length ? `<details class="ref" id="${anchor(lang, 'reference')}"><summary>${u.reference}</summary>`
    + `<ul>${refs.map(([k, v]) => `<li>${k}${sep(lang)}${esc(v)}</li>`).join('')}</ul></details>` : '';
  return `<article class="spec" id="spec-${lang}" lang="${lang === 'zh' ? 'zh-CN' : 'en'}">`
    + (lang === 'en' ? `<header class="spec-head"><h2 class="spec-title">${esc(L(spec.title, 'en'))}</h2></header>` : '')
    + `<details class="summary" id="${anchor(lang, 'summary')}"><summary>${u.summary}</summary>${list(s.summary)}</details>${body}${refHtml}</article>`;
}

function toc(spec) {
  return LANGS[spec.mode].map((lang) => {
    const u = UI[lang], keys = ['summary', ...sectionsFor(spec, lang)];
    return `<ol lang="${lang === 'zh' ? 'zh-CN' : 'en'}">${keys.map((k, i) => `<li><a href="#${anchor(lang, k)}"><span class="toc-n">${i ? num(i - 1) : '—'}</span>${u[k]}</a></li>`).join('')}</ol>`;
  }).join('');
}

function metaBlock(spec) {
  const u = UI.zh.meta, m = spec.meta;
  const deps = Array.isArray(m.dependencies) ? (m.dependencies.length ? m.dependencies.join(', ') : '—') : (m.dependencies || '—');
  const rows = [['product', m.product], ['domain', m.domain], ['type', m.type], ['estimate', `${m.estimate}`], ['priority', m.priority], ['dependencies', deps]];
  return `<dl class="meta">${rows.map(([k, v]) => `<div><dt>${u[k]}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}

export function renderHtml(spec, svgs = {}) {
  const css = readFileSync(CSS_URL, 'utf8');
  const langs = LANGS[spec.mode];
  const titleText = spec.mode === 'zh-en' ? `${L(spec.title, 'zh')} ｜ ${L(spec.title, 'en')}` : L(spec.title, 'zh');
  const notice = spec.demoNotice ? `<p class="demo-notice" role="note">${esc(L(spec.demoNotice, 'zh'))}</p>` : '';
  const articles = langs.map((lang) => article(spec, lang, svgs)).join('<hr class="lang-sep">');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="forge--linear--create-issues/render-issue.mjs">
<!-- Layout: lv-editorial-pdf handbook flow skeleton (system fonts; LV font not bundled). Palette: Lieflat Mono.
     Prototype canvases: static adaptation of shadcn/ui anatomy and neutral theme tokens (MIT, https://github.com/shadcn-ui/ui).
     ${LICENSE_NOTICE} -->
<title>${esc(titleText)}</title>
<style>
${css}
${folio(spec)}
</style>
</head>
<body class="prd" data-mode="${spec.mode}">
<a class="skip" href="#main">${langs.includes('en') ? '跳到正文 / Skip to content' : '跳到正文'}</a>
<header class="masthead"><div class="mast"><span>${MAST[spec.mode]}</span><span>${esc(spec.meta.product)} · ${esc(spec.meta.domain)}</span></div>
${notice}<div class="title-block"><h1 class="display">${esc(L(spec.title, 'zh'))}</h1>${spec.mode === 'zh-en' ? `<p class="title-en" lang="en">${esc(L(spec.title, 'en'))}</p>` : ''}</div>${metaBlock(spec)}</header>
<div class="layout">
<nav class="toc" aria-label="${UI.zh.toc}">${toc(spec)}</nav>
<main id="main">${articles}</main>
</div>
<script data-enhance="lieflat-reveal">${CHART_REVEAL_SCRIPT}</script>
</body>
</html>
`;
}
