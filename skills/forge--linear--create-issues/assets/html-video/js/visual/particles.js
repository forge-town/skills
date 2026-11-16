// Particles as pure functions of (scene, local time): no simulation state, so any frame can be evaluated
// directly and seeking is exact. A particle exists only while its scene is alive and only behind that scene's
// reveal front (stream) or after its item's reveal (converge) — nothing pre-spawns at the right edge.
(function (root) {
  const HV = root.HV = root.HV || {};
  const MAX = 1200;
  const buf = { x: new Float32Array(MAX), y: new Float32Array(MAX), s: new Float32Array(MAX), a: new Float32Array(MAX), c: new Uint8Array(MAX) };

  const MODES = {
    stream(f, cfg, W, H, push) {
      const { hash, frac, ss, ease } = HV.util, lanes = cfg.lanes || 5, band = cfg.band || [0.32, 0.68];
      const gap = lanes > 1 ? ((band[1] - band[0]) * H) / (lanes - 1) : 0, front = HV.particles.front(f, W);
      for (let i = 0; i < cfg.count; i++) {
        const lane = i % lanes, h1 = hash(i, 1), h2 = hash(i, 2), h3 = hash(i, 3);
        const x = -60 + frac(h2 + f.local * (0.05 + 0.05 * h1) * (cfg.speed || 1)) * (W + 120);
        if (x > front) continue;
        const y = band[0] * H + lane * gap + Math.sin(x * 0.004 + lane * 1.3 + f.local * 0.8) * (cfg.wave ?? 16) + (h3 - 0.5) * (cfg.spread ?? 8);
        push(x, y, 1 + 1.4 * h1, f.alpha * ss(-60, 40, x) * (1 - ss(W - 40, W + 60, x)) * (0.3 + 0.7 * h3), lane);
      }
    },
    converge(f, cfg, W, H, push) {
      const { hash, ss, easeIO } = HV.util, sc = f.scene, n = sc.reveals.length;
      if (!n) return;
      for (let i = 0; i < cfg.count; i++) {
        const k = i % n, q = (f.local - (sc.reveals[k] - sc.start)) / (cfg.travel || 1.1);
        if (q <= 0) continue;
        const h1 = hash(i, 4), h2 = hash(i, 5), h3 = hash(i, 6), ang = h1 * 6.283;
        const tx = ((k + 1) / (n + 1)) * W, ty = (cfg.y ?? 0.5) * H, r0 = 140 + 200 * h2, r1 = 22 + 26 * h3, spin = ang + f.local * 0.5;
        const p = easeIO(q);
        push(tx + (Math.cos(ang) * r0) * (1 - p) + Math.cos(spin) * r1 * p, ty + (Math.sin(ang) * r0 * 0.6) * (1 - p) + Math.sin(spin) * r1 * 0.6 * p,
          0.9 + 1.2 * h2, f.alpha * ss(0, 0.25, q) * (0.35 + 0.65 * h3), k);
      }
    },
    burst(f, cfg, W, H, push) {
      const { hash, ease } = HV.util, grow = ease(f.local / (cfg.reveal || 1.6));
      for (let i = 0; i < cfg.count; i++) {
        const h1 = hash(i, 7), h2 = hash(i, 8), h3 = hash(i, 9), r = (30 + 0.36 * W * h1) * grow, ang = h2 * 6.283 + f.local * 0.06 * (h3 - 0.5);
        push(W / 2 + Math.cos(ang) * r, (cfg.y ?? 0.46) * H + Math.sin(ang) * r * 0.55, 0.8 + 1.2 * h3, f.alpha * (0.2 + 0.8 * h3) * (1 - 0.7 * h1), i);
      }
    },
    drift(f, cfg, W, H, push) {
      const { hash, frac } = HV.util;
      for (let i = 0; i < cfg.count; i++) {
        const h1 = hash(i, 10), h2 = hash(i, 11), h3 = hash(i, 12);
        push(frac(h1 + f.local * 0.01 * (0.3 + h3)) * W, frac(h2 - f.local * 0.006) * H, 0.8 + h3, f.alpha * 0.25 * (0.3 + h3), i);
      }
    },
  };

  HV.particles = {
    MAX, buf, modes: Object.keys(MODES), QUIET_ALPHA: 0.06,
    // stream reveal front in px: starts left of the frame and sweeps right over cfg.reveal seconds
    front(f, W) { const cfg = f.scene.particles || {}; return -60 + (W + 120) * HV.util.ease(f.local / (cfg.reveal || 1.4)); },
    compute(f, W, H) {
      // no particles unless the scene asks for them (the calm default never does)
      if (!f.scene.particles || f.scene.particles.mode === 'none') return 0;
      const cfg = { mode: 'drift', count: 120, ...f.scene.particles };
      cfg.count = Math.min(MAX, cfg.count);
      let n = 0;
      // scene.quiet = calm text area [x0, y0, x1, y1] (0–1): particles there fade to QUIET_ALPHA so copy stays clean
      const q = f.scene.quiet, qx0 = q ? q[0] * W : 0, qy0 = q ? q[1] * H : 0, qx1 = q ? q[2] * W : -1, qy1 = q ? q[3] * H : -1;
      const push = (x, y, s, a, c) => {
        if (x >= qx0 && x <= qx1 && y >= qy0 && y <= qy1) a *= HV.particles.QUIET_ALPHA;
        if (a < 0.01 || n >= MAX) return; buf.x[n] = x; buf.y[n] = y; buf.s[n] = s; buf.a[n] = a; buf.c[n] = c; n++;
      };
      (MODES[cfg.mode] || MODES.drift)(f, cfg, W, H, push);
      return n;
    },
    draw(ctx, n, palette) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        const col = palette[buf.c[i] % palette.length], s = buf.s[i];
        ctx.globalAlpha = buf.a[i] * 0.22; ctx.fillStyle = col; ctx.fillRect(buf.x[i] - s * 2, buf.y[i] - s * 2, s * 4, s * 4);
        ctx.globalAlpha = buf.a[i]; ctx.fillRect(buf.x[i] - s / 2, buf.y[i] - s / 2, s, s);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
