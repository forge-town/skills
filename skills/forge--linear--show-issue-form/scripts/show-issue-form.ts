import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { normalizeDraft, getIssueType } from '../assets/issue-model.mjs';

const args = process.argv.slice(2);
function value(flag: string): string | undefined {
  const index=args.indexOf(flag);
  if (index < 0) return undefined;
  if (!args[index+1] || args[index+1].startsWith('--')) throw new Error(flag+' 需要路径参数');
  return args[index+1];
}
function main(): void {
  if (args.includes('--help')) {
    console.log('用法：node --experimental-strip-types show-issue-form.ts --output <项目根目录/docs/issue-form.html> [--type Feature|Bugfix] [--input <JSON>] [--open]\n默认 Feature 空白表单，--type 选择不同表单；--input 支持平铺字段或 {contractVersion,data} 草稿。--open 用系统默认浏览器打开本地页面；不会写入 Linear。'); return;
  }
  const allowed=new Set(['--output','--input','--type','--open']);
  for (let i=0;i<args.length;i++) {
    if (!allowed.has(args[i])) throw new Error('未知参数：'+args[i]);
    if (args[i]!=='--open') { value(args[i]); i++; }
  }
  const output=value('--output');
  if (!output) throw new Error('请用 --output 指定项目根目录 docs/ 下的 HTML 路径。');
  const asset=resolve(dirname(fileURLToPath(import.meta.url)),'../assets/issue-form.html');
  if (resolve(output)===asset) throw new Error('输出不能覆盖技能自带模板。');
  let html=readFileSync(asset,'utf8');
  const input=value('--input'), requestedType=value('--type');
  if (requestedType && !['Feature','Bugfix'].includes(requestedType)) throw new Error('--type 仅支持 Feature 或 Bugfix');
  const contract=JSON.parse(html.match(/id="issue-contract">([\s\S]*?)<\/script>/)![1]);
  let draft: Record<string,unknown> = requestedType ? {issueType:requestedType} : {};
  if (input) {
    const raw=readFileSync(resolve(input),'utf8');
    if (Buffer.byteLength(raw)>2*1024*1024) throw new Error('JSON 输入不能超过 2MB');
    const parsed=JSON.parse(raw);
    const source=parsed.data && typeof parsed.data==='object' ? parsed.data : parsed;
    if (requestedType && (source.issueType || source.type) && getIssueType(parsed)!==requestedType) throw new Error('--type 与输入草稿类型冲突，未写入输出文件。');
    if (requestedType && !source.issueType && !source.type) source.issueType=requestedType;
    draft=normalizeDraft(parsed,contract);
  }
  const safe=JSON.stringify(draft).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  html=html.replace(/(<script type="application\/json" id="issue-draft">)[\s\S]*?(<\/script>)/,(_,start,end)=>start+safe+end);
  const destination=resolve(output); mkdirSync(dirname(destination),{recursive:true}); writeFileSync(destination,html);
  const demoSource=resolve(dirname(asset),'examples'), demoDestination=resolve(dirname(destination),'examples');
  if (demoSource!==demoDestination) { mkdirSync(demoDestination,{recursive:true});cpSync(demoSource,demoDestination,{recursive:true}); }
  console.log(destination);
  if (args.includes('--open')) {
    const command=process.platform==='darwin'?'open':process.platform==='win32'?'rundll32':'xdg-open';
    const openArgs=process.platform==='win32'?['url.dll,FileProtocolHandler',destination]:[destination];
    const result=spawnSync(command,openArgs,{stdio:'ignore'});
    if (result.error || result.status!==0) { console.error('页面已生成，系统浏览器未能打开。请打开上面的 HTML 文件。'); process.exitCode=1; }
    else console.log('已请求系统默认浏览器打开；请实际检查页面是否可见。');
  }
}
try { main(); } catch (error) { console.error((error as Error).message); process.exitCode=1; }
