import {readFileSync, writeFileSync, mkdirSync, realpathSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getFormContract, normalizeDraft, validateDraft, toMarkdown, toLinearIssue} from '../../forge--linear--show-issue-form/assets/issue-model.mjs';

// 字段和拼装都使用现有表单。本脚本仅补上归一化前的未知字段检查。
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const contract = JSON.parse(readFileSync(resolve(root, 'forge--linear--show-issue-best-practice/references/issue-contract.json'), 'utf8'));

function object(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(path + ' 必须是对象');
}
function keys(value, allowed, path) {
  object(value, path);
  const extra = Object.keys(value).filter(key => !allowed.includes(key));
  if (extra.length) throw new Error(path + ' 有表单外字段：' + extra.join('、') + '；先归位或清理，再生成');
}
function strings(value, fields, path) {
  for (const key of fields) if (value[key] !== undefined && typeof value[key] !== 'string') throw new Error(path + '.' + key + ' 必须是文字');
}
function array(value, path) {
  if (!Array.isArray(value)) throw new Error(path + ' 必须是数组');
  return value;
}
export function assemble(source, {draft = false} = {}) {
  object(source, '表单');
  // 兼容现有表单下载格式；内部兼容标记不进入 Issue。
  if (Object.hasOwn(source, 'data')) {
    keys(source, ['contractVersion', 'data'], '表单导出');
    if (source.contractVersion !== undefined && source.contractVersion !== contract.version) throw new Error('请先用当前表单打开并重新保存这份草稿');
    source = source.data;
    object(source, '表单');
  }
  if (!['Feature', 'Bugfix'].includes(source.issueType)) throw new Error('请按实际需求填写 issueType：Feature 或 Bugfix');
  const form = getFormContract(contract, source.issueType);
  const fields = form.sections.flatMap(section => section.fields.map(field => field.key));
  const internal = ['retiredTaskIds','legacyInteraction','legacyRegression','legacySummary','legacyDetails','legacySource'];
  for(const key of internal.filter(key=>key!=='retiredTaskIds')) if(source[key]!==undefined) object(source[key],key);
  keys(source, ['issueType', ...fields, ...Object.keys(form.collections), ...internal], '表单');
  if (source.retiredTaskIds !== undefined) {
    array(source.retiredTaskIds, 'retiredTaskIds').forEach(id => {
      if (typeof id !== 'string' || !/^T-\d{2,}$/.test(id)) throw new Error('已停用规则编号无效');
    });
  }
  strings(source, ['issueType', ...fields], '表单');
  for (const [key, spec] of Object.entries(form.collections)) {
    if (source[key] === undefined) continue;
    array(source[key], key).forEach((item, index) => {
      const path = key + '.' + index;
      const ownFields = ['id', ...spec.fields.map(field => field.key)];
      const nested = key === 'acceptance' ? ['steps','legacyProcedure'] : [];
      keys(item, [...ownFields, ...nested], path);
      strings(item, ownFields, path);
      if(key==='acceptance' && item.legacyProcedure!==undefined) {
        const allowed=['when','followupWhen','followupOutput','input','output'];
        keys(item.legacyProcedure,allowed,path+'.legacyProcedure');
        strings(item.legacyProcedure,allowed,path+'.legacyProcedure');
      }
      if (nested.includes('steps') && item.steps !== undefined) array(item.steps, path + '.steps').forEach((step, j) => {
        const allowed = contract.procedure.fields.map(field => field.key);
        keys(step, allowed, path + '.steps.' + j);
        strings(step, allowed, path + '.steps.' + j);
      });
    });
  }
  const normalized = normalizeDraft(source, contract);
  const issues = validateDraft(normalized, contract);
  if (issues.length && !draft) return {issues, markdown: null, linear: null};
  return {issues, markdown: toMarkdown(normalized, contract), linear: toLinearIssue(normalized, contract)};
}

function main() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--draft') { options.draft = true; continue; }
    if (!['--input', '--output', '--linear-output'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('用法：node assemble-issue.mjs --input 表单.json --output issue.md [--draft]');
    const key = args[i].slice(2);
    if (options[key]) throw new Error('重复参数：' + args[i]);
    options[key] = args[++i];
  }
  if (!options.input || !options.output) throw new Error('请指定 --input 和 --output');
  const paths=[options.input,options.output,options['linear-output']].filter(Boolean).map(p=>resolve(p));
  if(new Set(paths).size!==paths.length) throw new Error('输入、正文和原生字段输出需使用不同文件');
  const result = assemble(JSON.parse(readFileSync(resolve(options.input), 'utf8')), options);
  if (result.issues.length) console.error(JSON.stringify({result: '待补', fields: result.issues.map(issue => ({path: issue.path, message: issue.message}))}, null, 2));
  if (result.markdown === null) { process.exitCode = 2; return; }
  mkdirSync(dirname(resolve(options.output)), {recursive: true});
  writeFileSync(resolve(options.output), result.markdown);
  if(options['linear-output']) {
    mkdirSync(dirname(resolve(options['linear-output'])),{recursive:true});
    writeFileSync(resolve(options['linear-output']),JSON.stringify(result.linear,null,2)+'\n');
  }
  console.log((result.issues.length ? '已生成待补草稿：' : '已按表单生成：') + resolve(options.output));
}
if (process.argv[1] && realpathSync(resolve(process.argv[1])) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
