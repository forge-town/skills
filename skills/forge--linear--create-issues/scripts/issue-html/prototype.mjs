// Static prototype canvases. Every component gets its own named figure; overlays keep their spatial
// relationship to the base page inside the canvas (scrim, dialog frame, drawer edge, anchored menu).
// Markup is a static adaptation of shadcn/ui component anatomy (Button, Table, Field/Input, Tabs, Dialog, Sheet,
// DropdownMenu, Alert) driven by the semantic tokens in issue.css `.canvas`; it is not the interactive Radix/React code.
import { esc, L, UI } from './common.mjs';

// unspecified variant renders as shadcn "outline"; danger is accepted as an alias of destructive
const VARIANTS = { primary: 'primary', default: 'primary', secondary: 'secondary', outline: 'outline', ghost: 'ghost', danger: 'destructive', destructive: 'destructive', link: 'link' };

function button(b, lang, ctx) {
  const label = L(b.label, lang), variant = VARIANTS[b.variant] || 'outline', open = b.ref && ctx.anchor === b.ref;
  const icon = b.icon ? `<span class="p-icon" aria-hidden="true">${esc(b.icon)}</span>` : '';
  const name = b.tooltip ? ` aria-label="${esc(L(b.tooltip, lang))}" title="${esc(L(b.tooltip, lang))}"` : '';
  const cls = `p-btn p-${variant}${label ? '' : ' p-btn-icon'}`;
  const html = `<span class="${cls}" data-variant="${variant}"${name}${open ? ' aria-expanded="true"' : ''}>${icon}${label ? `<span>${esc(label)}</span>` : ''}</span>`;
  return open ? `<span class="p-anchor">${html}${ctx.popover}</span>` : html;
}

function field(b, lang) {
  const value = L(b.value, lang), help = L(b.help, lang), invalid = !!b.error;
  const error = invalid ? `<span class="p-error" role="alert"><span class="p-error-icon" aria-hidden="true">!</span>${esc(L(b.error, lang))}</span>` : '';
  return `<div class="p-field${invalid ? ' is-invalid' : ''}" data-invalid="${invalid}"><span class="p-label">${esc(L(b.label, lang))}</span>`
    + `<span class="p-input${value ? '' : ' is-placeholder'}"${invalid ? ' aria-invalid="true"' : ''}>${esc(value || L(b.placeholder, lang))}</span>`
    + `${help ? `<span class="p-help">${esc(help)}</span>` : ''}${error}</div>`;
}

function block(b, lang, ctx) {
  switch (b.type) {
    case 'bar':
      return `<div class="p-bar"><div class="p-bar-title"><span class="p-h">${esc(L(b.title, lang))}</span>${b.sub ? `<small>${esc(L(b.sub, lang))}</small>` : ''}</div>`
        + `<div class="p-actions">${(b.actions || []).map((a) => button(a, lang, ctx)).join('')}</div></div>`;
    case 'table': {
      const head = b.columns.map((c) => `<th scope="col">${esc(L(c, lang))}</th>`).join('') + (b.rowAction ? '<th scope="col" class="p-rowact"><span class="sr-only">⋯</span></th>' : '');
      const rows = b.rows.map((r, i) => {
        const open = b.rowAction && i === 0 && ctx.anchor === b.rowAction.ref;
        return `<tr${open ? ' data-state="selected"' : ''}>${r.map((c) => `<td>${esc(L(c, lang))}</td>`).join('')}`
          + (b.rowAction ? `<td class="p-rowact">${button(i === 0 ? b.rowAction : { ...b.rowAction, ref: null }, lang, ctx)}</td>` : '') + '</tr>';
      }).join('');
      return `<div class="p-table"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    case 'field':
      return field(b, lang);
    case 'choices':
      return `<ul class="p-choices" role="radiogroup">${b.items.map((it) => `<li class="${it.selected ? 'is-selected' : ''}" role="radio" aria-checked="${!!it.selected}">`
        + `<span class="p-radio" aria-hidden="true"></span><span class="p-choice-text"><b>${esc(L(it.label, lang))}</b>`
        + `${it.desc ? `<small>${esc(L(it.desc, lang))}</small>` : ''}</span></li>`).join('')}</ul>`;
    case 'tabs':
      return `<div class="p-tabs" role="tablist">${b.items.map((it, i) => `<span role="tab" aria-selected="${i === (b.active || 0)}" class="${i === (b.active || 0) ? 'is-active' : ''}">${esc(L(it, lang))}</span>`).join('')}</div>`;
    case 'notice':
      return `<p class="p-notice p-${esc(b.tone || 'info')}" role="${b.tone === 'error' ? 'alert' : 'status'}">${esc(L(b.text, lang))}</p>`;
    case 'empty':
      return `<div class="p-empty"><p>${esc(L(b.text, lang))}</p>${b.action ? button(b.action, lang, ctx) : ''}</div>`;
    case 'dl':
      return `<dl class="p-dl">${b.items.map(([k, v]) => `<dt>${esc(L(k, lang))}</dt><dd>${esc(L(v, lang))}</dd>`).join('')}</dl>`;
    case 'text':
      return `<p class="p-text">${esc(L(b.text, lang))}</p>`;
    default:
      throw new Error(`Unknown prototype block type: ${b.type}`);
  }
}

const blocks = (list, lang, ctx = {}) => (list || []).map((b) => block(b, lang, ctx)).join('');

function pageSurface(page, lang, ctx = {}) {
  const route = page.route ? `<div class="p-route"><span class="p-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${esc(L(page.route, lang))}</span></div>` : '';
  return `<div class="p-page">${route}<div class="p-page-body">${blocks(page.blocks, lang, ctx)}</div></div>`;
}

function menu(c, lang) {
  const firstDanger = c.items.findIndex((it) => it.tone === 'danger' || it.tone === 'destructive');
  const items = c.items.map((it, i) => {
    const danger = it.tone === 'danger' || it.tone === 'destructive';
    const sep = danger && i === firstDanger && i > 0 ? '<span class="p-menusep" role="separator"></span>' : '';
    return `${sep}<span role="menuitem" class="p-menuitem${danger ? ' p-danger' : ''}${i === 0 ? ' is-highlighted' : ''}"${danger ? ' data-variant="destructive"' : ''}>${esc(L(it.label, lang))}</span>`;
  }).join('');
  return `<span class="p-menu" role="menu">${items}</span>`;
}

export function prototypeCanvas(c, all, lang) {
  const base = all.find((b) => b.id === c.base);
  const u = UI[lang];
  if (c.kind === 'page') return pageSurface(c, lang);
  if (c.kind === 'menu') return pageSurface(base, lang, { anchor: c.anchor, popover: menu(c, lang) });
  const frame = `<div class="p-${c.kind}" role="dialog" aria-modal="true" aria-label="${esc(L(c.title, lang))}">`
    + `<div class="p-ov-head"><b class="p-ov-title">${esc(L(c.title, lang))}</b></div>`
    + `<span class="p-close" aria-label="${u.close}" title="${u.close}">×</span>`
    + `<div class="p-ov-body">${blocks(c.blocks, lang)}</div>`
    + (c.footer ? `<div class="p-ov-foot">${c.footer.map((b) => button(b, lang, {})).join('')}</div>` : '') + '</div>';
  return `<div class="p-under" aria-hidden="true">${pageSurface(base, lang)}</div><div class="p-scrim"></div>${frame}`;
}

export function prototypeSection(spec, lang, idOf) {
  const u = UI[lang], all = spec.components;
  const index = `<nav class="proto-index" aria-label="${u.protoIndex}"><ol>${all.map((c) =>
    `<li><a href="#${idOf(c.id)}"><span class="kind kind-${c.kind}">${u.kinds[c.kind]}</span>${esc(L(c.name, lang))}</a></li>`).join('')}</ol></nav>`;
  const figures = all.map((c) => `<figure class="proto proto-${c.kind}" id="${idOf(c.id)}" data-component="${esc(c.id)}" data-kind="${c.kind}">`
    + `<figcaption><span class="kind kind-${c.kind}">${u.kinds[c.kind]}</span><b>${esc(L(c.name, lang))}</b>`
    + `<span class="proto-meta"><span>${u.trigger}${lang === 'zh' ? '：' : ': '}${esc(L(c.trigger, lang))}</span>`
    + `<span>${u.state}${lang === 'zh' ? '：' : ': '}${esc(L(c.state, lang))}</span></span></figcaption>`
    + `<div class="canvas canvas-${c.kind}">${prototypeCanvas(c, all, lang)}</div></figure>`).join('');
  return index + figures;
}
