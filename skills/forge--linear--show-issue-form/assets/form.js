'use strict';
const contract = JSON.parse(document.getElementById('issue-contract').textContent);
const initial = JSON.parse(document.getElementById('issue-draft').textContent);
const examples = JSON.parse(document.getElementById('issue-example').textContent);
const storageBase = 'forge-issue-form-v2:' + location.pathname;
const $ = selector => document.querySelector(selector);
let state = normalizeDraft(initial, contract);
let activeForm = getFormContract(contract,state.issueType);
let storageAvailable = true, timer, toastTimer;
const touchedFields = new Set(), memoryDrafts = new Map(), restoreCandidates = new Map();
const initialProvided = Object.keys(initial).some(key=>!['issueType','type'].includes(key));
function storageKey(type=state.issueType) { return storageBase+':'+type; }
function readSaved(type) {
  if (!storageAvailable) return null;
  const raw=localStorage.getItem(storageKey(type));
  if (!raw) return null;
  const draft=normalizeDraft(JSON.parse(raw),contract);
  if (draft.issueType!==type) throw new Error('保存的草稿类型不匹配，当前草稿保持不变。');
  return draft;
}
try {
  const saved = readSaved(state.issueType);
  if (saved && !initialProvided) state=saved;
  else if (saved) restoreCandidates.set(state.issueType,saved);
  else if (!initialProvided && state.issueType==='Feature') {
    const legacy=localStorage.getItem('forge-issue-form-v1:'+location.pathname);
    if (legacy) state=normalizeDraft(JSON.parse(legacy),contract);
  }
} catch(error) { storageAvailable=false; console.warn('草稿恢复失败：'+error.message); }
try { const backup=localStorage.getItem(storageBase+':example-backup:Feature'); if (backup) restoreCandidates.set('Feature',normalizeDraft(JSON.parse(backup),contract)); } catch {}
memoryDrafts.set(state.issueType,state);
function switchIssueType(type) {
  if (type===state.issueType) return;
  clearTimeout(timer); persist();
  try {
    state=memoryDrafts.get(type) || readSaved(type) || createBlank(contract,type);
  } catch(error) { toast('无法读取该类型草稿：'+error.message); return; }
  touchedFields.clear(); buildForm(); $('#editor').scrollTop=0; persist();
}
function node(tag, className, value) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (value !== undefined) n.textContent = value;
  return n;
}
function button(label, action, path = '', className = 'text-button') {
  const n = node('button', className, label); n.type = 'button'; n.dataset.action = action;
  if (path) n.dataset.path = path;
  return n;
}
function getPath(path) { return path.split('.').reduce((value,key) => value?.[key], state); }
function setPath(path, value) {
  const keys = path.split('.'); const last = keys.pop();
  const parent = keys.reduce((value,key) => value[key], state); parent[last] = value;
}
function helpBubble(label, text, id) {
  const wrapper = node('span','help');
  const trigger = node('button','help-trigger','?'); trigger.type='button';
  trigger.setAttribute('aria-label','填写说明：' + label); trigger.setAttribute('aria-describedby',id);
  const tooltip = node('span','tooltip',text); tooltip.id=id; tooltip.setAttribute('role','tooltip');
  wrapper.append(trigger,tooltip); return wrapper;
}
function renderField(f, path = f.key) {
  const wrapper = node('div', 'field' + (f.kind === 'area' || path === 'title' ? ' wide' : ''));
  const top = node('div','field-top'), title = node('label', 'field-label', f.label);
  if (f.required) title.append(node('span', 'required', '*'));
  let input;
  if (['select','task'].includes(f.kind)) {
    input = node('select');
    const options = f.kind === 'task' ? ['', ...state.tasks.map(r => r.id)] : [...f.options];
    if (getPath(path) && !options.includes(getPath(path))) options.push(getPath(path));
    for (const value of options) {
      const rule = f.kind === 'task' ? state.tasks.find(r => r.id === value) : null;
      const label = !value ? '请选择' : rule ? value + (rule.name ? ' · ' + rule.name : '') : value;
      const option = node('option', '', label); option.value = value; input.append(option);
    }
  } else {
    input = node(f.kind === 'area' ? 'textarea' : 'input');
    if (input.tagName === 'INPUT') input.type = f.kind === 'url' ? 'url' : 'text';
    else { input.rows = /output|background/.test(path) ? 5 : 3; if (input.rows === 5) input.className = 'tall'; }
  }
  input.value = getPath(path) || '';
  input.dataset.field = path;
  input.id = 'field-' + path.replaceAll('.', '-'); title.htmlFor=input.id;
  if (f.required) input.setAttribute('aria-required','true');
  top.append(title,helpBubble(f.label,f.hint,input.id+'-hint'));
  input.setAttribute('aria-describedby',input.id+'-hint');
    wrapper.append(top,input);
    if(path==='background') wrapper.append(button('插入截图链接','insert-background-image',path));
    return wrapper;
}
function renderProcedure(item,path) {
  const root=node('div','procedure wide');
  root.append(node('h4','','操作'));
  if (item.legacyProcedure) {
    const legacy=node('details','legacy-procedure');legacy.append(node('summary','','查看旧版操作（需细化）'),node('p','',Object.values(item.legacyProcedure).join('\n')));root.append(legacy);
  }
  (item.steps || []).forEach((step,j)=>{
    const row=node('div','procedure-step'),head=node('div','repeat-top');
    head.append(node('strong','','第 '+(j+1)+' 步'),button('删除步骤','remove-step',path+'.steps.'+j));row.append(head);
    const fields=node('div','fields');
    for (const original of contract.procedure.fields) {
      const f={...original};
      if (f.key==='value') f.required=contract.procedure.valueActions.includes(step.action);
      if (f.key==='action' && contract.procedure.methodActions[item.method]) f.options=['',...contract.procedure.methodActions[item.method]];
      fields.append(renderField(f,path+'.steps.'+j+'.'+f.key));
    }
    row.append(fields);root.append(row);
  });
  root.append(button('＋ 添加执行步骤','add-step',path,'add'));return root;
}
function renderCollection(section, container) {
  const key = section.collection, spec = activeForm.collections[key];
  let order = state[key].map((item,index)=>({item,index}));
  if (key === 'acceptance') order.sort((a,b) => ['正面案例','反面案例'].indexOf(a.item.caseType) - ['正面案例','反面案例'].indexOf(b.item.caseType));
  let previousKind;
  for (const {item,index} of order) {
    if (key === 'acceptance' && previousKind !== item.caseType) {
      container.append(node('p','case-group-label',item.caseType || '待分类案例')); previousKind = item.caseType;
    }
    const group = node('div','repeat-item');
    const top = node('div','repeat-top');
    top.append(node('span','item-id',item.id), node('strong','',spec.label),button('删除','remove',key + '.' + index));
    const fields = node('div','fields');
    for (const f of spec.fields) {
      fields.append(renderField(f,key + '.' + index + '.' + f.key));
    }
    group.append(top,fields);
    container.append(group);
  }
  container.append(button('＋ 添加' + spec.label,'add',key,'add'));
}
function buildForm() {
  activeForm=getFormContract(contract,state.issueType);
  $('#form-title').textContent='开发 Issue 表单'; document.title='开发 Issue 表单 · Code Forge';
  $('#intro-title').textContent=activeForm.introTitle; $('#intro-description').textContent=activeForm.intro;
  $('#nav-title').textContent=state.issueType+' / '+activeForm.sections.length;
  $('#restore').hidden=!restoreCandidates.has(state.issueType);
  for (const b of document.querySelectorAll('[data-issue-type]')) b.setAttribute('aria-pressed',String(b.dataset.issueType===state.issueType));
  const scroll = $('#editor').scrollTop;
  $('#form').replaceChildren(); $('#nav-items').replaceChildren();
  activeForm.sections.forEach((section,index) => {
    const link = node('a'); link.href = '#section-' + section.id;
    link.append(node('span','',String(index+1).padStart(2,'0')),document.createTextNode(section.title));
    link.dataset.section = section.id; $('#nav-items').append(link);
    const block = node('section','form-section'); block.id = 'section-' + section.id;
    const head = node('div','section-head');
    head.append(node('span','section-number',String(index+1).padStart(2,'0')),node('h2','section-title',section.title),helpBubble(section.title,section.hint + (section.id==='basic' ? ' 不拼入 Issue 正文。' : ' 映射至 Issue 的“' + section.title + '”章节。'),'section-hint-'+section.id));
    block.append(head);
    const fields = node('div','fields');
    for (const f of section.fields) fields.append(renderField(f));
    if (section.fields.length) block.append(fields);
    if (section.collection) renderCollection(section,block);
    $('#form').append(block);
  });
  if(state.legacySource) {
    const panel=node('details','migration-source');panel.append(node('summary','','旧格式资料已保留，展开核对或导出原始内容'),node('pre','',JSON.stringify(state.legacySource,null,2)),button('导出迁移前原始资料','export-legacy'));$('#form').prepend(panel);
  }
  $('#editor').scrollTop = scroll;
  update();
}
function writePersonText(element,value,terms=[]) {
  element.replaceChildren();
  for(const part of personTextParts(value,terms)) element.append(part.person ? node('em','person',part.text) : document.createTextNode(part.text));
  return element;
}
function renderBlocks(container,blocks,interactive=true) {
  container.replaceChildren();
  for (const b of blocks) {
    let n;
    if (b.type === 'heading') {
      n = node('h' + b.level);
      if (interactive) { const link=button(b.text,'section',b.section,'heading-link'); link.title='返回“'+b.text+'”对应表单'; writePersonText(link,b.text,b.personTerms); n.append(link); }
      else writePersonText(n,b.text,b.personTerms);
    } else if (b.type === 'label') n = node('div','preview-label',b.text);
    else if (b.type === 'text') n = writePersonText(node('p',b.text === '未填写' ? 'empty' : ''),b.text,b.personTerms);
    else if (b.type === 'richText') n = renderBackground(b.text,b.personTerms);
    else if (b.type === 'pairs') {
      n = node('dl'); for (const [label,value] of b.rows) {
        const pair = node('div','pair'); pair.append(node('dt','',label),writePersonText(node('dd',value === '未填写' ? 'empty' : ''),value,b.personTerms)); n.append(pair);
      }
    } else if (b.type === 'taskConditions') {
      n=node('ol');
      for(const [input,output] of b.rows) {
        const li=node('li');
        for(const [label,value] of [['输入',input],['预期输出',output]]) {
          const p=node('p');p.append(node('strong','',label+'：'),document.createTextNode(value));p.style.whiteSpace='pre-wrap';li.append(p);
        }
        n.append(li);
      }
    } else if (b.type === 'table') {
      n = node('table'); const head = node('thead'), row = node('tr'), body = node('tbody');
      for (const title of b.headers) { const th=node('th','',title); th.scope='col'; row.append(th); }
      head.append(row);
      for (const values of b.rows) { const tr=node('tr'); for (const value of values) tr.append(node('td','',value)); body.append(tr); }
      n.append(head,body);
    } else {
      n = node(b.ordered ? 'ol' : 'ul');
      for (const item of b.items) n.append(writePersonText(node('li'),b.type === 'checks' ? '☐ ' + item : item,b.personTerms));
      if (!b.items.length) n.append(node('li','empty','未填写'));
    }
    container.append(n);
  }
}
function renderBackground(text,personTerms=[]) {
  const root=node('div','background-content');
  for(const line of text.split(/\r?\n/)) {
    if(!line.trim()) continue;
    const p=node(line.startsWith('> ')?'blockquote':'p');
    const value=line.startsWith('> ')?line.slice(2):line;
    const pattern=/(!?)\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;let offset=0;
    for(const match of value.matchAll(pattern)) {
      const span=writePersonText(node('span'),value.slice(offset,match.index),personTerms);p.append(...span.childNodes);
      const element=node(match[1]?'img':'a');
      if(match[1]){element.src=match[3];element.alt=match[2]||'截图';element.loading='lazy';element.referrerPolicy='no-referrer';}
      else{element.href=match[3];element.textContent=match[2];element.target='_blank';element.rel='noopener noreferrer';}
      p.append(element);offset=match.index+match[0].length;
    }
    const tail=writePersonText(node('span'),value.slice(offset),personTerms);p.append(...tail.childNodes);root.append(p);
  }
  return root;
}
function nativePropertyBlocks(draft) {
  const packet=toLinearIssue(draft,contract);
  const rows=[['标题',packet.fields.title || '未填写']];
  const basic=getFormContract(contract,draft.issueType).sections.find(section=>section.id==='basic');
  for(const [key,target] of Object.entries(contract.linear.properties)) {
    const label=basic.fields.find(field=>field.key===key).label;
    rows.push([label,draft[key] || '未填写']);
  }
  for(const item of packet.unmapped) rows.push([basic.fields.find(field=>field.key===item.field)?.label || item.field,item.value+'（'+item.reason+'）']);
  return [{type:'pairs',rows}];
}
function renderPreview() {
  const scroll=$('#preview-scroll').scrollTop;
  renderBlocks($('#linear-properties-content'),nativePropertyBlocks(state),false);
  renderBlocks($('#document'),toBlocks(state,contract));
  $('#markdown').textContent = toMarkdown(state,contract);
  $('#preview-scroll').scrollTop = scroll;
}
function update() {
  const issues = validateDraft(state,contract);
  for (const input of document.querySelectorAll('[data-field]')) input.removeAttribute('aria-invalid');
  for (const issue of issues) {
    const input = document.getElementById('field-' + issue.path.replaceAll('.','-'));
    if (input && touchedFields.has(issue.path)) input.setAttribute('aria-invalid','true');
  }
  $('#check-status').textContent = issues.length ? '待补 ' + issues.length + ' 项' : '字段齐全';
  $('#missing-title').textContent = issues.length ? '查看待填写与关联问题' : '仍需人工检查的内容';
  $('#problems').replaceChildren();
  if (issues.length) for (const issue of issues) {
    const li=node('li'); const b=button(issue.message,'focus',issue.path); b.dataset.section=issue.section; li.append(b); $('#problems').append(li);
  } else for (const criterion of activeForm.reviewCriteria) $('#problems').append(node('li','',criterion.label + '：' + criterion.instruction));
  $('#locate').disabled = issues.length === 0;
  // 规则名称变化时只更新选项文字，避免重建正在编辑的表单。
  for (const select of document.querySelectorAll('select[data-field$=".taskRef"]')) for (const option of select.options) {
    const rule=state.tasks.find(r=>r.id===option.value);
    if (rule) option.textContent=rule.id + (rule.name ? ' · ' + rule.name : '');
  }
  renderPreview();
}
function toast(message) { $('#toast').textContent=message; $('#toast').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').hidden=true,4500); }
function persist() {
  memoryDrafts.set(state.issueType,state);
  try { localStorage.setItem(storageKey(),JSON.stringify({contractVersion:contract.version,data:state})); storageAvailable=true; $('#save-status').textContent='草稿已保存到当前浏览器'; }
  catch { storageAvailable=false; $('#save-status').textContent='浏览器无法保存，请下载 JSON 草稿'; }
}
function change() { update(); clearTimeout(timer); timer=setTimeout(persist,250); }
function scrollEditorTo(element,center=false) {
  if (!element) return;
  const editor=$('#editor');
  const top=element.getBoundingClientRect().top-editor.getBoundingClientRect().top+editor.scrollTop;
  editor.scrollTop=Math.max(0,center ? top-editor.clientHeight/2+element.offsetHeight/2 : top-18);
}
function navigate(section,path) {
  document.body.dataset.view='form';
  $('[data-mobile="form"]').setAttribute('aria-selected','true'); $('[data-mobile="preview"]').setAttribute('aria-selected','false');
  const block=document.getElementById('section-' + section); scrollEditorTo(block);
  if (path) { touchedFields.add(path); const input=document.getElementById('field-' + path.replaceAll('.','-')); if (input && validateDraft(state,contract).some(issue=>issue.path===path)) input.setAttribute('aria-invalid','true'); input?.focus({preventScroll:true}); scrollEditorTo(input,true); }
  for (const link of document.querySelectorAll('nav a')) link.setAttribute('aria-current',String(link.dataset.section===section));
}
function download(contents,extension,mime) {
  const name=(state.title || 'Issue草稿').replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,90);
  const url=URL.createObjectURL(new Blob([contents],{type:mime})); const a=node('a'); a.href=url; a.download=name+extension; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function replaceDraft(next) {
  const normalized=normalizeDraft(next,contract);
  clearTimeout(timer); persist(); touchedFields.clear(); state=normalized;
  buildForm(); $('#editor').scrollTop=0; persist();
}
let selectedExample='Todo';
function showExample(key=selectedExample) {
  selectedExample=key;
  const sample=materializeExample(examples[key],location.href);
  $('#example-description').textContent=sample.exampleSummary;
  $('#play-example').href=sample.playUrl;
  for (const b of document.querySelectorAll('[data-example]')) b.setAttribute('aria-pressed',String(b.dataset.example===key));
  const draft=normalizeDraft(sample,contract);
  renderBlocks($('#example-linear-properties'),nativePropertyBlocks(draft),false);
  renderBlocks($('#example-document'),toBlocks(draft,contract),false);
  $('#example-confirm').hidden=true;
  $('#example-content').scrollTop=0;
}
function applyExample() {
  const currentFeature=state.issueType==='Feature' ? state : memoryDrafts.get('Feature') || readSaved('Feature');
  if (currentFeature) {
    const backup=structuredClone(currentFeature);
    restoreCandidates.set('Feature',backup);
    try { localStorage.setItem(storageBase+':example-backup:Feature',JSON.stringify(backup)); } catch {}
  }
  replaceDraft(materializeExample(examples[selectedExample],location.href));
  $('#example-dialog').close(); navigate('basic'); toast('示例已填入，可用“恢复之前保存的草稿”返回。');
}
document.addEventListener('keydown',event=>{
  if (event.key==='Escape' && event.target.closest('.help')) {
    const help=event.target.closest('.help'); help.classList.add('dismissed');
    help.addEventListener('mouseleave',()=>help.classList.remove('dismissed'),{once:true});
    help.addEventListener('focusout',()=>help.classList.remove('dismissed'),{once:true});
  }
});
document.addEventListener('focusin',event=>event.target.closest('.help')?.classList.remove('dismissed'));
$('#form').addEventListener('submit',event=>event.preventDefault());
$('#form').addEventListener('input',event=>{
  const path=event.target.dataset.field; if (!path) return; setPath(path,event.target.value); touchedFields.add(path); change();
});
$('#form').addEventListener('change',event=>{
  if (event.target.dataset.field?.endsWith('.caseType') || event.target.dataset.field?.endsWith('.method') || /\.steps\.\d+\.action$/.test(event.target.dataset.field || '')) buildForm();
});
document.addEventListener('click',async event=>{
  const target=event.target.closest('button,a[data-section]'); if (!target) return;
  if (target.dataset.section && target.tagName === 'A') { event.preventDefault(); navigate(target.dataset.section); return; }
  if (target.dataset.issueType) { switchIssueType(target.dataset.issueType); return; }
  const action=target.dataset.action,path=target.dataset.path;
  if(action==='export-legacy'){download(JSON.stringify(state.legacySource,null,2),'-original.json','application/json;charset=utf-8');return;}
  if(action==='insert-background-image'){
    const value=prompt('输入截图的 HTTP(S) 图片链接：');if(value===null)return;
    let url;try{url=new URL(value);if(!['https:','http:'].includes(url.protocol))throw new Error();}catch{toast('请填写有效图片链接');return;}
    const input=document.querySelector('[data-field="background"]');input.setRangeText('\n\n![截图]('+url.href.replaceAll('(','%28').replaceAll(')','%29')+')\n\n',input.selectionStart,input.selectionEnd,'end');state.background=input.value;change();input.focus();return;
  }
  if (action==='section') navigate(path);
  if (action==='focus') navigate(target.dataset.section,path);
  if (action==='remove') {
    const [key,index]=path.split('.');
    if (key==='tasks') { state.retiredTaskIds ||= []; state.retiredTaskIds.push(state[key][Number(index)].id); }
    state[key].splice(Number(index),1); buildForm(); persist();
  }
  if (action==='add-step') {
    const item=getPath(path);item.steps ||= [];item.steps.push(createProcedureStep(contract));buildForm();persist();
    navigate(activeForm.sections.find(s=>s.collection===path.split('.')[0]).id,path+'.steps.'+(item.steps.length-1)+'.action');
  }
  if (action==='remove-step') { const parts=path.split('.');const index=Number(parts.pop());getPath(parts.join('.')).splice(index,1);buildForm();persist(); }
  if (action==='remove-condition') { const parts=path.split('.'); const index=Number(parts.pop()); getPath(parts.join('.')).splice(index,1); buildForm(); persist(); }
  if (action==='add') {
    const used=path==='tasks' ? [...state[path],...(state.retiredTaskIds || []).map(id=>({id}))] : state[path];
    state[path].push(createItem(activeForm,path,used)); buildForm(); persist();
    navigate(activeForm.sections.find(s=>s.collection===path).id,path+'.'+(state[path].length-1)+'.'+contract.collections[path].fields[0].key);
  }
  if (action==='add-condition') { getPath(path).conditions.push({input:'',output:''}); buildForm(); persist(); }
  if (target.id==='locate') { const issue=validateDraft(state,contract)[0]; if (issue) navigate(issue.section,issue.path); }
  if (target.id==='blank' && confirm('新建空白表单会替换当前浏览器草稿。需要保留时请先下载 JSON。')) replaceDraft(createBlank(contract,state.issueType));
  if (target.id==='example') { showExample(); $('#example-dialog').showModal(); }
  if (target.dataset.example) showExample(target.dataset.example);
  if (target.id==='example-close') $('#example-dialog').close();
  if (target.id==='use-example') $('#example-confirm').hidden=false;
  if (target.id==='cancel-example') $('#example-confirm').hidden=true;
  if (target.id==='confirm-example') applyExample();
  if (target.id==='restore') {
    try { const saved=restoreCandidates.get(state.issueType); if (!saved) throw new Error('没有可恢复的草稿'); restoreCandidates.delete(state.issueType); try { localStorage.removeItem(storageBase+':example-backup:'+state.issueType); } catch {} replaceDraft(saved); }
    catch (error) { toast('恢复失败：'+error.message); }
  }
  if (target.id==='json-export') download(JSON.stringify({contractVersion:contract.version,data:state},null,2),'.json','application/json;charset=utf-8');
  if (target.id==='md-export') { download(toMarkdown(state,contract),'.md','text/markdown;charset=utf-8'); toast(validateDraft(state,contract).length ? '已导出草稿，仍有结构问题待补充。' : '已导出；内容仍需 Review，实际验收另行记录。'); }
  if (target.id==='json-import') $('#import-file').click();
  if (target.id==='copy') {
    try { await navigator.clipboard.writeText(toMarkdown(state,contract)); toast('已复制 Markdown'+(validateDraft(state,contract).length ? '（含待补充内容）' : '')); }
    catch { toast('无法访问剪贴板，请切换 Markdown 后手动复制或下载 .md。'); setPreviewTab('markdown'); }
  }
  if (target.dataset.tab) setPreviewTab(target.dataset.tab);
  if (target.dataset.mobile) {
    document.body.dataset.view=target.dataset.mobile;
    for (const b of document.querySelectorAll('[data-mobile]')) b.setAttribute('aria-selected',String(b===target));
  }
});
function setPreviewTab(tab) {
  $('#document').hidden=tab!=='document'; $('#markdown').hidden=tab!=='markdown';
  for (const button of document.querySelectorAll('[data-tab]')) { button.setAttribute('aria-selected',String(button.dataset.tab===tab)); button.tabIndex=button.dataset.tab===tab ? 0 : -1; }
}
$('.preview-tabs').addEventListener('keydown',event=>{
  if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); const tab=$('[data-tab][aria-selected="true"]').dataset.tab==='document' ? 'markdown' : 'document'; setPreviewTab(tab); $('[data-tab="'+tab+'"]').focus(); }
});
$('#import-file').addEventListener('change',async event=>{
  const file=event.target.files[0]; if (!file) return;
  try {
    if (file.size>2*1024*1024) throw new Error('JSON 文件不能超过 2MB');
    const draft=normalizeDraft(JSON.parse(await file.text()),contract);
    if (confirm('导入会替换当前草稿，继续吗？')) { replaceDraft(draft); toast('JSON 草稿已导入。'); }
  } catch(error) { toast('导入失败：'+error.message); }
  event.target.value='';
});
window.addEventListener('beforeunload',()=>{ clearTimeout(timer); persist(); });
buildForm();
$('#save-status').textContent=storageAvailable ? '草稿仅保存在当前浏览器，可下载 JSON 继续编辑' : '浏览器无法保存，请下载 JSON 草稿';
