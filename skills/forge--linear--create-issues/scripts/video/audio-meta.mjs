// Duration of an MPEG-1/2/2.5 Layer III file by walking its frames (no ffprobe needed). Skips ID3v2 tags and
// Xing/Info headers are counted like ordinary frames, so results match decoders to within one frame (~24–26 ms).
const BITRATES = {
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};
const RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

export function mp3Duration(buf) {
  let i = 0;
  if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'ID3') {
    i = 10 + (((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f));
  }
  let frames = 0, samples = 0, sampleRate = 0;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) { i++; continue; }
    const ver = (buf[i + 1] >> 3) & 3, layer = (buf[i + 1] >> 1) & 3, bi = buf[i + 2] >> 4, si = (buf[i + 2] >> 2) & 3, pad = (buf[i + 2] >> 1) & 1;
    if (ver === 1 || layer !== 1 || bi === 0 || bi === 15 || si === 3) { i++; continue; }
    const kbps = BITRATES[ver === 3 ? 1 : 2][bi], sr = RATES[ver][si], spf = ver === 3 ? 1152 : 576;
    const size = Math.floor(((spf / 8) * kbps * 1000) / sr) + pad;
    if (size < 4) { i++; continue; }
    frames++; samples += spf; sampleRate = sr; i += size;
  }
  if (!frames) throw new Error('no MPEG audio frames found');
  return { duration: samples / sampleRate, frames, sampleRate };
}
