// Minimal Chrome DevTools Protocol driver (Node ≥ 22 built-in WebSocket, locally installed Chrome; no npm deps).
// Set CHROME=/path/to/chrome when it is not at the default macOS location.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ extraArgs = [], mute = true } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'cdp-'));
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu-sandbox', '--hide-scrollbars', ...(mute ? ['--mute-audio'] : []), ...extraArgs, 'about:blank'], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 100 && !target; i++) {
    await sleep(100);
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* starting */ }
  }
  if (!target) throw new Error('Chrome did not expose a page target');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map(), listeners = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? rej(new Error(`${msg.error.message}`)) : res(msg.result);
    } else if (msg.method) listeners.forEach((fn) => fn(msg));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const k = ++id; pending.set(k, { res, rej }); ws.send(JSON.stringify({ id: k, method, params })); });
  const errors = [];
  listeners.push((m) => {
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(`${m.params.entry.text} ${m.params.entry.url || ''}`);
  });
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  const page = {
    send, errors,
    on: (fn) => listeners.push(fn),
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async viewport(width, height = 900) { await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 }); },
    async goto(url) {
      const loaded = new Promise((res) => listeners.push((m) => m.method === 'Page.loadEventFired' && res()));
      await send('Page.navigate', { url }); await loaded; await sleep(150);
    },
    async screenshot(clip, full = false) {
      const params = { format: 'png', captureBeyondViewport: full };
      if (clip) params.clip = { ...clip, scale: 1 };
      return Buffer.from((await send('Page.captureScreenshot', params)).data, 'base64');
    },
    async click(x, y) {
      for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    },
    async key(code, key) {
      for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, code, key, windowsVirtualKeyCode: key === ' ' ? 32 : 0 });
    },
    async close() { try { ws.close(); } catch { /* closed */ } proc.kill('SIGKILL'); await sleep(200); rmSync(profile, { recursive: true, force: true }); },
  };
  return page;
}
export { sleep };
