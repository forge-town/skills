// Text layer. Every scene gets its own <section>; only the live scene is visible, so copy from a finished or
// upcoming scene can never linger or appear early. Element timing comes from the master timeline.
(function (root) {
  const HV = root.HV = root.HV || {};
  let sections = [], caption = null;

  function sceneHtml(s) {
    const { esc } = HV.util, rel = (t) => (t - s.start).toFixed(3);
    const kicker = s.kicker ? `<p class="kicker" data-in="0.15">${esc(s.kicker)}</p>` : '';
    const head = s.headline ? `<h2 class="headline" data-in="0.35">${esc(s.headline)}</h2>` : '';
    const sub = s.sub ? `<p class="sub" data-in="${(s.subAt ?? 1.2).toFixed(3)}">${esc(s.sub)}</p>` : '';
    const items = (s.items || []).map((it, i) => {
      const label = typeof it === 'string' ? it : it.label, tag = typeof it === 'string' ? '' : it.tag;
      const pos = s.layout === 'nodes' ? ` style="left:${(((i + 1) / (s.items.length + 1)) * 100).toFixed(3)}%"` : '';
      return `<li data-in="${rel(s.reveals[i])}"${pos}>${tag ? `<b>${esc(tag)}</b>` : ''}<span>${esc(label)}</span></li>`;
    }).join('');
    return `<div class="scene-copy">${kicker}${head}${sub}${items ? `<ol class="items">${items}</ol>` : ''}</div>${HV.taskVisuals?.html(s) || ''}`;
  }

  HV.overlay = {
    init(el, tl, captionEl) {
      el.innerHTML = tl.scenes.map((s) => `<section class="scene layout-${s.layout || 'center'}${s.visuals?.length ? ' has-visuals' : ''}" data-scene="${s.index}" hidden>${sceneHtml(s)}</section>`).join('');
      sections = [...el.querySelectorAll('section.scene')].map((sec) => ({ sec, visual: HV.taskVisuals?.init(sec, tl.scenes[+sec.dataset.scene]), els: [...sec.querySelectorAll('[data-in]')].map((e) => ({ e, tin: +e.dataset.in })) }));
      caption = captionEl;
    },
    render(f, tl, captionsOn) {
      const { ease, clamp } = HV.util;
      sections.forEach(({ sec, els, visual }, i) => {
        const live = i === f.scene.index;
        if (sec.hidden === live) sec.hidden = !live;
        if (!live) return;
        sec.style.opacity = f.alpha.toFixed(3);
        // calm scenes drift: a barely-there push-in across the scene's life (pure function of local time)
        const drift = f.scene.drift ?? 0;
        sec.style.transform = drift ? `scale(${(1 + drift * HV.util.easeIO(f.local / f.scene.len)).toFixed(4)})` : '';
        HV.taskVisuals?.render(visual, f.local);
        // Long scope paragraphs must not reserve space for every future item or push the artboard out of frame.
        const items = visual ? els.filter(({ e }) => e.matches('.items > li')) : [];
        const activeItem = items.findLastIndex(({ tin }) => f.local >= tin);
        items.forEach(({ e }, index) => { e.hidden = index !== activeItem; });
        const rise = f.scene.rise ?? 14, fade = f.scene.fade ?? 0.45;
        for (const { e, tin } of els) {
          const p = clamp((f.local - tin) / fade), k = ease(p);
          e.style.opacity = p > 0 ? k.toFixed(3) : '0';
          e.style.setProperty('--rise', `${((1 - k) * rise).toFixed(2)}px`);
        }
      });
      const line = captionsOn ? tl.captionAt(f.t) : '';
      caption.hidden = !line;
      if (caption.textContent !== line) caption.textContent = line;
    },
    visibleScenes: () => sections.filter(({ sec }) => !sec.hidden).map(({ sec }) => +sec.dataset.scene),
  };
})(typeof window !== 'undefined' ? window : globalThis);
