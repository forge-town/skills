import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { standaloneVideo } from './standalone-video.mjs';

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'video-single-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const name of ['css', 'js/data', 'js/ui']) mkdirSync(join(dir, name), { recursive: true });
  const write = (name, value) => writeFileSync(join(dir, name), value);
  write('index.html', '<html><head><link rel="stylesheet" href="css/video.css"></head><body><script src="js/data/media.js"></script><script src="js/data/story.js"></script><script src="js/ui/player.js"></script></body></html>');
  write('css/video.css', 'body { color: white; }');
  write('js/data/media.js', 'var HV={media:{"media/vo.mp3":"data:audio/mpeg;base64,AA=="}};');
  write('js/data/story.js', 'HV.story={ui:{alt:"../video-en/index.html"},narration:[{src:"media/vo.mp3"}],text:"<\\/script>"};');
  write('js/ui/player.js', 'globalThis.booted=HV.story.ui.alt===null && !!HV.media[HV.story.narration[0].src];');
  return { dir, write };
}

test('single HTML preserves script order and embedded audio, with no broken sibling language link', (t) => {
  const { dir } = fixture(t), html = standaloneVideo(dir), ctx = vm.createContext({});
  for (const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) vm.runInContext(match[1], ctx);
  assert.equal(ctx.booted, true);
  assert.equal(ctx.HV.story.text, '</script>');
  assert.doesNotMatch(html, /<script\b[^>]*src=|<link\b[^>]*rel="stylesheet"/i);
});

test('missing embedded speech prevents a deceptively complete standalone file', (t) => {
  const { dir, write } = fixture(t);
  write('js/data/media.js', 'var HV={media:{}};');
  assert.throws(() => standaloneVideo(dir), /Narration is not embedded/);
});

test('external CSS dependencies are rejected instead of producing an incomplete offline file', (t) => {
  const { dir, write } = fixture(t);
  write('css/video.css', '@import "other.css";');
  assert.throws(() => standaloneVideo(dir), /CSS dependencies/);
});
