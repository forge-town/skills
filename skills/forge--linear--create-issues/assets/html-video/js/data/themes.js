// Replaceable visual themes. Pick with story.theme or ?theme=<name>. System fonts only — no CDN.
// `calm` is the default: a light warm-neutral stage that matches the shadcn-style UI artboards, with a slow continuous
// backdrop and no particles. `acid` and `dusk` are opt-in cinematic looks (particles, beams, cut effects).
(function (root) {
  const HV = root.HV = root.HV || {};
  const sans = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
  const mono = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  HV.themes = {
    calm: { name: 'calm', calm: true, bg: '#f6f5f2', page: '#ecebe7', panel: '#ffffff', line: '#dedcd6', ink: '#1c1c1a', muted: '#6b6a64',
      palette: ['#4f6f63', '#b08d57', '#6d7f9c', '#9a6f6a'], glow: ['#fbf3e4', '#e7eef0'], font: sans, mono },
    // opt-in cinematic: acid-cyberpunk on near-black
    acid: { name: 'acid', bg: '#04060b', page: '#000000', panel: '#111620', line: '#2a3242', ink: '#eef4ff', muted: '#8391a8', palette: ['#c6ff3d', '#2de2e6', '#ff3df2', '#ffb53d'], font: sans, mono },
    // opt-in cinematic, softer palette
    dusk: { name: 'dusk', bg: '#0d1020', page: '#000000', panel: '#141a2e', line: '#2a3050', ink: '#f4f1ea', muted: '#a3a0b8', palette: ['#8fb8ff', '#f2c879', '#c49bff', '#7fe0c8'], font: sans, mono },
  };
})(typeof window !== 'undefined' ? window : globalThis);
