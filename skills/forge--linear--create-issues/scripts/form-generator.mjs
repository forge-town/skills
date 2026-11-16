import {existsSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';

export async function assembleForm(source, options = {}) {
  const sibling = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const roots = [process.env.LINEAR_FORM_SKILLS_ROOT, sibling, resolve(process.env.CODEX_HOME || resolve(homedir(), '.codex'), 'skills'), resolve(homedir(), '.agents/skills')].filter(Boolean);
  const generator = roots.map(root => resolve(root, 'forge--linear--review-issue/scripts/assemble-issue.mjs')).find(existsSync);
  if (!generator) throw new Error('缺少统一表单生成器：请同级安装三个表单技能，或设置 LINEAR_FORM_SKILLS_ROOT；不能改用手写正文。');
  const module = await import(pathToFileURL(generator).href);
  return module.assemble(source, options);
}
