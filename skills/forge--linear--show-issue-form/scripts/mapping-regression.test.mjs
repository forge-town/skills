import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {normalizeDraft, validateDraft, toBlocks, toMarkdown} from '../assets/issue-model.mjs';
import {assemble} from '../../forge--linear--review-issue/scripts/assemble-issue.mjs';

const base=new URL('../../forge--linear--show-issue-best-practice/',import.meta.url);
const read=name=>JSON.parse(readFileSync(fileURLToPath(new URL(name,base)),'utf8'));
const contract=read('references/issue-contract.json');
const example=read('best-practice-examples/issue-example.json');

test('current form drives markdown and native fields using the same generator',()=>{
  const source=normalizeDraft(example,contract);
  const result=assemble(source);
  assert.deepEqual(result.issues,[]);
  assert.equal(result.markdown,result.linear.fields.description);
  assert(result.markdown.startsWith('## 摘要\n'));
  assert(!result.markdown.includes('## 基本信息'));
  assert.throws(()=>assemble({...source,unexpectedField:'extra'}),/表单外字段/);
});
test('Given renders current state as a list and background images remain Markdown',()=>{
  const draft=normalizeDraft(example,contract);
  draft.acceptance[0].given='当前状态一\n当前状态二';
  draft.background='自由背景\n\n> 原话\n\n![截图](https://example.com/image.png)';
  const markdown=toMarkdown(draft,contract);
  assert(markdown.includes('- 当前状态一\n- 当前状态二'));
  assert(markdown.includes('![截图](https://example.com/image.png)'));
  assert(toBlocks(draft,contract).some(b=>b.type==='richText'&&b.text===draft.background));
});
test('v12 standards and cases keep original material and explicit reference mappings',()=>{
  const old={issueType:'Feature',title:'原草稿',background:'原背景',acceptance:[{id:'AC-01',name:'原标准',given:'原前提',when:'原触发',output:'原标准结果',caseType:'正面案例',taskRef:'T-01'}],testCases:[{id:'TC-01',acRef:'AC-01',name:'原案例',given:'具体状态',when:'具体输入',output:'具体输出'}]};
  const migrated=normalizeDraft({contractVersion:12,data:old},contract);
  assert.deepEqual(migrated.legacySource.data,old);
  assert.equal(migrated.tasks[0].id,'T-01');
  assert.equal(migrated.tasks[0].then,'原标准结果');
  assert.equal(migrated.acceptance[0].taskRef,'T-01');
  assert.equal(migrated.acceptance[0].then,'具体输出');
  assert(validateDraft(migrated,contract).length>0);
  const again=normalizeDraft({contractVersion:13,data:migrated},contract);
  assert.deepEqual(again.legacySource,migrated.legacySource);
});
test('old generic Bug data is retained for manual mapping instead of lost',()=>{
  const old={type:'Bug',title:'原缺陷',background:'原背景与反馈',technical:'原排查记录',tasks:[],acceptance:[]};
  const migrated=normalizeDraft(old,contract);
  assert.equal(migrated.issueType,'Bugfix');
  assert.equal(migrated.legacySource.data.background,'原背景与反馈');
  assert.equal(migrated.legacySource.data.technical,'原排查记录');
  assert(validateDraft(migrated,contract).length>0);
});
test('old regression data and unsupported future versions are handled explicitly',()=>{
  const old={issueType:'Bugfix',regression:[{id:'RG-01',name:'原回归',input:'原输入',output:'原输出'}]};
  const migrated=normalizeDraft({contractVersion:12,data:old},contract);
  assert.deepEqual(migrated.legacySource.data,old);
  assert.equal(migrated.acceptance[0].then,'原输出');
  assert.throws(()=>normalizeDraft({contractVersion:99,data:example},contract),/版本不兼容/);
});
