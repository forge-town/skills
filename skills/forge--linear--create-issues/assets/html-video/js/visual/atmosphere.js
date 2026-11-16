// Mist and flowing light beams (Canvas 2D, closed-form in time). Beams share the stream reveal front, so they
// never appear ahead of the scene's own reveal.
(function (root) {
  const HV = root.HV = root.HV || {};

  function mist(ctx, f, W, H, theme) {
    const { frac, rgba } = HV.util, amount = (f.scene.mist ?? 0.4) * f.alpha, pal = theme.palette;
    if (amount <= 0.01) return;
    ctx.globalCompositeOperation = 'screen';
    for (let k = 0; k < 4; k++) {
      const x = W * (0.15 + 0.7 * frac(k * 0.37 + f.t * 0.008)), y = H * (0.5 + 0.28 * Math.sin(f.t * 0.06 + k * 1.7)), r = W * (0.28 + 0.07 * k);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(pal[k % pal.length], 0.16 * amount)); g.addColorStop(1, rgba(pal[k % pal.length], 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function beams(ctx, f, W, H, theme) {
    const count = f.scene.beams || 0;
    if (!count) return;
    const { frac, rgba } = HV.util, cfg = f.scene.particles || {}, band = cfg.band || [0.32, 0.68], front = HV.particles.front(f, W);
    if (front <= 0) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, Math.min(W, front), H);
    const q = f.scene.quiet; // keep beams out of the calm text area
    if (q) { const x0 = q[0] * W, x1 = Math.min(q[2] * W, front, W); if (x1 > x0) ctx.rect(x0, q[1] * H, x1 - x0, (q[3] - q[1]) * H); }
    ctx.clip('evenodd');
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < count; k++) {
      const y = H * (band[0] + ((band[1] - band[0]) * (k + 0.5)) / count), col = theme.palette[k % theme.palette.length];
      const head = frac(f.local * 0.22 + k * 0.31) * 1.4 - 0.2, g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, rgba(col, 0));
      g.addColorStop(Math.max(0, Math.min(1, head - 0.18)), rgba(col, 0.05 * f.alpha));
      g.addColorStop(Math.max(0, Math.min(1, head)), rgba(col, 0.55 * f.alpha));
      g.addColorStop(Math.max(0, Math.min(1, head + 0.02)), rgba(col, 0.05 * f.alpha));
      g.addColorStop(1, rgba(col, 0));
      ctx.strokeStyle = g; ctx.lineWidth = 1.5 + (k % 2);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 24) {
        const yy = y + Math.sin(x * 0.004 + k * 1.3 + f.local * 0.8) * (cfg.wave ?? 16);
        x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Calm default backdrop: two very large, faint warm/cool glows drifting on GLOBAL time (not scene time), so the
  // background flows continuously through every cut. No particles, no flashes.
  function backdrop(ctx, f, W, H, theme) {
    const { rgba } = HV.util, glow = theme.glow || [theme.bg, theme.bg];
    for (let k = 0; k < 2; k++) {
      const x = W * (0.3 + 0.4 * k + 0.08 * Math.sin(f.t * 0.021 + k * 2.1)), y = H * (0.35 + 0.3 * k + 0.06 * Math.cos(f.t * 0.017 + k));
      const g = ctx.createRadialGradient(x, y, 0, x, y, W * 0.65);
      g.addColorStop(0, rgba(glow[k], 0.9)); g.addColorStop(1, rgba(glow[k], 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  }

  HV.atmosphere = { mist, beams, backdrop };
})(typeof window !== 'undefined' ? window : globalThis);
