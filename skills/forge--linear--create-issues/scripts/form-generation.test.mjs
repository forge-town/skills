import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {normalizeDraft} from '../../forge--linear--show-issue-form/assets/issue-model.mjs';
import {assembleForm} from './form-generator.mjs';
const skills=fileURLToPath(new URL('../../',import.meta.url));
const contract=JSON.parse(readFileSync(join(skills,'forge--linear--show-issue-best-practice/references/issue-contract.json')));
const source=JSON.parse(readFileSync(join(skills,'forge--linear--show-issue-best-practice/best-practice-examples/issue-example.json')));

test('create CLI delegates to sibling form generator and strict validation rejects a modified body',async()=>{
 const parent=resolve('docs/test-runs');mkdirSync(parent,{recursive:true});const dir=mkdtempSync(join(parent,'linear-generation-'));
 try {
  const form=normalizeDraft(source,contract);const result=await assembleForm(form);assert.deepEqual(result.issues,[]);
  const input=join(dir,'form.json'),output=join(dir,'issue.md'),linear=join(dir,'linear.json');
  writeFileSync(input,JSON.stringify({contractVersion:contract.version,data:form}));
  const run=(file,args)=>spawnSync(process.execPath,[fileURLToPath(new URL(file,import.meta.url)),...args],{encoding:'utf8',env:{...process.env,LINEAR_FORM_SKILLS_ROOT:skills}});
  const create=run('assemble-issue.mjs',['--input',input,'--output',output,'--linear-output',linear]);assert.equal(create.status,0,create.stderr);
  assert.equal(readFileSync(output,'utf8'),result.markdown);assert.equal(JSON.parse(readFileSync(linear)).fields.description,result.markdown);
  const validate=()=>run('validate-issue-body.mjs',['--form',input,output]);assert.equal(validate().status,0);
  writeFileSync(output,result.markdown+'\n## 表单外章节\n额外内容\n');assert.equal(validate().status,1);
  writeFileSync(input,JSON.stringify({...form,unexpected:'不能静默丢失'}));
  const rejected=join(dir,'rejected.md');assert.notEqual(run('assemble-issue.mjs',['--input',input,'--output',rejected]).status,0);assert.equal(existsSync(rejected),false);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
test('cumulative backfill seconds round once and reject negative inputs',()=>{
 const script=join(skills,'forge--linear--backfill-issues/scripts/calculate-points.py');
 const run=args=>spawnSync('python3',[script,...args],{encoding:'utf8'});
 assert.equal(JSON.parse(run(['1800','1800']).stdout).target_points,1);
 assert.equal(JSON.parse(run(['600','--previous-seconds','1800']).stdout).point_delta,0);
 assert.equal(JSON.parse(run(['3660']).stdout).target_points,2);
 assert.notEqual(run(['-1']).status,0);
});
