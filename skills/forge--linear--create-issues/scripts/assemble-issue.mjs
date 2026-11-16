import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {assembleForm} from './form-generator.mjs';
import {findFormalizationLeaks} from './validate-issue-body.mjs';

const args=process.argv.slice(2), options={};
for(let i=0;i<args.length;i++) {
  if(args[i]==='--draft'){options.draft=true;continue;}
  if(!['--input','--output','--linear-output'].includes(args[i]) || !args[i+1] || args[i+1].startsWith('--')) throw new Error('用法：assemble-issue.mjs --input form.json --output issue.md [--linear-output linear.json] [--draft]');
  const key=args[i].slice(2);if(options[key])throw new Error('重复参数：'+args[i]);options[key]=args[++i];
}
if(!options.input||!options.output)throw new Error('必须指定输入表单和输出正文');
const paths=[options.input,options.output,options['linear-output']].filter(Boolean).map(p=>resolve(p));
if(new Set(paths).size!==paths.length)throw new Error('输入与输出文件不能互相覆盖');
const result=await assembleForm(JSON.parse(readFileSync(options.input,'utf8')),{draft:!!options.draft});
if(result.issues.length)console.error(JSON.stringify(result.issues,null,2));
if(result.markdown===null)process.exitCode=2;
else {
  if(findFormalizationLeaks(result.markdown).length)throw new Error('表单含内部形式化内容，先在表单中清理');
  mkdirSync(dirname(resolve(options.output)),{recursive:true});writeFileSync(options.output,result.markdown);
  if(options['linear-output']){mkdirSync(dirname(resolve(options['linear-output'])),{recursive:true});writeFileSync(options['linear-output'],JSON.stringify(result.linear,null,2)+'\n');}
}
