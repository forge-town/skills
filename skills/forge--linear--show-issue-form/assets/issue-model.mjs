// 此模型同时用于浏览器与行为测试；字段及文档结构来自嵌入的统一定义。
const text = value => typeof value === 'string' ? value : '';
const filled = value => text(value).trim().length > 0;
const splitLines = value => text(value).split(/\r?\n/).map(line => line.trim()).filter(Boolean);
export function getPersonTerms(draft) {
  return [...new Set([text(draft.role).trim(), ...splitLines(draft.personTerms)].filter(value=>value && !/[<>\r\n]/.test(value)))].sort((a,b)=>b.length-a.length);
}
// 只标注表单明确给出的人物词；不推测角色，不修改链接、代码或已有下划线。
export function personTextParts(value, terms = []) {
  const input=text(value), escaped=terms.filter(Boolean).map(term=>term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  if (!escaped.length) return [{text:input,person:false}];
  const people=new RegExp(escaped.join('|'),'gu'), protectedText=/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`|“[^”\n]*”|「[^」\n]*」|!?\[[^\]\n]*\]\([^\n)]*\)|\*{1,2}[^\s*\n](?:[^*\n]*[^\s*\n])?\*{1,2}|_{1,2}[^\s_\n](?:[^_\n]*[^\s_\n])?_{1,2}|<u>[^<]*<\/u>|<[^>\n]*>/g;
  const out=[];
  const append=segment=>{
    let offset=0;
    for(const m of segment.matchAll(people)) {
      // 英文姓名不从其他单词中截取；中文人物词可直接接动作。
      if((/^[A-Za-z0-9_]/.test(m[0]) && /[A-Za-z0-9_]/.test(segment[m.index-1]||'')) || (/[A-Za-z0-9_]$/.test(m[0]) && /[A-Za-z0-9_]/.test(segment[m.index+m[0].length]||''))) continue;
      if(m.index>offset)out.push({text:segment.slice(offset,m.index),person:false});
      out.push({text:m[0],person:true});offset=m.index+m[0].length;
    }
    if(offset<segment.length)out.push({text:segment.slice(offset),person:false});
  };
  let offset=0;
  for(const m of input.matchAll(protectedText)){append(input.slice(offset,m.index));out.push({text:m[0],person:false});offset=m.index+m[0].length;}
  append(input.slice(offset));return out;
}
// 人物在 Markdown / Linear 中用标准斜体；链接、代码和字面输入保持原值。
export function formatPersonMarkdown(value, terms = [], escape = value=>value) {
  return personTextParts(value,terms).map(part=>part.person ? '*'+mdInline(part.text)+'*' : escape(part.text)).join('');
}

export function materializeExample(source, baseUrl) {
  const urls={
    '{{TODO_URL}}':new URL('examples/todolist.html?fixture=todo-feature-v1&reset=1',baseUrl).href,
    '{{SURVIVORS_URL}}':new URL('examples/survivors.html?fixture=level-up-v1',baseUrl).href,
  };
  const visit=value=>{
    if (typeof value==='string') { for (const [token,url] of Object.entries(urls)) value=value.split(token).join(url); return value; }
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,visit(v)]));
    return value;
  };
  return visit(source);
}
export function getIssueType(input = {}, fallback = 'Feature') {
  const source = input?.data && typeof input.data === 'object' ? input.data : input;
  const value = text(source?.issueType || source?.type || input?.issueType || fallback).trim().toLowerCase();
  if (value === 'feature') return 'Feature';
  if (value === 'bugfix' || value === 'bug') return 'Bugfix';
  throw new Error('仅支持 Feature 和 Bugfix 两种开发 Issue 类型。');
}
export function getFormContract(contract, issueType = 'Feature') {
  const type = getIssueType({issueType});
  const form = contract.forms[type];
  if (!form) throw new Error('缺少 ' + type + ' 表单定义。');
  const catalog = [...contract.sections, ...(contract.extraSections || [])];
  return {
    ...form, issueType:type, version:contract.version, procedure:contract.procedure, linear:contract.linear,
    sections:form.sectionIds.map(id => { const section=catalog.find(s=>s.id===id); if (!section) throw new Error('缺少章节：'+id); return section; }),
    collections:Object.fromEntries(form.collectionKeys.map(key=>{ const spec=contract.collections[key]; return [key,{...spec,fields:spec.fields.filter(field=>!field.issueTypes || field.issueTypes.includes(type))}]; })),
    reviewCriteria:form.reviewCriteria || contract.reviewCriteria,
  };
}
export function nextId(items, prefix) {
  const max = items.reduce((n, item) => Math.max(n, Number(new RegExp('^' + prefix + '(\\d+)$').exec(item.id)?.[1] || 0)), 0);
  return prefix + String(max + 1).padStart(2, '0');
}
export function createProcedureStep(contract) {
  return Object.fromEntries(contract.procedure.fields.map(f=>[f.key,'']));
}
export function createItem(contract, collection, items = []) {
  const spec = contract.collections[collection];
  const item = {id: nextId(items, spec.prefix)};
  for (const f of spec.fields) item[f.key] = '';
  if (collection === 'acceptance') item.steps=[];
  return item;
}
export function createBlank(contract, issueType = 'Feature') {
  const form = getFormContract(contract, issueType);
  const draft = {issueType:form.issueType};
  for (const section of form.sections) for (const f of section.fields) draft[f.key] = '';
  for (const key of Object.keys(form.collections)) draft[key] = form.collections[key].minItems===0 ? [] : [createItem(form, key)];
  draft.acceptance[0].caseType = '正面案例';
  const negative = createItem(form, 'acceptance', draft.acceptance);
  negative.caseType = '反面案例'; draft.acceptance.push(negative);
  return draft;
}
export function normalizeDraft(input, contract) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('需求数据必须是 JSON 对象。');
  let source = input.data && typeof input.data === 'object' && !Array.isArray(input.data) ? input.data : input;
  source = {...source};
  const issueType = getIssueType(input);
  if (input.contractVersion !== undefined && !Array.from({length:contract.version},(_,i)=>i+1).includes(input.contractVersion)) throw new Error('草稿版本不兼容，请按当前字段定义迁移后再导入。');
  if (input.contractVersion === 1 && issueType === 'Bugfix') throw new Error('旧版 Bug 草稿使用通用需求结构，请保留原 JSON，整理为 Bugfix 的复现、对照和回归字段后再导入；当前草稿未改动。');
  const previousVersion = input.contractVersion ?? input.version;
  const legacyImport = !!source.references?.length || ['referenceUrl','implementationUrl','verificationUrl'].some(k=>filled(source[k])) || !!source.businessRules || !!source.flow || !!source.tasks?.some(t=>t.action || t.conditions) || !!source.testCases || !!source.regression || !!source.type || (Array.isArray(source.acceptance) && source.acceptance.some(item=>item.taskRef && !/^T-\d{2,}$/.test(item.taskRef)));
  const original = source.legacySource || (legacyImport ? {contractVersion:previousVersion ?? null,data:structuredClone(source)} : null);
  if (issueType==='Feature' && Array.isArray(source.testCases)) {
    const oldStandards=Array.isArray(source.acceptance)?source.acceptance:[];
    const ids=Object.fromEntries(oldStandards.map((item,i)=>[item.id,'BR-'+String(i+1).padStart(2,'0')]));
    source.businessRules=oldStandards.map((item,i)=>({id:ids[item.id]||'BR-'+String(i+1).padStart(2,'0'),name:text(item.name),given:text(item.given),when:text(item.when),then:text(item.then||item.output),ambiguity:''}));
    source.acceptance=source.testCases.map((item,i)=>({...item,id:'AC-'+String(i+1).padStart(2,'0'),ruleRef:ids[item.acRef]||'',caseType:oldStandards.find(s=>s.id===item.acRef)?.caseType||'',blockers:[text(item.blockers),'旧版测试用例已迁入；需核对逐步操作、执行入口、账号与规则关联。'].filter(Boolean).join('\n')}));
  }
  const legacyRegression=source.legacyRegression && typeof source.legacyRegression==='object' ? structuredClone(source.legacyRegression) : null;
  let archivedRegression=legacyRegression;
  if (source.regression!==undefined) {
    if (!Array.isArray(source.regression)) throw new Error('旧回归用例必须是数组');
    if (source.regression.length>200) throw new Error('旧回归用例最多 200 条');
    archivedRegression={...(legacyRegression || {}),items:structuredClone(source.regression),scope:text(source.regressionScope)};
    if (source.acceptance===undefined) {
      archivedRegression.idMap={};
      source.acceptance=source.regression.map((item,i)=>{
        if (!item || typeof item!=='object' || Array.isArray(item)) throw new Error('旧回归用例包含无效条目');
        const id='AC-'+String(i+1).padStart(2,'0');
        if (text(item.id)) archivedRegression.idMap[item.id]=id;
        return {...item,id,caseType:'',ruleRef:'',blockers:[text(item.blockers),'旧回归用例已转为验收草稿；需核对正反分类、关联业务规则及执行条件。'].filter(Boolean).join('\n')};
      });
      const refs=archivedRegression.idMap;
      const replaceRefs=value=>{
        if(typeof value==='string') return value.replace(/\bRG-\d{2,}\b/g,id=>refs[id] || id);
        if(Array.isArray(value)) return value.map(replaceRefs);
        if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,replaceRefs(v)]));
        return value;
      };
      if(source.tasks) source.tasks=replaceRefs(source.tasks);
    }
  }
  // 旧规则逐项迁成任务，原工程动作和流程完整保留在 legacySource，映射不猜测。
  if (Array.isArray(source.businessRules) && source.businessRules.length && !source.tasks?.some(t=>filled(t.given)||filled(t.when)||filled(t.then))) {
    const ids=Object.fromEntries(source.businessRules.map((r,i)=>[r.id,'T-'+String(i+1).padStart(2,'0')]));
    source.tasks=source.businessRules.map((r,i)=>({id:ids[r.id],name:text(r.name),given:text(r.given),when:text(r.when),then:[text(r.then),text(r.ambiguity)].filter(Boolean).join('\n')}));
    source.acceptance=(source.acceptance||[]).map(a=>({...a,taskRef:ids[a.ruleRef] || text(a.taskRef)}));
  }
  const form = getFormContract(contract, issueType);
  const draft = createBlank(contract, issueType);
  if(original) draft.legacySource=structuredClone(original);
  if (archivedRegression) draft.legacyRegression=archivedRegression;

  draft.retiredTaskIds = Array.isArray(source.retiredTaskIds) ? [...new Set(source.retiredTaskIds.filter(id => typeof id === 'string' && /^T-\d{2,}$/.test(id)))] : [];
  for (const section of form.sections) for (const f of section.fields) draft[f.key] = text(source[f.key]);
  const archivedSummary = source.legacySummary && typeof source.legacySummary === 'object' ? source.legacySummary : {};
  const legacy = Object.fromEntries(['summaryWhat','summaryStart','summaryDone'].map(key=>[key,text(archivedSummary[key])]).filter(([,value])=>filled(value)));
  if (Object.keys(legacy).length) draft.legacySummary = legacy;
  for (const key of ['summaryWhat','summaryStart','summaryDone']) {
    if (!Object.hasOwn(source,key) && filled(legacy[key])) draft[key] = legacy[key];
  }
  if (issueType === 'Feature') {
    if (!Object.hasOwn(source,'goals') && filled(draft.summaryDone)) draft.goals = draft.summaryDone;
    const archived=source.legacyDetails && typeof source.legacyDetails==='object' ? source.legacyDetails : {};
    const details=Object.fromEntries(['ui','interactionChange','presentation','technical'].map(key=>[key,text(source[key]) || text(archived[key])]).filter(([,value])=>filled(value)));
    if (Object.keys(details).length) draft.legacyDetails=details;
  }
  const locationKeys=['platform','page','route','entry','replyArea','userAction','control','success','ambiguity','navigation'];
  const archivedInteraction=source.legacyInteraction && typeof source.legacyInteraction==='object' ? structuredClone(source.legacyInteraction) : {};
  if(issueType==='Feature') for(const key of locationKeys) if(filled(source[key])) archivedInteraction[key]=source[key];
  if(source.interactions!==undefined) {
    if(!Array.isArray(source.interactions)) throw new Error('旧交互条目必须是数组');
    archivedInteraction.items=structuredClone(source.interactions);
  }
  if(Object.keys(archivedInteraction).length) draft.legacyInteraction=archivedInteraction;
  for (const [key, spec] of Object.entries(form.collections)) {
    if (source[key] === undefined) continue;
    if (!Array.isArray(source[key])) throw new Error(key + ' 必须是数组。');
    if (source[key].length > 200) throw new Error('每类条目最多 200 条，请拆分 Issue。');
    const suppliedIds = source[key].map(item => text(item?.id)).filter(Boolean);
    let generated = suppliedIds.map(id => ({id}));
    draft[key] = source[key].map(raw => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(key + ' 包含无效条目。');
      const item = {};
      item.id = text(raw.id) || nextId(generated, spec.prefix);
      generated.push({id:item.id});
      for (const f of spec.fields) item[f.key] = text(raw[f.key]);
      if (key === 'acceptance') {
        const archived=raw.legacyProcedure && typeof raw.legacyProcedure==='object' ? raw.legacyProcedure : {};
        const legacy=Object.fromEntries(['when','followupWhen','followupOutput','input','output'].map(k=>[k,text(archived[k])]).filter(([,v])=>filled(v)));
        const oldShape=Object.hasOwn(raw,'input') || Object.hasOwn(raw,'output');
        if(!Object.hasOwn(raw,'then') && Object.hasOwn(raw,'output')) item.then=text(raw.output);
        else if(Object.hasOwn(raw,'output') && text(raw.output)!==item.then) legacy.output=text(raw.output);
        if(!Object.hasOwn(raw,'when') && Object.hasOwn(raw,'input')) item.when=text(raw.input);
        else if(oldShape && !Object.hasOwn(raw,'then') && filled(raw.when)) {
          item.when=[text(raw.input),text(raw.when)].filter(Boolean).join('\n'); legacy.when=text(raw.when);
        } else if(Object.hasOwn(raw,'input') && text(raw.input)!==item.when) legacy.input=text(raw.input);
        for(const key of ['followupWhen','followupOutput']) if(filled(raw[key])) legacy[key]=text(raw[key]);
        if(Object.keys(legacy).length) item.legacyProcedure=legacy;
        if (raw.steps!==undefined && !Array.isArray(raw.steps)) throw new Error('执行步骤必须是数组。');
        if ((raw.steps || []).length>200) throw new Error('单个案例最多 200 个执行步骤。');
        item.steps=(raw.steps || []).map(step=>{
          if (!step || typeof step!=='object' || Array.isArray(step)) throw new Error('执行步骤包含无效条目。');
          return Object.fromEntries(contract.procedure.fields.map(f=>[f.key,text(step[f.key])]));
        });
      }
      return item;
    });
  }
  return draft;
}
export function validateDraft(draft, contract) {
  contract = getFormContract(contract, getIssueType(draft));
  const issues = [];
  const add = (path, section, message) => issues.push({path, section, message});
  if(splitLines(draft.personTerms).some(term=>/[<>]/.test(term) || term.length>80)) add('personTerms','basic','人物称呼填写纯文本，每项不超过 80 字；不要手写 HTML');
  const checkFields = (fields, value, prefix, section) => {
    for (const f of fields) {
      const path = prefix ? prefix + '.' + f.key : f.key;
      if (f.required && !filled(value[f.key])) add(path, section, '请填写' + f.label);
      if (f.kind === 'url' && filled(value[f.key]) && !/^https?:\/\/[^\s]+$/i.test(value[f.key])) add(path, section, f.label + '须为有效的 HTTP(S) 链接');
      if (f.kind === 'url' && filled(value[f.key])) {
        try { const u = new URL(value[f.key]); if (!u.hostname) throw new Error(); }
        catch { if (!issues.some(issue => issue.path === path)) add(path, section, f.label + '不是有效链接'); }
      }
      if (f.kind === 'select' && filled(value[f.key]) && !f.options.includes(value[f.key])) add(path, section, f.label + '的选项无效');
    }
  };
  for (const section of contract.sections) checkFields(section.fields, draft, '', section.id);
  for (const [key, spec] of Object.entries(contract.collections)) {
    const section = contract.sections.find(s => s.collection === key).id;
    if (spec.minItems!==0 && !draft[key].length) add(key, section, '至少添加一条' + spec.label);
    const seen = new Set();
    draft[key].forEach((item, i) => {
      const path = key + '.' + i;
      if (!new RegExp('^' + spec.prefix + '\\d{2,}$').test(item.id) || seen.has(item.id) || (key === 'tasks' && (draft.retiredTaskIds || []).includes(item.id))) add(path + '.' + spec.fields[0].key, section, '编号无效或重复：' + item.id);
      seen.add(item.id);
      checkFields(spec.fields, item, path, section);

    });
  }
  {
    const ruleIds = new Set(draft.tasks.map(r => r.id));
    draft.acceptance.forEach((a, i) => {
      if (filled(a.taskRef) && !ruleIds.has(a.taskRef)) add('acceptance.' + i + '.taskRef', 'acceptance', a.id + ' 关联的任务不存在：' + a.taskRef);
    });
    draft.tasks.forEach((rule, i) => {
      if (!draft.acceptance.some(a => a.taskRef === rule.id && a.caseType === '正面案例')) add('tasks.' + i + '.name', 'tasks', rule.id + ' 缺少关联的正面案例');
    });
    for (const kind of ['正面案例', '反面案例']) if (!draft.acceptance.some(a => a.caseType === kind)) add('acceptance', 'acceptance', '至少需要一个' + kind);
  }
  draft.acceptance.forEach((a,i)=>{
    if (['通过','未通过'].includes(a.executionStatus)) {
      if (!filled(a.actualOutput)) add('acceptance.'+i+'.actualOutput','acceptance',a.id+' 已执行，须填写实际结果');
      if (!filled(a.evidence)) add('acceptance.'+i+'.evidence','acceptance',a.id+' 已执行，须提供真实执行证据');
    }
  });
  return issues;
}
export function toBlocks(draft, contract) {
  contract = getFormContract(contract, getIssueType(draft));
  const blocks = [];
  const heading = (level, title, section) => blocks.push({type:'heading', level, text:title, section});
  const paragraph = value => blocks.push({type:'text', text:value || '未填写'});
  const pairs = fields => blocks.push({type:'pairs', rows:fields.map(f => [f.label, draft[f.key] || '未填写'])});
  const excluded = new Set(contract.linear.descriptionExcludedSectionIds);
  for (const section of contract.sections) {
    if (excluded.has(section.id)) continue;
    heading(2, section.title, section.id);
    if (section.id === 'acceptance') {
      for (const kind of ['正面案例', '反面案例', '未分类']) {
        const cases = draft.acceptance.filter(a => (a.caseType || '未分类') === kind || (kind === '未分类' && !['正面案例','反面案例',''].includes(a.caseType)));
        if (kind === '未分类' && !cases.length) continue;
        heading(3, kind, section.id);
        if (!cases.length) paragraph('待补充' + kind);
        for (const a of cases) {
          heading(4, a.id + '：' + (a.name || '未填写名称'), section.id);
          blocks.push({type:'pairs', rows:[['对应任务',a.taskRef || '未填写']]});
          for (const f of contract.collections.acceptance.fields.filter(f => !['caseType','name','taskRef'].includes(f.key))) {
            if (!f.required && f.key!=='executionStatus' && !a[f.key]) continue;
            blocks.push({type:'label',text:f.label}); if(['given','when'].includes(f.key)) blocks.push({type:'list',ordered:f.key==='when',items:splitLines(a[f.key])}); else paragraph(a[f.key] || (f.key==='executionStatus' ? '未记录' : '未填写'));
          }
        }
      }
      continue;
    }
    if (section.id === 'reproduction') {
      for (const f of section.fields) {
        if (f.key==='reproSteps') {
          blocks.push({type:'label',text:f.label},{type:'list',ordered:true,items:splitLines(draft[f.key])});
        } else blocks.push({type:'pairs',rows:[[f.label,draft[f.key] || '未填写']]});
      }
      continue;
    }
    if (section.id === 'tasks') {
      if (!draft.tasks.length) paragraph('未填写任务');
      for (const t of draft.tasks) {
        heading(3,t.id+'：'+(t.name||'未填写名称'),section.id);
        for(const f of contract.collections.tasks.fields.filter(f=>f.key!=='name')) {
          blocks.push({type:'label',text:f.label});
          blocks.push({type:'list',ordered:f.key==='when',items:splitLines(t[f.key])});
        }
      }
      continue;
    }
    if (section.id === 'goals') { paragraph(draft.goals); continue; }
    if (['flow','nongoals'].includes(section.id)) blocks.push({type:'list', ordered:section.id==='flow', items:splitLines(draft[section.fields[0].key])});
    else if (section.id==='background') blocks.push({type:'richText',text:draft[section.fields[0].key]||'未填写'});
    else {
      pairs(section.fields);

    }
  }
  const personTerms=getPersonTerms(draft);
  return blocks.map(block=>({...block,personTerms}));
}
const mdInline = value => text(value).replace(/\\/g, '\\\\').replace(/([`*_{}\[\]<>#!|])/g,'\\$1').replace(/\r?\n/g,' ');
const mdCell = value => mdInline(text(value)).replace(/\r?\n/g, '<br>');
export function toMarkdown(draft, contract) {
  return toBlocks(draft, contract).map(b => {
    const fmt=value=>formatPersonMarkdown(value,b.personTerms);
    if (b.type === 'heading') return '#'.repeat(b.level) + ' ' + formatPersonMarkdown(b.text,b.personTerms,mdInline);
    if (b.type === 'label') return '**' + mdInline(b.text) + '**';
    if (b.type === 'text' || b.type === 'richText') return fmt(b.text);
    if (b.type === 'pairs') return b.rows.map(([k,v]) => '**' + mdInline(k) + '**：' + fmt(v)).join('\n\n');
    if (b.type === 'table') return '| ' + b.headers.map(mdCell).join(' | ') + ' |\n| ' + b.headers.map(()=>'---').join(' | ') + ' |\n' + b.rows.map(row => '| ' + row.map(v => mdCell(text(v).replace(/\r?\n/g,' ⏎ '))).join(' | ') + ' |').join('\n');
    if (b.type === 'taskConditions') return b.rows.map((row,i)=>{
      const prefix=String(i+1)+'. ', indent=' '.repeat(prefix.length);
      const value=v=>text(v).replace(/\r?\n/g,'\n'+indent);
      return prefix+'**输入**：'+value(row[0])+'\n\n'+indent+'**预期输出**：'+value(row[1]);
    }).join('\n\n');
    if (b.type === 'checks') return b.items.map(item => '- [ ] ' + fmt(item)).join('\n');
    if (b.type === 'list') return b.items.length ? b.items.map((item,i)=>(b.ordered ? (i+1)+'. ' : '- ') + fmt(item)).join('\n') : '未填写';
    return '';
  }).join('\n\n') + '\n';
}

// 同一份表单分开生成原生标题／属性与正文，避免将基本信息重复拼进 description。
export function toLinearIssue(draft, contract) {
  const mapping=contract.linear, fields={}, context={}, unmapped=[];
  fields.title=draft[mapping.titleField] || '';
  for(const [key,target] of Object.entries(mapping.properties)) {
    const value=text(draft[key]).trim(); if(!value) continue;
    if(key==='priority') {
      const number=mapping.priorityValues[value] ?? (/^[0-4]$/.test(value) ? Number(value) : undefined);
      if(number===undefined) { unmapped.push({field:key,value,reason:'需核对 Linear 优先级取值'}); continue; }
      fields[target]=number;
    } else if(key==='estimate') {
      if(!/^\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value))) { unmapped.push({field:key,value,reason:'需核对团队估点取值'}); continue; }
      fields[target]=Number(value);
    } else fields[target]=value;
  }
  for(const key of mapping.contextFields) if(filled(draft[key])) context[key]=draft[key];
  if(filled(draft.module)) unmapped.push({field:'module',value:draft.module,reason:'需匹配团队已有标签或自定义属性，不新增正文段落'});
  fields.description=toMarkdown(draft,contract);
  return {fields,context,unmapped};
}
