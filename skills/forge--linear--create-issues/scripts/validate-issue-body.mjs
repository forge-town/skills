import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleForm } from './form-generator.mjs';

// Detect internal proof output, not legitimate product references to Lean.
export function findFormalizationLeaks(markdown) {
  const rules = [
    /^(?:#{1,6}\s*|>>>\s*)(?:Lean\s*形式化|Lean\s+Formalization)(?:\s|$)/iu,
    /\bcanonicalPrd(?:_\w+)?\b/u,
    /^(?:[-*]\s*)?(?:反向生成\s*PRD|Reverse-generated PRD)\s*[：:]/iu,
    /^(?:[-*]\s*)?(?:良构定理|来源归一定理|Well-formedness theorem|Source normalization theorem)\s*[：:]/iu,
    /^(?:[-*]\s*)?(?:Task\s*\/\s*AC\s*(?:追踪|traceability))\s*[：:]/iu,
  ];
  return markdown.split(/\r?\n/u).flatMap((line, index) =>
    rules.some((rule) => rule.test(line)) ? [{ line: index + 1, text: line }] : [],
  );
}

if (process.argv[1] && realpathSync(resolve(process.argv[1])) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const formIndex = args.indexOf('--form');
  let form;
  if (formIndex !== -1) {
    if (!args[formIndex + 1] || args[formIndex + 1].startsWith('--')) throw new Error('--form 必须指定表单 JSON');
    form = args.splice(formIndex, 2)[1];
  }
  const paths = args;
  let canonical;
  if (form) {
    if (paths.length !== 1) throw new Error('--form 只接受一个对应的 Markdown 输出');
    const result = await assembleForm(JSON.parse(readFileSync(form, 'utf8')));
    if (result.markdown === null || result.issues.length) throw new Error('表单未完整通过校验，不能写入 Linear');
    canonical = result.markdown;
  }
  if (!paths.length) {
    console.error('Usage: node validate-issue-body.mjs [--form form.json] <issue.md> [...]');
    process.exitCode = 2;
  }
  for (const path of paths) {
    const content = readFileSync(path, 'utf8');
    if (canonical !== undefined && content !== canonical) {
      console.error('正文不是当前表单生成结果，请修改表单后重新生成：' + path);
      process.exitCode = 1;
      continue;
    }
    const leaks = findFormalizationLeaks(content);
    if (leaks.length) {
      console.error(JSON.stringify({ path, leaks }));
      process.exitCode = 1;
    } else {
      console.log(`Business body passed: ${path}`);
    }
  }
}
