// Renders issue.md in the issue-template.md layout from the same spec used for HTML.
import { LANGS, UI, L, sectionsFor, acceptanceFields, testCaseFields, person } from './common.mjs';

const paras = (v) => (Array.isArray(v) ? v : [v]).join('\n\n');
const bullets = (list) => list.map((x) => `- ${x}`).join('\n');
const sep = (lang) => (lang === 'zh' ? '：' : ': ');

export function mermaid(flow, lang) {
  const shape = (n) => {
    const text = L(n.label, lang).replace(/"/g, '#quot;');
    if (n.kind === 'decision') return `${n.id}{"${text}"}`;
    if (n.kind === 'start' || n.kind === 'finish') return `${n.id}(["${text}"])`;
    return `${n.id}["${text}"]`;
  };
  const lines = [`flowchart ${flow.direction === 'LR' ? 'LR' : 'TD'}`];
  for (const n of flow.nodes) lines.push(`    ${shape(n)}`);
  for (const e of flow.edges) {
    const label = L(e.label, lang);
    lines.push(`    ${e.from} -->${label ? `|"${label.replace(/"/g, '#quot;')}"|` : ''} ${e.to}`);
  }
  return '```mermaid\n' + lines.join('\n') + '\n```';
}

function section(spec, lang, key) {
  const s = spec.langs[lang], u = UI[lang], c = sep(lang);
  switch (key) {
    case 'background': return paras(s.background);
    case 'story': return `${u.as} ${person(s.story.as)}\n\n${u.want} ${s.story.want}\n\n${u.so} ${s.story.so}`;
    case 'overview': return paras(s.overview);
    case 'tasks': return s.tasks.map((t) => {
      const head = lang === 'zh' ? `### ${t.id}：${t.name}（${t.points} 点）` : `### ${t.id}: ${t.name} (${t.points} points)`;
      return `${head}\n\n${bullets(t.items)}`;
    }).join('\n\n');
    case 'userFlow': return s.userFlow.map((step, i) => (i ? `→ ${step}` : step)).join('\n\n');
    case 'flow': return mermaid(spec.flow, lang);
    case 'frontend': return s.frontend.none ? s.frontend.none
      : [['pages', 'pages'], ['ui', 'ui'], ['interaction', 'interaction']].filter(([k]) => s.frontend[k])
        .map(([k, label]) => `### ${u[label]}\n\n${bullets(s.frontend[k])}`).join('\n\n');
    case 'tech': return bullets(s.tech);
    case 'nonGoals': return bullets(s.nonGoals);
    case 'acs': return s.acs.map((a) => [`- [ ] **[${a.task}][${a.id}] ${a.summary}**`,
      ...acceptanceFields(a,lang).map(([label,value])=>`  - ${label}${c}${value}`)].join('\n')).join('\n\n');
    case 'testCases': return s.testCases.map((a) => [`- [ ] **[${a.id}] ${a.summary}**`,
      `  - ${lang==='zh'?'对应验收标准':'Acceptance criterion'}${c}${a.acRef} · ${s.acs.find(x=>x.id===a.acRef).summary}`,
      ...testCaseFields(a,lang).map(([label,value])=>`  - ${label}${c}${value}`)].join('\n')).join('\n\n');
    default: return null;
  }
}

function langSpec(spec, lang) {
  const s = spec.langs[lang], u = UI[lang];
  const out = [`>>> ${u.summary}\n\n${bullets(s.summary)}\n\n>>>`];
  for (const key of sectionsFor(spec, lang)) {
    const body = section(spec, lang, key);
    if (body != null) out.push(`## ${u[key]}\n\n${body}`);
  }
  const ref = s.reference || {};
  const refs = [[u.parent, ref.parent], [u.related, ref.related]].filter(([, v]) => v);
  if (refs.length) out.push(`>>> ${u.reference}\n\n${refs.map(([k, v]) => `- ${k}${sep(lang)}${v}`).join('\n')}\n\n>>>`);
  return out.join('\n\n');
}

export function renderMarkdown(spec) {
  const parts = LANGS[spec.mode].map((lang) => langSpec(spec, lang));
  const notice = spec.demoNotice ? `> ${L(spec.demoNotice, 'zh')}\n\n` : '';
  return notice + parts.join('\n\n---\n\n') + '\n';
}

export function mdTitle(spec) {
  return spec.mode === 'zh-en' ? `${L(spec.title, 'zh')} ｜ ${L(spec.title, 'en')}` : L(spec.title, 'zh');
}
