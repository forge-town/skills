// Shared math helpers. Classic script on window.HV so the film also runs from file://; Node tests load it with vm.
(function (root) {
  const HV = root.HV = root.HV || {};
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const ss = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
  const ease = (p) => 1 - Math.pow(1 - clamp(p), 3);
  const easeIO = (p) => { p = clamp(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  const frac = (v) => v - Math.floor(v);
  // stateless hash: the same (i, salt) always yields the same value, so frames are pure functions of time
  const hash = (i, salt = 0) => frac(Math.sin(i * 127.1 + salt * 311.7) * 43758.5453);
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
  const fmt = (s) => { s = Math.max(0, Math.floor(s)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  HV.util = { clamp, ss, ease, easeIO, frac, hash, hex, rgba, fmt, esc };
})(typeof window !== 'undefined' ? window : globalThis);
