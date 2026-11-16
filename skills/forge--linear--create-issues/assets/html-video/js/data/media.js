// Optional embedded media for file:// playback: { "<src used in story>": "data:audio/...;base64,..." }.
// Regenerate with: node scripts/video/embed-media.mjs <video-dir> <audio files...>
(function (root) {
  const HV = root.HV = root.HV || {};
  HV.media = HV.media || {};
})(typeof window !== 'undefined' ? window : globalThis);
