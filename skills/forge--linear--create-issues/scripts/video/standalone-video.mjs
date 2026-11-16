// Bundle a generated classic-script player for download as one HTML attachment. The original folder is preserved.
// Usage: node standalone-video.mjs <video-dir> --out <video.html>
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export function standaloneVideo(dir) {
  const root = resolve(dir), read = (name) => {
    const path = resolve(root, name);
    if (!path.startsWith(root + sep)) throw new Error(`Asset outside video folder: ${name}`);
    return readFileSync(path, 'utf8');
  };
  // Validate the actual playback data, rather than interpreting the presence of a media.js file as embedded speech.
  const context = vm.createContext({});
  for (const name of ['js/data/media.js', 'js/data/story.js']) vm.runInContext(read(name), context);
  for (const line of context.HV.story.narration || []) {
    if (line.src && !context.HV.media?.[line.src]?.startsWith('data:audio/')) throw new Error(`Narration is not embedded: ${line.src}`);
  }
  let html = read('index.html');
  html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi, (_, src) => {
    const css = read(src);
    if (/@import\b|url\s*\(/i.test(css)) throw new Error(`CSS dependencies must be embedded first: ${src}`);
    return `<style data-source="${src}">\n${css}\n</style>`;
  });
  html = html.replace(/<script\s+src="([^"]+)"\s*><\/script>/gi, (_, src) => {
    // A downloaded file has no sibling folders. Language selection remains available through the two issue attachments.
    const setup = src === 'js/ui/player.js' ? 'HV.story.ui.alt = null;\n' : '';
    return `<script data-source="${src}">\n${(setup + read(src)).replace(/<\/script/gi, '<\\/script')}\n</script>`;
  });
  if (/<script\b[^>]*\bsrc=|<link\b[^>]*rel="stylesheet"/i.test(html)) throw new Error('Unbundled player dependency');
  const notices = ['LICENSE', 'PROVENANCE.md', 'THIRD_PARTY_NOTICES.md'].filter((name) => existsSync(join(root, 'third_party/lieflat', name)))
    .map((name) => `${name}\n${read(`third_party/lieflat/${name}`)}`).join('\n\n');
  if (notices) html = html.replace('</body>', `<!-- Third-party notices\n${notices.replace(/--/g, '- -')}\n-->\n</body>`);
  return html;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), out = args[args.indexOf('--out') + 1];
  if (!args[0] || !args.includes('--out') || !out) { console.error('Usage: standalone-video.mjs <video-dir> --out <video.html>'); process.exit(2); }
  const html = standaloneVideo(args[0]);
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(out, html);
  console.log(`Wrote ${resolve(out)} (${Buffer.byteLength(html)} bytes)`);
}
