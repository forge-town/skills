import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildIssue } from './render-issue.mjs';
import { checkIssueHtml } from './check-issue-html.mjs';
import { mermaid } from './issue-html/markdown.mjs';

const example = JSON.parse(readFileSync(new URL('../assets/issue-html/example.spec.json', import.meta.url), 'utf8'));
const clone = () => structuredClone(example);
const zhOnly = () => { const s = clone(); s.mode = 'zh-CN'; delete s.langs.en; s.title = { zh: s.title.zh }; return s; };

test('renders complete product tasks and acceptance criteria without an extra challenge', () => {
  const s = clone();
  for (const language of Object.values(s.langs)) {
    delete language.bonus;
    language.summary = language.summary.map((line) => line.replace(/[；;]\s*Bonus[：:].*$/u, ''));
  }
  const r = buildIssue(s);
  assert.equal(r.errors, undefined);
  assert.deepEqual(r.stats.map((stat) => [stat.tasks, stat.acs]), [[3, 5], [3, 5]]);
  assert.doesNotMatch(r.md, /Bonus|### B1/u);
  assert.doesNotMatch(r.html, /sec-bonus|zh-bonus|en-bonus|Bonus Challenge|Bonus 挑战/u);
});

test('rejects an obsolete challenge field or summary instead of publishing it', () => {
  const s = zhOnly();
  s.langs.zh.bonus = { name: '额外挑战', challenge: '旧范围', signal: '旧结果' };
  assert.ok(buildIssue(s).errors?.some((error) => error.includes('bonus')));
  delete s.langs.zh.bonus;
  s.langs.zh.summary.push('Bonus：旧额外挑战');
  assert.ok(buildIssue(s).errors?.some((error) => error.includes('summary')));
  s.langs.zh.summary = 'invalid summary';
  assert.ok(buildIssue(s).errors?.some((error) => error.includes('summary')));
});

test('renders the example in zh-en with static Task, AC and component DOM', () => {
  const r = buildIssue(clone());
  assert.equal(r.errors, undefined);
  assert.deepEqual(r.stats.map((s) => [s.lang, s.tasks, s.acs]), [['zh', 3, 5], ['en', 3, 5]]);
  assert.match(r.md, /\n---\n/);
  // the only script is the optional inline chart reveal; content never depends on it
  const scripts = r.html.match(/<script\b[^>]*>/gi) || [];
  assert.deepEqual(scripts, ['<script data-enhance="lieflat-reveal">']);
  assert.doesNotMatch(r.html, /<link |<script[^>]*\ssrc=/i);
  const body = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '').match(/<main[\s\S]*<\/main>/)[0];
  assert.equal(body(r.html), r.html.match(/<main[\s\S]*<\/main>/)[0], 'business DOM is outside the script');
  assert.match(r.html, /polyformproject\.org\/licenses\/noncommercial\/1\.0\.0/, 'license URL travels with the HTML');
  assert.match(r.html, /@bottom-right \{ content: counter\(page\)/, 'printed folio');
  assert.match(r.html, /<h3 class="ac-summary">非 https Webhook URL 在字段下方显示错误<\/h3>/);
});

test('zh-CN output has a single Chinese spec and no separator', () => {
  const r = buildIssue(zhOnly());
  assert.equal(r.errors, undefined);
  assert.doesNotMatch(r.md, /\n---\n/);
  assert.doesNotMatch(r.html, /id="spec-en"|<hr class="lang-sep">/);
});

test('rejects mixed modes, bad estimates and incomplete AC', () => {
  const mixed = zhOnly(); mixed.langs.en = example.langs.en;
  assert.ok(buildIssue(mixed).errors.some((e) => e.includes('must not contain')));
  const est = clone(); est.meta.estimate = 16;
  assert.ok(buildIssue(est).errors.some((e) => e.includes('≠ estimate')));
  const ac = clone(); ac.langs.en.acs[0].summary = '';
  assert.ok(buildIssue(ac).errors.some((e) => e.includes('summary missing')));

});

test('overlays must sit on a named base page and menus need an anchor', () => {
  const s = clone(); s.components.find((c) => c.kind === 'modal').base = 'missing';
  assert.ok(buildIssue(s).errors.some((e) => e.includes('base')));
  const m = clone(); delete m.components.find((c) => c.kind === 'menu').anchor;
  assert.ok(buildIssue(m).errors.some((e) => e.includes('menu needs anchor')));
});

test('refuses proof leaks in business content', () => {
  const s = clone(); s.langs.zh.background = ['规范值：canonicalPrd'];
  assert.ok(buildIssue(s).errors.some((e) => e.includes('leaks proof content')));
});

test('checker catches CDN, script-only content and Markdown drift', () => {
  const { md, html } = buildIssue(clone());
  assert.deepEqual(checkIssueHtml(html, md).errors, []);
  const cdn = html.replace('</head>', '<link rel="stylesheet" href="https://cdn.example/x.css"></head>');
  assert.ok(checkIssueHtml(cdn, md).errors.some((e) => e.includes('CDN')));
  const drift = md.replace('从行操作菜单打开渠道详情抽屉', '从行菜单打开详情');
  assert.ok(checkIssueHtml(html, drift).errors.some((e) => e.includes('differ from Markdown')));
  const hidden = html.replace(/<main id="main">[\s\S]*<\/main>/, '<main id="main"><div id="content"></div><script>const md = "T1 AC-01";</script></main>');
  const errs = checkIssueHtml(hidden, md).errors;
  assert.ok(errs.some((e) => e.includes('empty mount')) && errs.some((e) => e.includes('expects articles')));
});

test('flow schema is validated and the supplied layout-engine SVG is embedded', () => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-'));
  const s = zhOnly();
  s.flow = { id: 'add-channel', direction: 'TB', svg: { zh: 'flow.zh.svg' }, nodes: [
    { id: 'A', kind: 'start', label: { zh: '点击添加渠道' } }, { id: 'B', kind: 'decision', label: { zh: 'URL 有效？' } },
    { id: 'C', kind: 'success', label: { zh: '列表新增渠道' } }, { id: 'D', kind: 'error', label: { zh: '字段下方报错' } }],
  edges: [{ from: 'A', to: 'B' }, { from: 'B', to: 'C', label: { zh: '是' } }, { from: 'B', to: 'D', label: { zh: '否' } }] };
  // test stub standing in for Graphviz output; real issues must embed engine-generated SVG
  writeFileSync(join(dir, 'flow.zh.svg'), '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flow"><title>flow</title></svg>');
  const ok = buildIssue(s, dir);
  assert.equal(ok.errors, undefined);
  assert.match(ok.md, /B -->\|"是"\| C/);
  assert.match(ok.html, /data-flow="add-channel"[\s\S]*<svg/);
  const bad = structuredClone(s); bad.flow.nodes.push({ id: 'E', kind: 'finish', label: { zh: '孤立' } });
  assert.ok(buildIssue(bad, dir).errors.some((e) => e.includes('unreachable')));
  const nosvg = structuredClone(s); delete nosvg.flow.svg;
  assert.ok(buildIssue(nosvg, dir).errors.some((e) => e.includes('layout-engine SVG')));
  writeFileSync(join(dir, 'evil.svg'), '<svg onload="x()"></svg>');
  const evil = structuredClone(s); evil.flow.svg.zh = 'evil.svg';
  assert.ok(buildIssue(evil, dir).errors.some((e) => e.includes('script')));
  assert.equal(mermaid(s.flow, 'zh').split('\n')[1], 'flowchart TD');
});

test('task chart: Lieflat F5 tick rows, wide + phone layouts, one tick per point, IDs, names, links, Mono, short copy', async () => {
  const { taskTickRows, wrap } = await import('./issue-html/chart.mjs');
  const { html } = buildIssue(clone());
  const zhOnlyHtml = buildIssue(zhOnly()).html;
  for (const lang of ['zh', 'en']) {
    const tasks = example.langs[lang].tasks;
    const art = html.match(new RegExp(`<article class="spec" id="spec-${lang}"[\\s\\S]*?<ol class="tasks">`))[0];
    const card = art.match(/<figure class="lf-card"[\s\S]*?<\/figure>/)[0];
    assert.match(card, /data-chart="lieflat-f5-tick-rows"/);
    assert.match(card, /<!-- Task chart derived from Lieflat Charts[\s\S]*polyformproject\.org/);
    for (const layout of ['wide', 'narrow']) {
      const svg = card.match(new RegExp(`<svg class="lf-svg lf-${layout}"[\\s\\S]*?</svg>`))[0];
      const rows = [...svg.matchAll(/<a href="#([^"]+)" class="lf-row" data-task="(T\d)" data-points="(\d+)">([\s\S]*?)<\/a>/g)];
      assert.deepEqual(rows.map((r) => [r[1], r[2], +r[3]]), tasks.map((t) => [`${lang}-${t.id}`, t.id, t.points]), layout);
      rows.forEach((r, i) => {
        assert.equal((r[4].match(/class="tick"/g) || []).length, tasks[i].points, 'one tick per point');
        const text = r[4].replace(/<title>[\s\S]*?<\/title>/, '').replace(/<[^>]+>/g, '');
        assert.ok(text.includes(tasks[i].id) && text.replace(/\s+/g, ' ').includes(wrap(tasks[i].name, 11, 999)[0].slice(0, 6)), 'ID + name in the row');
        assert.match(r[4], /class="lf-zero"/, 'zero baseline per row');
      });
      if (layout === 'narrow') assert.ok(+svg.match(/viewBox="0 0 (\d+)/)[1] <= 260 && /font-size="11"/.test(svg), 'phone layout uses a narrow viewBox with large labels');
      assert.deepEqual([...new Set(svg.match(/#[0-9A-Fa-f]{6}/g))].filter((c) => !['#1C1C1A', '#8F8E88', '#C6C5BF', '#DEDDD6', '#4A4944'].includes(c)), [], 'Mono colors only');
    }
    const copy = ['lf-title', 'lf-sub', 'lf-src'].map((c) => card.match(new RegExp(`class="${c}">([^<]*)<`))[1]).join(' ');
    assert.ok(copy.length < (lang === 'zh' ? 90 : 130), `compact title/unit/source copy: ${copy}`);
    assert.doesNotMatch(card, /not days|不是天数/);
  }
  const zhCard = zhOnlyHtml.match(/<figure class="lf-card"[\s\S]*?<\/figure>/)[0].replace(/<!--[\s\S]*?-->/, '').replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(zhCard.replace(/Tick Rows|Lieflat|Issue|Task|F5|T\d/g, ''), /[A-Za-z]{3,}/, 'zh-CN chart copy is Chinese apart from IDs/names');
  const long = taskTickRows([{ id: 'T1', name: 'A very long English task name that keeps going well beyond one line of chart width', points: 8 }, { id: 'T2', name: '短名称', points: 4 }], 'en', (id) => `#en-${id}`);
  assert.ok((long.match(/<tspan x=/g) || []).length >= 5, 'long labels wrap in both layouts');
  const xs = [...long.matchAll(/class="tick" x1="([\d.]+)"/g)].map((m) => +m[1]);
  assert.ok(Math.max(...xs) < 104 + 34 * 6.9);
});

test('palettes are scoped: editorial shell is Lieflat Mono, product UI tokens live only on .canvas', () => {
  const css = readFileSync(new URL('../assets/issue-html/issue.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, body]) => ({ sel: sel.trim(), body }));
  const tokenRules = rules.filter((r) => /--destructive\s*:/.test(r.body));
  assert.equal(tokenRules.length, 1, 'one semantic token block');
  assert.equal(tokenRules[0].sel, '.canvas');
  for (const t of ['background', 'foreground', 'primary', 'primary-foreground', 'muted', 'muted-foreground', 'border', 'input', 'ring', 'destructive', 'popover']) assert.match(tokenRules[0].body, new RegExp(`--${t}\\s*:`));
  const mono = ['#F0EFEB', '#1C1C1A', '#4A4944', '#6A6963', '#8F8E88', '#B0AFA9', '#C6C5BF', '#D8D7D1', '#DEDDD6'];
  const rest = rules.filter((r) => r !== tokenRules[0]);
  const used = [...new Set(rest.flatMap((r) => r.body.match(/#[0-9a-fA-F]{3,8}\b/g) || []).map((c) => c.toUpperCase()))];
  assert.deepEqual(used.filter((c) => !mono.includes(c)), [], 'outside the token block every literal color is a Mono token');
  const product = (sel) => sel.split(',').every((s) => /^\s*(\.canvas|\.p-|\.is-)/.test(s));
  for (const r of rest) {
    if (/var\(--(destructive|primary|muted-foreground|popover|ring|input)\)/.test(r.body)) assert.ok(product(r.sel), `product token used outside the prototype layer: ${r.sel}`);
    for (const m of r.body.matchAll(/rgba?\(([^)]*)\)/g)) assert.ok(/^\s*28,\s*28,\s*26/.test(m[1]) || (product(r.sel) && /^\s*(0|10),\s*\1,\s*\1/.test(m[1])), `${r.sel}: ${m[0]}`);
  }
});

test('prototype markup follows shadcn anatomy: variants, invalid field, open trigger, destructive menu item, overlay parts', () => {
  const html = buildIssue(clone()).html, spec = example;
  const fig = (id) => html.match(new RegExp(`<figure[^>]*data-component="${id}"[\\s\\S]*?</figure>`))[0];
  assert.match(fig('channel-list'), /class="p-btn p-primary" data-variant="primary"/);
  assert.match(fig('channel-list'), /class="p-btn p-ghost p-btn-icon"[^>]*aria-label=/, 'icon-only row action keeps its accessible name');
  const custom = fig('add-channel-custom');
  assert.match(custom, /class="p-field is-invalid" data-invalid="true"[\s\S]*?aria-invalid="true"[\s\S]*?class="p-error" role="alert"/);
  assert.match(custom, /class="p-btn p-outline"[^>]*><span>取消/, 'unspecified variant renders as outline');
  assert.match(custom, /role="tab" aria-selected="true" class="is-active">自定义/);
  const menu = fig('channel-row-menu');
  assert.match(menu, /<tr data-state="selected">[\s\S]*?aria-expanded="true"[\s\S]*?class="p-menu"/, 'menu hangs from the open trigger of the first row');
  assert.match(menu, /p-menusep[\s\S]*?class="p-menuitem p-danger" data-variant="destructive">停用/);
  for (const id of ['add-channel-catalog', 'add-channel-custom', 'channel-detail']) assert.match(fig(id), /p-scrim[\s\S]*?role="dialog"[\s\S]*?p-ov-title[\s\S]*?p-close/);
  assert.match(fig('add-channel-catalog'), /role="radio" aria-checked="true"/);
  assert.equal((html.match(/data-component="/g) || []).length, spec.components.length * 2, 'one canvas per component and language');
});

// Issue estimates use the two planning tiers; task sums must match in both languages.
for (const mode of ['zh-CN', 'zh-en']) {
  for (const points of [[8], [4, 4], [4, 8, 4], [8, 8], [4, 4, 4, 4]]) {
    test(`${mode} renders ${points.join('+')} points without artificial splitting`, () => {
      const s = mode === 'zh-CN' ? zhOnly() : clone();
      s.meta.estimate = points.reduce((sum, p) => sum + p, 0);
      for (const l of Object.values(s.langs)) {
        l.tasks = points.map((p, i) => ({ ...l.tasks[Math.min(i, l.tasks.length - 1)], id: `T${i + 1}`, points: p }));
        l.acs = l.tasks.map((task, i) => ({ ...l.acs[0], id: `AC-${String(i + 1).padStart(2, '0')}`, task: task.id }));
        l.testCases=l.acs.map((a,i)=>({...l.testCases[0],id:`TC-${String(i+1).padStart(2,'0')}`,acRef:a.id}));
      }
      const result = buildIssue(s);
      assert.equal(result.errors, undefined);
      assert.equal(result.stats[0].tasks, points.length);
      assert.equal(result.stats.length, mode === 'zh-CN' ? 1 : 2);
      assert.equal(checkIssueHtml(result.html, result.md).errors.length, 0);
    });
  }
}
for (const estimate of [0, 1, 2, 4, 12, 24, '8', null]) {
  test(`rejects unsupported Issue estimate ${JSON.stringify(estimate)}`, () => {
    const s = zhOnly(); s.meta.estimate = estimate;
    if (typeof estimate === 'number' && estimate > 0 && estimate <= 8) {
      s.langs.zh.tasks = [{ ...s.langs.zh.tasks[0], points: estimate }];
      s.langs.zh.acs = s.langs.zh.acs.filter(a => a.task === 'T1');
    }
    assert.ok(buildIssue(s).errors.some(e => e.includes('must be 8 or 16')));
  });
}
test('rejects an unsupported Task size even when Issue total is sixteen', () => {
  const s = zhOnly(); s.meta.estimate = 16;
  s.langs.zh.tasks = [{ ...s.langs.zh.tasks[0], points: 16 }];
  s.langs.zh.acs = s.langs.zh.acs.filter(a => a.task === 'T1');
  assert.ok(buildIssue(s).errors.some(e => e.includes('points must be 1, 2, 4 or 8')));
});

// Imported legacy test labels are ignored; new cases do not require a testing framework.
test('acceptance remains business-facing with or without legacy implementation labels', () => {
  const clean = buildIssue(clone());
  assert.equal(clean.errors, undefined);
  const old = clone();
  old.langs.zh.acs[0].type = 'E2E Test';
  old.langs.en.acs[0].type = 'Storybook Test';
  const migrated = buildIssue(old);
  assert.equal(migrated.errors, undefined);
  assert.equal(migrated.md, clean.md);
  assert.equal(migrated.html, clean.html);
  assert.doesNotMatch(clean.md, /E2E Test|Storybook Test/);
  assert.doesNotMatch(clean.html, /E2E Test|Storybook Test|class="ttype"|data-type=/);
  assert.match(clean.md, /\[T1\]\[AC-01\]/);
  assert.ok(checkIssueHtml(clean.html.replace('class="acid"', 'class="ttype"'), clean.md).errors.length);
});

test('criteria and test cases are separate and each case must keep its matching result',()=>{
 const {html,md}=buildIssue(clone());
 const criteria=md.split('## 验收标准\n')[1].split('## 测试用例\n')[0];
 for(const label of ['Given','When','Then'])assert.ok(criteria.includes(label+'：'));assert.doesNotMatch(criteria,/测试输入|测试步骤/);
 assert.match(md,/## 测试用例/);assert.match(md,/- \[ \] \*\*\[TC-01\]/);
 const missing=html.replace(/<article class="test-case ac"[\s\S]*?<\/article>/,'');
 assert.ok(checkIssueHtml(missing,md).errors.some(e=>/has no test case/.test(e)));
 const drift=md.replace('[TC-01]','[TC-99]');
 assert.ok(checkIssueHtml(html,drift).errors.some(e=>/test cases differ/.test(e)));
});

test('explicit Given and When are mandatory even when concrete test data and steps exist',()=>{
 for(const field of ['given','when']) {
  const spec=clone();delete spec.langs.zh.acs[0][field];
  assert.ok(buildIssue(spec).errors.some(e=>e.includes(field+' missing')));
 }
});

test('multiple concrete GWT cases can reference one business criterion and unknown references are rejected',()=>{
 const spec=clone();
 for(const lang of Object.keys(spec.langs))spec.langs[lang].testCases.push({...spec.langs[lang].testCases[0],id:'TC-06',summary:lang==='zh'?'另一组具体输入':'Another concrete input'});
 assert.equal(buildIssue(spec).errors,undefined);
 spec.langs.zh.testCases[0].acRef='AC-99';assert.ok(buildIssue(spec).errors.some(e=>e.includes('unknown acceptance criterion')));
 const incomplete=clone();delete incomplete.langs.zh.testCases[0].then;
 assert.ok(buildIssue(incomplete).errors.some(e=>e.includes('then missing')));
});
