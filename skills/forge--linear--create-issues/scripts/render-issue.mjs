// Approved issue spec (JSON) → issue.md + issue.html. Validates the spec, runs the proof-leak check and the regex markup
// lint (check-issue-html.mjs), and never overwrites a good artifact on failure. Browser DOM verification is a separate step.
// Usage: node scripts/render-issue.mjs <issue.spec.json> --out <issue-dir> [--check]
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS } from './issue-html/common.mjs';
import { validateSpec, checkSvg } from './issue-html/spec.mjs';
import { renderMarkdown } from './issue-html/markdown.mjs';
import { renderHtml } from './issue-html/html.mjs';
import { findFormalizationLeaks } from './validate-issue-body.mjs';
import { checkIssueHtml } from './check-issue-html.mjs';

export function buildIssue(spec, specDir = '.') {
  const errors = validateSpec(spec);
  const svgs = {};
  if (!errors.length && spec.flow) {
    for (const lang of LANGS[spec.mode]) {
      try {
        svgs[lang] = readFileSync(resolve(specDir, spec.flow.svg[lang]), 'utf8').replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>/gi, '').trim();
        errors.push(...checkSvg(svgs[lang], `flow.svg.${lang}`));
      } catch (e) { errors.push(`flow.svg.${lang}: ${e.message}`); }
    }
  }
  if (errors.length) return { errors };
  const md = renderMarkdown(spec);
  const leaks = findFormalizationLeaks(md);
  if (leaks.length) return { errors: leaks.map((l) => `issue.md line ${l.line} leaks proof content: ${l.text}`) };
  const html = renderHtml(spec, svgs);
  const check = checkIssueHtml(html, md);
  return check.errors.length ? { errors: check.errors.map((e) => `issue.html: ${e}`) } : { md, html, stats: check.stats };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), specPath = args[0], outIdx = args.indexOf('--out');
  if (!specPath || (outIdx < 0 && !args.includes('--check'))) {
    console.error('Usage: node render-issue.mjs <issue.spec.json> --out <issue-dir> | --check');
    process.exit(2);
  }
  const spec = JSON.parse(readFileSync(specPath, 'utf8'));
  const result = buildIssue(spec, dirname(resolve(specPath)));
  if (result.errors) {
    console.error(JSON.stringify({ spec: specPath, errors: result.errors }, null, 2));
    process.exit(1);
  }
  if (outIdx >= 0) {
    const out = resolve(args[outIdx + 1]);
    mkdirSync(out, { recursive: true });
    for (const [name, body] of [['issue.md', result.md], ['issue.html', result.html]]) {
      writeFileSync(join(out, `.${name}.tmp`), body);
      renameSync(join(out, `.${name}.tmp`), join(out, name));
    }
    console.log(`Wrote ${join(out, 'issue.md')} and ${join(out, 'issue.html')} ${JSON.stringify(result.stats)}`);
  } else console.log(`Spec valid ${JSON.stringify(result.stats)}`);
}
