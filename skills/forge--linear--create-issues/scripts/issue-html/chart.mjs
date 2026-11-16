// Task-estimate chart, rendered at build time as static SVG (complete with JavaScript disabled, in print and with
// reduced motion). Derived from Lieflat Charts · Lupi Basics F5 "Tick Rows": templates/basics-gallery.html, card
// "Six teams, shipped and counted", renderer "// ════ C1 · tick rows ════". PolyForm Noncommercial License 1.0.0 —
// see third_party/lieflat/. Kept: the row queue (zero at X0, guide at y + 9, hairline ticks with the template's
// deterministic rnd() height/opacity jitter, a dot under every fifth tick, end-of-row value 800 weight), Mono tokens,
// title + unit subtitle + source row. Adapted: one tick = one estimated point on an 8-point task guide with unit marks
// and a per-row zero baseline; rows carry Task ID + full name linked to the task block. Two static layouts are
// emitted: "wide" keeps the template geometry (400-unit viewBox, X0 = 104, ID at x = 94, 44-px pitch); "narrow"
// re-flows the same queue for phones (ID + name above the queue, larger glyphs) instead of shrinking the wide SVG.
import { esc } from './common.mjs';

const INK = '#1C1C1A', MUTED = '#8F8E88', FAINT = '#C6C5BF', GRID = '#DEDDD6', LABEL = '#4A4944';
const rnd = (i, k) => Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000; // verbatim from the template
const TASK_MAX = 8; // estimation-guide.md: a Task is 4 or 8 points
export const LICENSE_NOTICE = 'Task chart derived from Lieflat Charts (made at moxt.ai), Lupi Basics F5 Tick Rows '
  + '(templates/basics-gallery.html, renderer "C1 · tick rows"). Licensed under the PolyForm Noncommercial License 1.0.0: '
  + 'https://polyformproject.org/licenses/noncommercial/1.0.0 . No commercial-use rights are granted by that license.';

const COPY = {
  zh: { title: (n, sum) => `${n} 个 Task，共 ${sum} 估算点`, sub: '一格 = 1 估算点 · 导轨上限 8 点',
    src: '来源：本 Issue 的 Task 估点 · Lieflat F5', unit: '点', foot: '0 为零点基线' },
  en: { title: (n, sum) => `${n} tasks, ${sum} estimated points`, sub: 'one tick = one estimated point · guide = 8-point limit',
    src: 'SOURCE: TASK ESTIMATES · LIEFLAT F5 TICK ROWS', unit: 'pt', foot: '0 = ZERO BASELINE' },
};

const LAYOUTS = {
  wide: { W: 400, X0: 104, GUIDE: 34 * 6.9, PITCH: 44, label: 9, lineH: 11, value: 11, axis: 7, foot: 7, wrapW: 286, idInline: false, tick: 1 },
  narrow: { W: 260, X0: 14, GUIDE: 208, PITCH: 50, label: 11, lineH: 14, value: 14, axis: 9, foot: 8.5, wrapW: 232, idInline: true, tick: 1.15 },
};

// greedy wrap by approximate glyph width (CJK ≈ 1 em, Latin ≈ 0.56 em)
export function wrap(text, size, maxW) {
  const width = (s) => [...s].reduce((w, ch) => w + (/[⺀-￿]/.test(ch) ? size : size * 0.56), 0);
  const tokens = text.match(/[⺀-￿]|[^\s⺀-￿]+\s*|\s+/g) || [text];
  const lines = [''];
  for (const tok of tokens) {
    const cur = lines[lines.length - 1];
    if (cur && width(cur + tok) > maxW) lines.push(tok.trimStart()); else lines[lines.length - 1] = cur + tok;
  }
  return lines.map((l) => l.trim()).filter(Boolean);
}

function svgFor(tasks, lang, hrefOf, kind) {
  const c = COPY[lang], g = LAYOUTS[kind], scale = Math.max(TASK_MAX, ...tasks.map((t) => t.points)), PX = g.GUIDE / scale;
  const sum = tasks.reduce((a, t) => a + t.points, 0);
  let y = kind === 'wide' ? 40 : 18, rows = '';
  tasks.forEach((t, i) => {
    const idW = g.idInline ? (t.id.length * g.label * 0.62 + 6) : 0;
    const lines = wrap(t.name, g.label, g.wrapW - idW);
    if (kind === 'narrow') y += lines.length * g.lineH;
    else y += (lines.length - 1) * g.lineH;
    const top = kind === 'narrow' ? y - 6 - lines.length * g.lineH : y - 12 - (lines.length - 1) * g.lineH;
    const label = lines.map((l, j) => `<tspan x="${g.X0}" dy="${j ? g.lineH : 0}">${j === 0 && g.idInline ? `<tspan font-weight="800">${t.id}</tspan> ` : ''}${esc(l)}</tspan>`).join('');
    let ticks = '';
    for (let k = 0; k < t.points; k++) {
      const x = +(g.X0 + k * PX + PX / 2).toFixed(2), h = +((9 + rnd(k + 1, i + 2) * 6) * g.tick).toFixed(2), op = +(0.55 + rnd(k + 3, i + 5) * 0.45).toFixed(3);
      ticks += `<line class="tick" x1="${x}" y1="${y + 9}" x2="${x}" y2="${+(y + 9 - h).toFixed(2)}" stroke="${INK}" stroke-width="${kind === 'wide' ? 0.9 : 1.1}" opacity="${op}"/>`;
      if (k % 5 === 4) ticks += `<circle cx="${x}" cy="${y + 13}" r=".8" fill="${FAINT}"/>`;
    }
    let units = '';
    for (let k = 1; k <= scale; k++) units += `<line x1="${+(g.X0 + k * PX).toFixed(2)}" y1="${y + 9}" x2="${+(g.X0 + k * PX).toFixed(2)}" y2="${y + 11.5}" stroke="${GRID}" stroke-width=".6"/>`;
    rows += `<a href="${hrefOf(t.id)}" class="lf-row" data-task="${t.id}" data-points="${t.points}"><title>${esc(`${t.id} · ${t.name} — ${t.points} ${c.unit}`)}</title>`
      + (g.idInline ? '' : `<text class="lf-id" x="94" y="${y + 3}" font-size="8" font-weight="700" fill="${LABEL}" text-anchor="end" letter-spacing=".08em">${t.id}</text>`)
      + `<text class="lf-label" x="${g.X0}" y="${top}" font-size="${g.label}" font-weight="600" fill="${INK}">${label}</text>`
      + `<line class="lf-zero" x1="${g.X0}" y1="${y - 7}" x2="${g.X0}" y2="${y + 13}" stroke="${MUTED}" stroke-width=".6"/>`
      + `<line x1="${g.X0}" y1="${y + 9}" x2="${+(g.X0 + g.GUIDE).toFixed(2)}" y2="${y + 9}" stroke="${GRID}" stroke-width=".6"/>${units}${ticks}`
      + `<text class="lf-value" x="${+(g.X0 + t.points * PX + 8).toFixed(2)}" y="${y + (kind === 'wide' ? 4 : 6)}" font-size="${g.value}" font-weight="800" fill="${INK}">${t.points}</text></a>`;
    y += g.PITCH - (kind === 'narrow' ? 14 : 0);
  });
  const bottom = y - g.PITCH + 18 + (kind === 'narrow' ? 14 : 0);
  const axis = `<text x="${g.X0}" y="${bottom + g.axis + 3}" font-size="${g.axis}" font-weight="600" fill="${MUTED}" text-anchor="middle">0</text>`
    + `<text x="${+(g.X0 + g.GUIDE).toFixed(2)}" y="${bottom + g.axis + 3}" font-size="${g.axis}" font-weight="600" fill="${MUTED}" text-anchor="middle">${scale}</text>`;
  const H = +(bottom + g.axis + 6 + g.foot * 2.4).toFixed(2);
  const foot = `<text x="${g.W / 2}" y="${+(H - g.foot * 0.6).toFixed(2)}" font-size="${g.foot}" font-weight="600" fill="#8F8E88" text-anchor="middle" letter-spacing=".1em">${esc(c.foot)}</text>`;
  return `<svg class="lf-svg lf-${kind}" data-layout="${kind}" viewBox="0 0 ${g.W} ${H}" role="img" aria-label="${esc(c.title(tasks.length, sum))}" preserveAspectRatio="xMidYMid meet">${axis}${rows}${foot}</svg>`;
}

export function taskTickRows(tasks, lang, hrefOf) {
  const c = COPY[lang], scale = Math.max(TASK_MAX, ...tasks.map((t) => t.points)), sum = tasks.reduce((a, t) => a + t.points, 0);
  return `<figure class="lf-card" data-chart="lieflat-f5-tick-rows" data-unit="estimated-point" data-scale="${scale}">`
    + `<!-- ${LICENSE_NOTICE} -->`
    + `<h3 class="lf-title">${esc(c.title(tasks.length, sum))}</h3><p class="lf-sub">${esc(c.sub)}</p>`
    + svgFor(tasks, lang, hrefOf, 'wide') + svgFor(tasks, lang, hrefOf, 'narrow')
    + `<figcaption class="lf-src">${esc(c.src)}</figcaption></figure>`;
}

// Optional progressive enhancement, mirroring Mono's obsReveal: reveal when scrolled into view, click the card to
// replay, cancel running animations before a replay (cleanup), quarticOut timing (900 ms, 80 ms per row, 12 ms per
// tick). Nothing is hidden by default: without JS, with reduced motion, or when printing, the static SVG is final.
export const CHART_REVEAL_SCRIPT = `(() => {
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const EASE = 'cubic-bezier(.25, 1, .5, 1)';
  document.querySelectorAll('.lf-card').forEach((card) => {
    let anims = [];
    const clear = () => { anims.forEach((a) => a.cancel()); anims = []; };
    const go = () => {
      clear();
      if (reduce.matches) return;
      card.querySelectorAll('svg.lf-svg').forEach((svg) => {
        if (!svg.getBoundingClientRect().height) return;
        svg.querySelectorAll('.lf-row').forEach((row, i) => {
          row.querySelectorAll('.tick').forEach((t, k) => anims.push(t.animate([{ opacity: 0 }, { opacity: t.getAttribute('opacity') }], { duration: 900, delay: i * 80 + k * 12, easing: EASE, fill: 'backwards' })));
          row.querySelectorAll('.lf-value').forEach((v) => anims.push(v.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 400 + i * 80, easing: EASE, fill: 'backwards' })));
        });
      });
    };
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { go(); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(card);
    card.addEventListener('click', (e) => { if (!e.target.closest('a')) go(); });
    card.dataset.reveal = 'ready';
    addEventListener('beforeprint', clear);
  });
})();`;
