import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { taskVisuals, timeVisuals, renderFlow } from './task-visuals.mjs';
import { scriptFromSpec, storyFromScript } from './create-video.mjs';
const base=JSON.parse(readFileSync(new URL('../../assets/issue-html/example.spec.json',import.meta.url)));
const change=(fn)=>{const s=structuredClone(base);fn(s);return s;};

test('frontend and mixed task shots use the same bilingual bindings and approved prototype states',()=>{
 const zh=taskVisuals(base,'zh'),en=taskVisuals(base,'en');
 assert.deepEqual(Object.keys(zh),['T1','T2','T3']);
 for(const id of Object.keys(zh)) assert.deepEqual(zh[id].map(v=>[v.type,v.source]),en[id].map(v=>[v.type,v.source]));
 assert.match(zh.T1[1].html,/Ops Alerts/);assert.match(en.T1[1].label,/Channel detail/);
 assert.match(zh.T3[0].html,/release-bot.example/);assert.match(zh.T3[0].html,/请输入以 https/);
 assert.match(zh.T1[0].html,/default-src 'none'/);assert.doesNotMatch(zh.T1[0].html,/<script/);
 const flow=zh.T3[1];assert.match(flow.svg,/<svg/);assert.match(flow.mermaid,/Https -->\|"否"\| UrlError/);
 for(const n of base.video.flows[0].nodes) {assert.ok(flow.svg.includes(`id="${n.id}"`));assert.ok(flow.mermaid.includes(n.id));}
});

test('backend-only task bindings render flows without inventing a UI',()=>{
 const spec=change(s=>{s.video.tasks.T3={kind:'backend',shots:[{flow:'channel-save',on:{scope:1}}]};});
 const shot=storyFromScript(scriptFromSpec(spec,'en')).scenes.find(s=>s.task==='T3').visuals[0];
 assert.equal(shot.type,'backend');assert.ok(!shot.html);assert.match(shot.svg,/Name unique/);
});

test('missing, stale, mismatched or partial bindings fail; an unconfigured older spec remains supported',()=>{
 const bad=(fn,re)=>assert.throws(()=>taskVisuals(change(fn),'zh'),re);
 bad(s=>{delete s.video.tasks.T2;},/T2 needs kind/);
 bad(s=>{s.video.tasks.T9=s.video.tasks.T1;},/unknown task T9/);
 bad(s=>{s.video.tasks.T1.shots[0].component='missing';},/unknown component/);
 bad(s=>{s.video.tasks.T3.shots[1].flow='missing';},/unknown flow/);
 bad(s=>{s.video.tasks.T1.kind='backend';},/do not match/);
 bad(s=>{s.video.tasks.T3.kind='mixed';s.video.tasks.T3.shots.pop();},/do not match/);
 bad(s=>{s.video.tasks.T1.shots[0].on={scope:99};},/unknown scope/);
 bad(s=>{s.video.tasks.T1.shots[0].on={ac:'AC-05'};},/unknown scope or AC/);
 bad(s=>{s.video.tasks.T1.shots[0].flow='channel-save';},/exactly one/);
 const legacy=change(s=>delete s.video);assert.deepEqual(taskVisuals(legacy,'zh'),{});
 assert.ok(storyFromScript(scriptFromSpec(legacy,'zh')).scenes.every(s=>!s.visuals));
 const dedup=change(s=>{s.video.tasks.T1.shots[1].on={ac:'AC-02'};});
 assert.throws(()=>storyFromScript(scriptFromSpec(dedup,'zh')),/not in current narration/);
 const reversed=change(s=>s.video.tasks.T1.shots.reverse());
 assert.throws(()=>storyFromScript(scriptFromSpec(reversed,'zh')),/narration order/);
});

test('flow rejects undefined endpoints, missing labels, unreachable nodes and missing start before layout',()=>{
 const flow=base.video.flows[0],bad=(fn,re)=>{const f=structuredClone(flow);fn(f);assert.throws(()=>renderFlow(f,'zh',['zh','en']),re);};
 bad(f=>f.edges.push({from:'Submit',to:'Missing'}),/missing node/);
 bad(f=>delete f.edges[1].label.en,/missing en label/);
 bad(f=>f.nodes.push({id:'Orphan',kind:'process',label:{zh:'孤立',en:'Orphan'}}),/unreachable/);
 bad(f=>f.nodes[0].kind='process',/exactly one start/);
});

test('shot positions use sentence cues, retain timing provenance and reject phrases absent from the actual audio',()=>{
 const visuals=[{source:'first',phrase:'first scope'},{source:'second',phrase:'second scope'}];
 const line={text:'Task. First scope. Second scope.',dur:15,cues:[{at:0,dur:2,text:'Task.'},{at:3,dur:4,text:'First scope.'},{at:9,dur:4,text:'Second scope.'}]};
 const shots=timeVisuals(visuals,line,.6);assert.equal(shots[0].at,0);assert.equal(shots[1].at,9.6);assert.equal(shots[1].timing,'sentence-interpolation');
 assert.equal(timeVisuals(visuals,{...line,cues:[]},.6)[1].timing,'estimated-text');
 assert.throws(()=>timeVisuals([{source:'missing',phrase:'a new claim'}],line,.6),/not in current narration/);
 const ctx=vm.createContext({});vm.runInContext(readFileSync(new URL('../../assets/html-video/js/visual/task-visuals.js',import.meta.url),'utf8'),ctx);
 const scene={visuals:shots};for(const [t,i] of [[11,1],[1,0],[9.599,0],[9.6,1],[0,0],[12,1]]) assert.equal(ctx.HV.taskVisuals.indexAt(scene,t),i);
});
