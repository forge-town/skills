// Real browser DOM verification for issue.html (headless Chrome via CDP): JavaScript disabled at 1440/1024/390 and
// enabled at 1440, page-level overflow, visible Task/AC blocks, per-component overlay geometry, console errors.
// Print checks and PDF output are opt-in; only use these flags when the user explicitly requests them.
// Unlike check-issue-html.mjs (regex markup lint), this queries the rendered DOM and layout.
// Usage: node scripts/browser/check-issue-dom.mjs <issue.html>... [--out <screenshot-dir>] [--print] [--pdf]
import { writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch, sleep } from './cdp.mjs';

const argv = process.argv.slice(2), files = [];
let output = 'issue-dom-check', checkPrint = false, exportPdf = false;
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--out') {
    if (!argv[i + 1] || argv[i + 1].startsWith('--')) { console.error('--out requires a directory'); process.exit(2); }
    output = argv[++i];
  } else if (arg === '--print') checkPrint = true;
  else if (arg === '--pdf') { exportPdf = true; checkPrint = true; }
  else if (arg.startsWith('--')) { console.error(`Unknown option: ${arg}`); process.exit(2); }
  else files.push(arg);
}
const OUT = resolve(output);
if (!files.length) { console.error('Usage: check-issue-dom.mjs <issue.html>... [--out <dir>] [--print] [--pdf]'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const report = [];
let failed = 0;

const probe = `(() => {
  const r = (el) => el.getBoundingClientRect();
  const doc = document.documentElement;
  const out = { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, scriptsRan: !!window.__probeScript, issues: [] };
  out.articles = [...document.querySelectorAll('article.spec')].map((a) => ({
    lang: a.lang, tasks: a.querySelectorAll('li.task').length, acs: a.querySelectorAll('article.ac[data-ac]').length,
    acVisible: [...a.querySelectorAll('article.ac[data-ac]')].every((ac) => ['.ac-summary', '.acid', '.tid'].every((s) => r(ac.querySelector(s)).height > 0) && ac.querySelectorAll('.gwt dd').length === 3),
    testCasesVisible: [...a.querySelectorAll('article.test-case')].every(c=>r(c).height>0 && c.querySelectorAll('.gwt dd').length===3),
    comps: [...a.querySelectorAll('figure.proto')].map((f) => f.dataset.kind + ':' + f.dataset.component),
    chart: (() => {
      const svg = [...a.querySelectorAll('.lf-card svg.lf-svg')].find((v) => v.getBoundingClientRect().height > 0);
      if (!svg) return [];
      const vb = svg.viewBox.baseVal.width, k = svg.getBoundingClientRect().width / vb, px = (n) => (n ? +n.getAttribute('font-size') * k : 0);
      return [...svg.querySelectorAll('.lf-row')].map((g) => ({ layout: svg.dataset.layout, id: g.dataset.task, points: +g.dataset.points, ticks: g.querySelectorAll('.tick').length,
        href: g.getAttribute('href'), target: !!a.querySelector(g.getAttribute('href')), vb,
        labelRight: Math.max(...[...g.querySelectorAll('.lf-label')].map((t) => t.getBBox().x + t.getBBox().width)),
        labelPx: +px(g.querySelector('.lf-label')).toFixed(1), valuePx: +px(g.querySelector('.lf-value')).toFixed(1), idPx: +px(g.querySelector('.lf-id') || g.querySelector('.lf-label')).toFixed(1),
        idText: (g.querySelector('.lf-id') || g.querySelector('.lf-label tspan tspan') || {}).textContent,
        finalOpacity: [...g.querySelectorAll('.tick')].every((t) => Math.abs(+getComputedStyle(t).opacity - +t.getAttribute('opacity')) < 1e-3),
        visible: g.getBoundingClientRect().height > 0 }));
    })(),
    taskIds: [...a.querySelectorAll('li.task')].map((t) => t.dataset.task),
    text: a.innerText.length,
  }));
  for (const f of document.querySelectorAll('figure.proto')) {
    const c = f.querySelector('.canvas'), cr = r(c), kind = f.dataset.kind;
    if (kind === 'modal' || kind === 'drawer') {
      const s = r(f.querySelector('.p-scrim')), d = r(f.querySelector('.p-' + kind));
      if (Math.abs(s.left - cr.left) > 1 || Math.abs(s.right - cr.right) > 1 || Math.abs(s.top - cr.top) > 1 || Math.abs(s.bottom - cr.bottom) > 1) out.issues.push(f.id + ': scrim does not match its canvas');
      if (d.left < cr.left - 1 || d.right > cr.right + 1 || d.top < cr.top - 1 || d.bottom > cr.bottom + 1) out.issues.push(f.id + ': overlay escapes canvas');
      if (kind === 'drawer' && Math.abs(d.right - cr.right) > 1) out.issues.push(f.id + ': drawer not attached to right edge');
      if (kind === 'modal' && Math.abs((d.left + d.right) / 2 - (cr.left + cr.right) / 2) > 2) out.issues.push(f.id + ': dialog not centred');
    }
    if (kind === 'menu') {
      const a = r(f.querySelector('.p-anchor > .p-btn')), m = r(f.querySelector('.p-menu'));
      if (m.top < a.bottom - 1 || m.bottom > cr.bottom + 1 || m.left < cr.left - 1 || a.right > cr.right + 1 || [...f.querySelectorAll('.p-table')].some((t) => t.scrollWidth > t.clientWidth + 1)) out.issues.push(f.id + ': menu not below its trigger inside canvas');
    }
    for (const b of f.querySelectorAll('.p-btn, .p-menuitem, .tid, .acid')) if (b.scrollWidth > b.clientWidth + 1) out.issues.push(f.id + ': control text overflows ' + b.textContent);
    if (cr.right > doc.clientWidth + 1) out.issues.push(f.id + ': canvas wider than viewport');
  }
  for (const w of document.querySelectorAll('.table-wrap')) if (r(w).right > doc.clientWidth + 1) out.issues.push('contract table wrapper exceeds viewport');
  for (const a of out.articles) {
    if (JSON.stringify(a.chart.map((c) => c.id)) !== JSON.stringify(a.taskIds)) out.issues.push(a.lang + ': chart rows do not match tasks');
    for (const c of a.chart) if (c.ticks !== c.points || !c.target || !c.visible || c.labelRight > c.vb + 0.5 || c.labelPx < 12 || c.valuePx < 13 || c.idPx < 10 || c.idText !== c.id || !c.finalOpacity)
      out.issues.push(a.lang + ' chart ' + c.id + ': ' + JSON.stringify(c));
  }
  out.tableScrolls = [...document.querySelectorAll('.table-wrap')].map((w) => w.scrollWidth > w.clientWidth);
  out.animations = document.getAnimations().length;
  out.tocPosition = getComputedStyle(document.querySelector('.toc')).position;
  out.tocRow = getComputedStyle(document.querySelector('.toc ol')).display;
  return out;
})()`;

const page = await launch();
// screenshots show the final frame of the chart's optional entrance fade
await page.send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
try {
  for (const file of files) {
    const url = pathToFileURL(resolve(file)).href, name = basename(dirname(resolve(file)));
    for (const [js, widths] of [[false, [1440, 1024, 390]], [true, [1440]]]) {
      await page.send('Emulation.setScriptExecutionDisabled', { value: !js });
      for (const w of widths) {
        await page.viewport(w);
        page.errors.length = 0;
        await page.goto(url);
        const res = await page.eval(probe);
        const ok = res.scrollWidth <= res.clientWidth && !res.issues.length && (js || res.animations === 0) && res.articles.every((a) => a.tasks >= 1 && a.acs > 0 && a.acVisible && a.testCasesVisible && a.text > 500) && !page.errors.length;
        if (!ok) failed++;
        report.push({ file: name, width: w, js, ok, ...res, consoleErrors: [...page.errors] });
        if (!js) {
          writeFileSync(`${OUT}/${name}-${w}-nojs.png`, await page.screenshot(null, true));
          if (w !== 1024) {
            const rects = await page.eval(`[...document.querySelectorAll('article.spec')][0] && [...[...document.querySelectorAll('article.spec')][0].querySelectorAll('figure.proto')].map(f => { const b = f.getBoundingClientRect(); return { id: f.id, x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height }; })`);
            for (const { id, ...clip } of rects) writeFileSync(`${OUT}/${name}-${w}-${id}.png`, await page.screenshot(clip, true));
          }
        }
      }
    }
    // chart motion with JS: reduced motion never animates; otherwise reveal on view, click replay without stacking
    await page.send('Emulation.setScriptExecutionDisabled', { value: false });
    for (const pref of ['reduce', 'no-preference']) {
      await page.send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'prefers-reduced-motion', value: pref }] });
      await page.viewport(1440); await page.goto(url);
      const m = { pref, atLoad: await page.eval('document.getAnimations().length') };
      await page.eval(`document.querySelector('.lf-card').scrollIntoView({ block: 'center' })`); await sleep(200);
      m.inView = await page.eval('document.getAnimations().length');
      m.perCard = await page.eval(`(() => { const s = [...document.querySelector('.lf-card').querySelectorAll('svg.lf-svg')].find((v) => v.getBoundingClientRect().height); return s.querySelectorAll('.tick, .lf-value').length; })()`);
      await sleep(1800);
      const final = `[...document.querySelectorAll('.lf-card .tick')].every((t) => Math.abs(+getComputedStyle(t).opacity - +t.getAttribute('opacity')) < 1e-3) && document.getAnimations().filter((a) => a.playState === 'running').length === 0`;
      m.finalAfterReveal = await page.eval(final);
      await page.eval(`(() => { const t = document.querySelector('.lf-card .lf-title'); t.click(); t.click(); })()`);
      m.afterDoubleReplay = await page.eval(`document.getAnimations().filter((a) => a.playState !== 'finished').length`);
      await sleep(1800);
      m.finalAfterReplay = await page.eval(final);
      m.ok = pref === 'reduce' ? m.atLoad === 0 && m.inView === 0 && m.afterDoubleReplay === 0 && m.finalAfterReplay
        : m.atLoad === 0 && m.inView === m.perCard && m.finalAfterReveal && m.afterDoubleReplay === m.perCard && m.finalAfterReplay;
      if (!m.ok) failed++;
      report.push({ file: name, motion: m });
    }
    if (checkPrint) {
      await page.send('Emulation.setEmulatedMedia', { media: 'print' });
      const print = await page.eval(`({ toc: getComputedStyle(document.querySelector('.toc')).display, shadow: getComputedStyle(document.querySelector('.p-modal') || document.body).boxShadow,
        folio: [...document.styleSheets].some((sh) => [...sh.cssRules].some((r) => r.cssText.includes('counter(page)'))), chartLayout: [...document.querySelectorAll('.lf-card svg.lf-svg')].filter((v) => getComputedStyle(v).display !== 'none').map((v) => v.dataset.layout).join() })`);
      const printOk = print.toc === 'none' && print.shadow === 'none' && print.folio && /^wide(,wide)*$/.test(print.chartLayout);
      if (!printOk) failed++;
      const result = { file: name, print, printOk };
      if (exportPdf) {
        const pdf = await page.send('Page.printToPDF', { printBackground: false });
        const bytes = Buffer.from(pdf.data, 'base64');
        writeFileSync(`${OUT}/${name}-print.pdf`, bytes);
        result.pdfBytes = bytes.length;
      }
      report.push(result);
      await page.send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    }
  }
} finally { await page.close(); }
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
for (const r of report) console.log(r.motion ? `${r.file} motion ${JSON.stringify(r.motion)}` : r.print ? `${r.file} print toc=${r.print.toc} shadow=${r.print.shadow} folio=${r.print.folio} chart=${r.print.chartLayout}${r.pdfBytes === undefined ? '' : ` pdf=${r.pdfBytes}B`} ok=${r.printOk}`
  : `${r.file} w=${r.width} js=${r.js} ok=${r.ok} scroll=${r.scrollWidth}/${r.clientWidth} toc=${r.tocPosition}/${r.tocRow} tables=${r.tableScrolls} ` +
    `articles=${JSON.stringify(r.articles.map((a) => [a.lang, a.tasks, a.acs, a.comps.length, a.acVisible, a.chart.map((c) => `${c.id}:${c.ticks}:${c.layout}:${c.labelPx}/${c.valuePx}px`).join(' ')]))} issues=${JSON.stringify(r.issues)} errors=${JSON.stringify(r.consoleErrors)}`);
process.exitCode = failed ? 1 : 0;
