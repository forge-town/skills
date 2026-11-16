import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeDraft,toMarkdown,toLinearIssue,getPersonTerms,personTextParts,formatPersonMarkdown,validateDraft} from '../assets/issue-model.mjs';
const base=new URL('../../forge--linear--show-issue-best-practice/',import.meta.url);
const contract=JSON.parse(readFileSync(new URL('references/issue-contract.json',base),'utf8'));
const example=JSON.parse(readFileSync(new URL('best-practice-examples/todo-feature.json',base),'utf8'));
test('HTML 人物识别保留最长称呼，Markdown 使用标准斜体',()=>{
 const d=normalizeDraft({...example,role:'系统管理员',personTerms:'管理员\n审核人\n管理员'},contract);
 assert.deepEqual(getPersonTerms(d),['系统管理员','管理员','审核人']);
 assert.deepEqual(personTextParts('系统管理员提交，审核人确认。',getPersonTerms(d)).filter(x=>x.person).map(x=>x.text),['系统管理员','审核人']);
 assert.equal(formatPersonMarkdown('系统管理员提交，审核人确认。',getPersonTerms(d)),'*系统管理员*提交，*审核人*确认。');
});
test('所有正文位置和 Linear description 均不注入人物 HTML，原生属性不变',()=>{
 const d=normalizeDraft({...example,role:'系统管理员',personTerms:'管理员\n审核人'},contract);
 d.title='系统管理员管理资料';d.summaryWhat='管理员提交资料';d.background='审核人核对';d.tasks[0].given='系统管理员已登录';d.tasks[0].when='管理员保存';d.acceptance[0].then='审核人可查看';
 const md=toMarkdown(d,contract),packet=toLinearIssue(d,contract);
 for(const value of ['*管理员*提交资料','*审核人*核对','*系统管理员*已登录','*管理员*保存','*审核人*可查看'])assert(md.includes(value));
 assert(!/<\/?(?:u|ins)\b/i.test(md));assert.equal(packet.fields.description,md);assert.equal(packet.fields.title,d.title);assert(!Object.hasOwn(packet.fields,'personTerms'));
});
test('姓名中的符号、链接、代码和字面样例保持原值',()=>{
 const value='管理员见 [管理员资料](https://example.com/管理员) `管理员` “管理员”\n```\n管理员\n```';
 assert.equal(formatPersonMarkdown(value,['管理员']),'*管理员*'+value.slice('管理员'.length));
 assert.equal(formatPersonMarkdown('Tom & Ann',['Tom & Ann']),'*Tom & Ann*');
 assert.equal(formatPersonMarkdown('管理员',['管理员'],x=>'escaped:'+x),'*管理员*');
 assert.deepEqual(personTextParts('banana Ann Annie',['Ann']).filter(x=>x.person).map(x=>x.text),['Ann']);
});
test('人物词输入仍禁止手写 HTML',()=>{
 const d=normalizeDraft({...example,personTerms:'<u>管理员</u>'},contract);
 assert(validateDraft(d,contract).some(x=>x.path==='personTerms'));
});

test('已存在的斜体、粗体和引用重复处理不产生嵌套标记',()=>{
 const value='*管理员*保存，**管理员**核对，[管理员](https://example.com/admin)';
 assert.equal(formatPersonMarkdown(value,['管理员']),value);
 const first=formatPersonMarkdown('管理员保存',['管理员']);assert.equal(formatPersonMarkdown(first,['管理员']),first);
});
