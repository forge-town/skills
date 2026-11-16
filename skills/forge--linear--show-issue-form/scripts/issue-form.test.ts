import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {getFormContract,createBlank,createItem,nextId,normalizeDraft,validateDraft,toBlocks,toMarkdown,toLinearIssue,materializeExample} from '../assets/issue-model.mjs';
import {buildForm,safeJson} from './build-form.ts';
const root=new URL('../../forge--linear--show-issue-best-practice/',import.meta.url);
const contract=JSON.parse(readFileSync(new URL('references/issue-contract.json',root),'utf8'));
const currentExample=JSON.parse(readFileSync(new URL('best-practice-examples/todo-feature.json',root),'utf8'));
const oldExample=currentExample.legacySource.data;
const copy=()=>normalizeDraft(materializeExample(structuredClone(currentExample),'file:///tmp/form.html'),contract);

test('current form only keeps tasks and cases; no duplicated rules or user flow',()=>{
 for(const type of ['Feature','Bugfix']){
  const f=getFormContract(contract,type);
  assert.deepEqual(Object.keys(f.collections),['tasks','acceptance']);
  assert.ok(!f.sections.some(s=>['flow','rules'].includes(s.id)));
  assert.deepEqual(f.collections.tasks.fields.map(f=>f.key),['name','given','when','then']);
  assert.equal(f.collections.acceptance.fields.find(f=>f.key==='taskRef').kind,'task');
 }
});
test('blank tasks require the three business fields and coverage remains enforced',()=>{
 const d=createBlank(contract);const issues=validateDraft(d,contract);
 for(const key of ['given','when','then'])assert.ok(issues.some(i=>i.path==='tasks.0.'+key));
 const x=copy();x.tasks.push({...x.tasks[0],id:'T-99'});assert.ok(validateDraft(x,contract).some(i=>i.path==='tasks.2.name'));
 x.acceptance[0].taskRef='T-88';assert.ok(validateDraft(x,contract).some(i=>i.path==='acceptance.0.taskRef'));
});
test('legacy rules become tasks with explicit case references and full original archive',()=>{
 const d=copy();assert.ok(d.legacySource);
 assert.deepEqual(d.legacySource.data.businessRules,oldExample.businessRules);
 assert.deepEqual(d.legacySource.data.tasks,oldExample.tasks);
 assert.equal(d.tasks.length,oldExample.businessRules.length);
 for(let i=0;i<d.acceptance.length;i++)assert.equal(d.acceptance[i].taskRef,'T-'+String(oldExample.businessRules.findIndex(r=>r.id===oldExample.acceptance[i].ruleRef)+1).padStart(2,'0'));
 assert.ok(!Object.hasOwn(d,'businessRules'));assert.ok(!Object.hasOwn(d,'flow'));
});
test('round trip preserves task fields, raw literal values and retired task identity',()=>{
 const d=copy();d.tasks[0].then='保留“6-99”与“本次预算为十三万元。”';d.retiredTaskIds=['T-40'];
 const again=normalizeDraft({contractVersion:contract.version,data:JSON.parse(JSON.stringify(d))},contract);
 assert.deepEqual(again,d);assert.equal(nextId([...d.tasks,{id:'T-40'}],'T-'),'T-41');
 const retired=copy();retired.retiredTaskIds=[retired.tasks[0].id];assert.ok(validateDraft(retired,contract).some(i=>i.message.includes('编号无效')));
});
test('body uses Chinese GWT labels once and no repeated goals label, flow or step table',()=>{
 const d=copy();d.goals='管理员能持续维护词条。';const md=toMarkdown(d,contract);
 assert.ok(md.startsWith('## 摘要\n'));assert.ok(md.includes('## 任务\n'));assert.ok(md.includes('## 验收案例\n'));
 assert.ok(md.includes('**前提条件**')&&md.includes('**操作**')&&md.includes('**预期结果**'));
 for(const phrase of ['## 业务规则','## 用户流程','**目标预期**','Given','When','Then','按顺序执行与逐步检查','以下是预期结果','| 序号 | 动作 |','**执行方式**','**完整执行入口**','**执行账号、身份与组织**','**清理／恢复（适用时）**','**未解决的执行条件**','## 完成条件'])assert.ok(!md.includes(phrase),phrase);
 assert.ok(md.includes('## 目标预期\n\n管理员能持续维护词条。'));
 assert.ok(md.includes('**对应任务**：T-'));assert.ok(!toBlocks(d,contract).some(b=>b.type==='taskConditions'));
});
test('steps stay in data while body emits one operation description',()=>{
 const d=copy();const a=d.acceptance[0];a.when='在内容框输入“发尾底色”，点击保存。';a.steps[0].expected='独立步骤检查点，仅留在结构化数据。';
 const md=toMarkdown(d,contract);assert.equal(md.split(a.when).length-1,1);assert.ok(!md.includes(a.steps[0].expected));
 assert.equal(normalizeDraft(d,contract).acceptance[0].steps[0].expected,a.steps[0].expected);
});
test('literal multiline results and positive-first order survive rendering',()=>{
 const d=copy();d.acceptance.reverse();d.tasks[0].then='第一行\n第二行 | 保留';const md=toMarkdown(d,contract);
 assert.ok(md.indexOf('### 正面案例')<md.indexOf('### 反面案例'));
 assert.ok(md.includes('第一行')&&md.includes('第二行 | 保留'));
 assert.ok(!md.includes('## 完成条件'));assert.ok(!Object.hasOwn(contract,'completion'));
});
test('cases require business inputs but no execution metadata; real evidence remains separate',()=>{
 const d=copy();assert.deepEqual(validateDraft(d,contract),[]);
 for(const key of ['method','entryPoint','actor','cleanup','blockers'])assert.ok(!Object.hasOwn(d.acceptance[0],key));
 d.acceptance[0].steps=[];assert.deepEqual(validateDraft(d,contract),[]);
 d.acceptance[0].when='';assert.ok(validateDraft(d,contract).some(i=>i.path==='acceptance.0.when'));
 const f=getFormContract(contract,'Bugfix'),blank=normalizeDraft({issueType:'Bugfix'},contract);blank.acceptance[0].executionStatus='通过';
 const issues=validateDraft(blank,contract);assert.ok(issues.some(i=>i.path==='acceptance.0.actualOutput')&&issues.some(i=>i.path==='acceptance.0.evidence'));
});
test('title and native properties stay separate and unknown values do not clear them',()=>{
 const d=copy();d.estimate='8';d.assignee='';const packet=toLinearIssue(d,contract);assert.equal(packet.fields.title,d.title);assert.equal(packet.fields.estimate,8);assert.ok(!Object.hasOwn(packet.fields,'assignee'));
 assert.ok(!packet.fields.description.includes('## 基本信息'));assert.ok(!packet.fields.description.startsWith('# '));
});
test('unsafe inputs, invalid versions and script embedding are rejected or escaped',()=>{
 assert.throws(()=>normalizeDraft({contractVersion:999,data:{}},contract));assert.throws(()=>normalizeDraft({tasks:'bad'},contract));
 const d=copy();d.sourceUrl='javascript:alert(1)';assert.ok(validateDraft(d,contract).some(i=>i.path==='sourceUrl'));
 assert.ok(!safeJson({background:'</script><script>bad</script>'}).includes('</script>'));
});
test('rebuilt form bundle is consistent with source model and Chinese contract',()=>{
 const built=buildForm();const saved=readFileSync(new URL('../assets/issue-form.html',import.meta.url),'utf8');assert.equal(built,saved);
 assert.ok(!built.includes("paragraph('以下是预期结果"));
 const embedded=JSON.parse(built.match(/id="issue-contract">([\s\S]*?)<\/script>/)![1]);assert.equal(embedded.version,contract.version);
 assert.ok(!getFormContract(embedded,'Feature').sections.some(s=>s.title==='业务规则'));
});

test('references section and fields are removed; legacy material stays internal',()=>{
 for(const type of ['Feature','Bugfix']){
  const f=getFormContract(contract,type);assert.ok(!f.sections.some(s=>s.id==='references'));assert.ok(!f.collections.references);
 }
 const d=copy();assert.ok(!Object.hasOwn(d,'references'));assert.ok(!toMarkdown(d,contract).includes('## 参考资料'));
 const old=normalizeDraft({issueType:'Feature',references:[{id:'REF-01',name:'会议纪要',value:'https://example.com/meeting'}]},contract);
 assert.ok(!Object.hasOwn(old,'references'));assert.equal(old.legacySource.data.references[0].value,'https://example.com/meeting');
 const link=normalizeDraft({issueType:'Feature',referenceUrl:'https://example.com/guide'},contract);
 assert.ok(!Object.hasOwn(link,'referenceUrl'));assert.equal(link.legacySource.data.referenceUrl,'https://example.com/guide');
});
