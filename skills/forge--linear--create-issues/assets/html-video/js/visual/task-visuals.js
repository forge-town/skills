// Task artboards share the master clock. No timers, CSS keyframes or iframe scripts.
(function (root) {
  const HV = root.HV = root.HV || {};
  HV.taskVisuals = {
    indexAt(scene, local) {
      let index = 0;
      scene.visuals.forEach((v, i) => { if (local >= v.at) index = i; });
      return index;
    },
    html(s) {
      if (!s.visuals?.length) return '';
      const { esc } = HV.util;
      return `<div class="task-visuals" aria-label="${esc(s.headline)}">${s.visuals.map((v, i) =>
        `<figure class="task-shot" data-shot="${i}" data-source="${esc(v.source)}" hidden>`
        + `<figcaption><span class="visual-kind">${v.type === 'frontend' ? 'UI' : 'FLOW'}</span><b>${esc(v.label)}</b><small>${i + 1} / ${s.visuals.length}</small></figcaption>`
        + `<div class="artboard">${v.type === 'frontend' ? `<iframe sandbox="" tabindex="-1" title="${esc(v.label)}"></iframe>`
          : `<img alt="${esc(v.label)}" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(v.svg)}">`}</div>`
        + `<p class="visual-state">${esc(v.state || v.label)}</p></figure>`).join('')}</div>`;
    },
    init(sec, scene) {
      if (!scene.visuals?.length) return null;
      const shots = [...sec.querySelectorAll('.task-shot')];
      shots.forEach((el, i) => { const frame = el.querySelector('iframe'); if (frame) frame.srcdoc = scene.visuals[i].html; });
      return { scene, shots };
    },
    render(view, local) {
      if (!view) return;
      const index = this.indexAt(view.scene, local);
      view.shots.forEach((el, i) => {
        el.hidden = i !== index;
        if (i !== index) return;
        const age = local - view.scene.visuals[i].at;
        el.style.opacity = HV.util.ss(0, view.scene.shotFade ?? 0.3, age).toFixed(3);
        const frame = el.querySelector('iframe');
        if (frame) {
          const box = el.querySelector('.artboard'), scale = Math.min(box.clientWidth / 768, box.clientHeight / 480);
          frame.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }
      });
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
