import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
export function buildForm(): string {
  const source = resolve(skillRoot, '../forge--linear--show-issue-best-practice');
  const contract = JSON.parse(readFileSync(resolve(source,'references/issue-contract.json'),'utf8'));
  const example = {
    Todo:JSON.parse(readFileSync(resolve(source,'best-practice-examples/todo-feature.json'),'utf8')),
    Survivors:JSON.parse(readFileSync(resolve(source,'best-practice-examples/survivors-feature.json'),'utf8')),
  };
  const assets = resolve(skillRoot,'assets');
  const model = readFileSync(resolve(assets,'issue-model.mjs'),'utf8').replace(/^export /gm,'');
  return readFileSync(resolve(assets,'form-shell.html'),'utf8')
    .replace('/* FORM_STYLES */',()=>readFileSync(resolve(assets,'form.css'),'utf8'))
    .replace('/* ISSUE_CONTRACT */',()=>safeJson(contract))
    .replace('/* ISSUE_EXAMPLE */',()=>safeJson(example))
    .replace('/* FORM_SCRIPT */',()=>"(function(){\n" + model + '\n' + readFileSync(resolve(assets,'form.js'),'utf8') + '\n})();');
}
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(resolve(process.argv[1]))).href) {
  const output = resolve(skillRoot,'assets/issue-form.html');
  writeFileSync(output,buildForm());
  process.stdout.write(output+'\n');
}
