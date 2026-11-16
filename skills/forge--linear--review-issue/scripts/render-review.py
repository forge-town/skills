#!/usr/bin/env python3
"""将简明检查结果、已填表单与生成正文渲染为独立 LV 编辑风格 HTML。"""
import argparse,html,json,re,subprocess,sys
from pathlib import Path
from bs4 import BeautifulSoup
from markdown_it import MarkdownIt
def person_underline(state,silent):
 # 只兼容历史预览中的人物 HTML，不将其作为 Linear Markdown 写入格式。
 start=state.pos
 if not state.src.startswith('<u>',start):return False
 end=state.src.find('</u>',start+3)
 if end<0 or '<' in state.src[start+3:end] or '\n' in state.src[start+3:end]:return False
 if not silent:
  state.push('person_underline_open','u',1)
  token=state.push('text','',0);token.content=html.unescape(state.src[start+3:end])
  state.push('person_underline_close','u',-1)
 state.pos=end+4
 return True
def esc(x):return html.escape(str(x),quote=True)
def text(x):return esc(x).replace('\n','<br>')
def current_form(values):
 root=Path(__file__).resolve().parents[2]
 model=root/'forge--linear--show-issue-form/assets/issue-model.mjs'
 contract=root/'forge--linear--show-issue-best-practice/references/issue-contract.json'
 js='import {getFormContract,normalizeDraft} from '+json.dumps(model.as_uri())+';import {readFileSync} from "node:fs";const c=JSON.parse(readFileSync(process.argv[1],"utf8"));const d=normalizeDraft(JSON.parse(readFileSync(0,"utf8")),c);process.stdout.write(JSON.stringify({definition:getFormContract(c,d.issueType),data:d}));'
 r=subprocess.run(['node','--input-type=module','-e',js,str(contract)],input=json.dumps(values),text=True,capture_output=True,check=True)
 return json.loads(r.stdout)
def filled_form(issue):
 resolved=current_form(issue['formData']);definition=resolved['definition'];values=resolved['data'];ident=issue['id']
 def field(f,value,path):
  value=str(value or '');missing=f.get('required',False) and not value.strip();label=f['label'];uid=ident+'-form-'+path.replace('.','-')
  mark='<span class="field-missing">待补</span>' if missing else ('<span class="optional">可选</span>' if not f.get('required',False) else '')
  attrs=' id="'+esc(uid)+'" data-form-field="'+esc(path)+'"'+(' aria-required="true"' if f.get('required') else '')+(' aria-invalid="true"' if missing else '')
  if f['kind'] in ['select','task']:
   opts=list(f.get('options',[])) if f['kind']=='select' else ['']+[x['id'] for x in values['tasks']]
   if value not in opts:opts.append(value)
   control='<select disabled'+attrs+'>'+''.join('<option value="'+esc(o)+'"'+(' selected' if o==value else '')+'>'+esc(o or '未选择')+'</option>' for o in opts)+'</select>'
  elif f['kind']=='area' or len(value)>85:
   control='<textarea readonly rows="3"'+attrs+' placeholder="未填写">'+esc(value)+'</textarea>'
  else:control='<input readonly type="text"'+attrs+' value="'+esc(value)+'" placeholder="未填写">'
  return '<div class="form-field'+(' wide' if f['kind']=='area' or len(value)>85 else '')+'"><label for="'+esc(uid)+'">'+esc(label)+mark+'</label>'+control+'</div>'
 out='<form class="filled-form" aria-label="'+esc(ident)+' 已填表单"><div class="form-tools"><label>查看章节<select data-form-section>'+''.join('<option value="'+esc(sec['id'])+'"'+(' selected' if sec['id']=='summary' else '')+'>'+esc(sec['title'])+'</option>' for sec in definition['sections'])+'</select></label><button type="button" data-form-all>展开全部字段</button></div>'
 for sec in definition['sections']:
  out+='<section data-form-part="'+esc(sec['id'])+'"'+(' class="active"' if sec['id']=='summary' else '')+'><h3>'+esc(sec['title'])+'</h3><div class="form-fields">'
  for f in sec['fields']:out+=field(f,values.get(f['key'],''),f['key'])
  out+='</div>'
  key=sec.get('collection')
  if key:
   spec=definition['collections'][key]
   for i,item in enumerate(values[key]):
    path=key+'.'+str(i)
    out+='<details class="form-record"'+(' open' if i==0 else '')+'><summary>'+esc(item['id'])+' · '+esc(item.get('name',''))+'</summary><div class="form-fields">'
    for f in spec['fields']:out+=field(f,item.get(f['key'],''),path+'.'+f['key'])
    out+='</div>'
    out+='</details>'
    out+='</details>'
  out+='</section>'
 return out+'</form>'
CSS='''
:root{--paper:#fffefa;--ground:#f0ede7;--ink:#211a15;--muted:#71685e;--clay:#a65135}
html{scroll-behavior:smooth;background:var(--ground)}body.handbook{background:var(--ground);font-size:14px;line-height:1.75}button,input,select{font:inherit}button,a,input,select,summary{outline-offset:5px}button{cursor:pointer}a{color:inherit}h1,h2,h3,h4{line-height:1.4}h2{font-size:30px}h3{font-size:20px}h4{font-size:16px}p{overflow-wrap:anywhere}.layout{padding-left:198px;min-height:100vh}.rail{position:fixed;inset:0 auto 0 0;width:198px;padding:40px 24px;display:flex;flex-direction:column;gap:36px;z-index:20;background:var(--ground)}.brand{font-size:25px;line-height:1.25;text-decoration:none}.rail nav{display:flex;flex-direction:column;gap:12px}.rail nav a{text-decoration:none;display:block;padding:9px 0}.rail nav a.active{color:var(--clay);font-weight:600}.rail small{display:block;color:var(--muted);font-size:11px}.rail .print{margin-top:auto;background:none;border:0;padding:8px 0;text-align:left;font-size:12px;text-decoration:underline}.handbook .page.cover{width:min(900px,calc(100% - 64px));height:calc(100vh - 64px);min-height:600px;margin:32px auto;padding:50px;background:var(--paper);box-shadow:none}.cover .page-content{min-height:0!important}.handbook .cover h1{font-size:40px}.handbook .flow{width:auto;max-width:1440px;padding:0;margin:0 auto;background:transparent}.document{background:var(--paper);margin:32px;padding:48px 44px 60px}.document h2{margin:0 0 20px}.eyebrow{font-size:11px;letter-spacing:.06em;color:var(--clay);margin-bottom:18px}.lead{font-size:17px;max-width:780px;margin-bottom:30px}.muted,.source-note{color:var(--muted)}.source-note{font-size:12px;margin-top:36px;max-width:840px}.overview-list{display:grid;grid-template-columns:1fr 1fr;gap:42px;margin:44px 0}.overview-list h3{margin:8px 0 14px}.overview-list ul{padding-left:18px}.overview-list li{margin:10px 0}.text-link{font-size:13px;text-underline-offset:5px}.verdict{color:var(--clay);font-size:13px}.props{display:flex;flex-wrap:wrap;gap:14px 24px;margin:16px 0 30px;padding:0}.props div{display:flex;gap:8px}.props dt{color:var(--muted)}.props dd{margin:0}.issue-actions{display:flex;gap:20px;flex-wrap:wrap;margin:28px 0 34px}.issue-actions button{padding:8px 0;background:transparent;border:0;color:var(--muted);font-size:14px}.issue-actions button[aria-selected=true]{color:var(--ink);font-weight:600;text-decoration:underline;text-underline-offset:8px}.filterbar{display:flex;gap:12px;flex-wrap:wrap;align-items:end;margin:24px 0}.filterbar label{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--muted)}.filterbar input,.filterbar select{background:#f4f1eb;border:0;border-radius:0;padding:10px 12px;color:var(--ink)}.filterbar input{width:240px;max-width:100%}.filterbar button{border:0;background:#e9e2d8;padding:10px 14px;font-size:12px}.filterbar output{font-size:12px;color:var(--muted);margin-left:auto}.audit-group{margin:24px 0}.audit-group>summary{font-size:17px;padding:12px 0;cursor:pointer}.audit-scroll{width:100%;max-height:68vh;overflow:auto;overscroll-behavior:contain}.handbook .flow table.audit{min-width:1080px;table-layout:fixed;margin:0;font-size:12px;line-height:1.7}.audit th,.audit td{padding:13px 10px;overflow-wrap:anywhere}.audit th{position:sticky;top:0;z-index:2;background:#ebe5dc;font-size:11px;color:#51463c}.audit tbody tr:nth-child(even){background:#f6f3ed}.audit td:nth-child(4){color:var(--clay)}.audit th:nth-child(1){width:11%}.audit th:nth-child(2){width:15%}.audit th:nth-child(3){width:13%}.audit th:nth-child(4){width:7%}.audit th:nth-child(5){width:13%}.audit th:nth-child(6){width:11%}.audit th:nth-child(7){width:18%}.audit th:nth-child(8){width:12%}.cell-full{margin:0}.cell-full>summary{cursor:pointer}.cell-full>summary span{display:block;color:var(--clay);font-size:11px;margin-top:6px}.cell-full>div{margin-top:12px}.cell-full[open]>summary{display:none}.draft{max-width:880px;margin:0 auto}.handbook .flow .draft h2{font-size:24px;margin:46px 0 18px!important}.draft h3{font-size:18px;margin:32px 0 16px}.draft h4{font-size:15px;margin:25px 0 16px}.draft p{margin:12px 0}.draft ul,.draft ol{padding-left:23px}.draft li{margin:8px 0}.draft table{font-size:12px!important;min-width:620px;margin:18px 0}.draft td,.draft th{padding:10px 12px}.draft tbody tr:nth-child(even){background:#f6f3ed}.draft-table{overflow:auto;max-width:100%}.draft input[type=checkbox]{accent-color:var(--clay)}.js [data-panel]:not(.active),.js [data-view]:not(.active){display:none}[hidden]{display:none!important}.empty{padding:20px 0;color:var(--muted)}.audit-note{font-size:12px;color:var(--muted);max-width:800px}.end{font-size:12px;color:var(--muted);margin-top:36px}
@media(max-width:900px){html{scroll-padding-top:112px}.layout{padding-left:0}.rail{position:sticky;inset:auto;top:0;width:auto;padding:14px 20px;display:flex;flex-direction:row;align-items:center;gap:20px}.brand{font-size:20px}.rail nav{flex-direction:row;gap:18px;flex:1;justify-content:flex-end}.rail small,.rail .print{display:none}.rail nav a{font-size:12px;padding:6px 0}.document{margin:16px;padding:32px 24px}.handbook .page.cover{width:calc(100% - 32px);margin:16px;min-height:520px}.overview-list{gap:22px}.handbook .cover h1{font-size:32px}}
@media(max-width:560px){.rail{padding:12px 16px;gap:16px;align-items:flex-start}.rail nav{gap:8px 16px;flex-wrap:wrap}.rail nav a{font-size:11px}.rail .brand{font-size:19px}.document{margin:12px;padding:28px 20px}h2{font-size:27px}.overview-list{grid-template-columns:1fr;gap:24px;margin:30px 0}.lead{font-size:15px}.filterbar{gap:10px}.filterbar label:first-child{width:100%}.filterbar input{width:100%}.filterbar output{margin-left:0}.handbook .page.cover{padding:24px;min-height:72vh;height:76vh}.handbook .cover h1{font-size:29px}.props{font-size:12px}.draft h2{font-size:23px!important}}
@media print{.rail,.issue-actions,.filterbar,.audit-note,.empty{display:none!important}.layout{padding:0}.js [data-panel],.js [data-view],tr[hidden],details[hidden]{display:revert!important}.document{padding:0;margin:0;break-before:page;background:#fff}.handbook .page.cover{width:210mm;height:297mm;min-height:0;margin:0;padding:17mm 18mm}.flow{max-width:none}.audit-scroll,.draft-table{overflow:visible;max-height:none}.handbook .flow table.audit{min-width:0;table-layout:auto;font-size:7pt}.audit th,.audit td{padding:2mm 1.5mm}.audit th{position:static}thead{display:table-header-group}.cell-full>summary{display:none}.cell-full>div{display:block}.audit-group>summary{break-after:avoid}.draft h2{font-size:18pt!important}.draft table{min-width:0;font-size:8pt!important}.draft{max-width:none}.overview-list{grid-template-columns:1fr}.source-note{font-size:8pt}details{break-inside:auto}.audit tr{break-inside:auto}}
'''
CSS+='''
.simple-checks table{table-layout:fixed;font-size:14px!important;margin:0!important}.simple-checks th,.simple-checks td{padding:18px 16px}.simple-checks th:first-child{width:17%}.simple-checks th:nth-child(2){width:42%}.simple-checks tbody tr:nth-child(even){background:#f6f3ed}.form-note{font-size:13px;color:var(--muted);margin-bottom:24px}.form-tools{display:flex;align-items:end;gap:18px;flex-wrap:wrap;margin:24px 0 30px}.form-tools>label{display:flex;flex-direction:column;gap:8px;font-size:12px;color:var(--muted)}.form-tools select,.form-tools button{padding:10px 14px;background:#eee8df;border:0;border-radius:0;font:inherit;color:var(--ink)}.filled-form{max-width:900px}.filled-form h3{margin:0 0 24px;font-size:21px}.form-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 26px}.form-field{min-width:0}.form-field.wide{grid-column:1/-1}.form-field label{display:flex;gap:10px;align-items:baseline;font-size:13px;margin-bottom:8px}.field-missing{color:var(--clay);font-size:11px}.optional{color:#867d73;font-size:11px}.form-field input,.form-field textarea,.form-field select{display:block;width:100%;font:inherit;line-height:1.75;font-size:14px;border:0;border-radius:0;background:#f4f1eb;color:var(--ink);padding:12px 14px;box-sizing:border-box;-webkit-text-fill-color:var(--ink);opacity:1}.form-field textarea{resize:none;overflow:auto;min-height:80px}.form-field [aria-invalid=true]{background:#f8ede7}.form-field input::placeholder,.form-field textarea::placeholder{color:#8e8175;-webkit-text-fill-color:#8e8175}.form-record{margin:24px 0}.form-record>summary{padding:15px 0;font-size:16px;cursor:pointer}.form-record[open]>.form-fields{margin:12px 0 24px}.form-extra{margin:18px 0}.form-extra>summary{font-size:14px;cursor:pointer;padding:8px 0;color:var(--muted)}.form-extra[open]>.form-fields{margin-top:14px}.form-extra fieldset{border:0;padding:18px 0;margin:0;min-width:0}.form-extra legend{font-size:13px}.generated{margin-top:40px}.generated>summary{font-size:13px;color:var(--muted);cursor:pointer}.js [data-form-part]:not(.active){display:none}.js .print-all [data-form-part]{display:block}.js .all-parts [data-form-part]{display:block;margin-bottom:48px}.js .all-parts [data-form-part] h3{margin-top:36px}.form-field input:focus,.form-field textarea:focus,.form-field select:focus{outline:1px solid #a08d7e}.form-extra .form-fields{padding:0 8px}
@media(max-width:560px){.form-fields{grid-template-columns:1fr;gap:18px}.form-field.wide{grid-column:auto}.simple-checks table,.simple-checks thead,.simple-checks tbody,.simple-checks tr,.simple-checks th,.simple-checks td{display:block;width:auto!important}.simple-checks thead{display:none}.simple-checks tbody tr{padding:18px 0;margin:8px 0;background:transparent!important}.simple-checks tbody th{font-size:16px;padding:0 0 10px}.simple-checks td{padding:4px 0;font-size:14px}.simple-checks td:last-child{color:var(--muted)}.form-tools{gap:14px}.form-tools select{max-width:100%}.form-field input,.form-field textarea,.form-field select{font-size:14px}}
@media print{.form-tools{display:none!important}.js [data-form-part]{display:block!important;margin-bottom:12mm}.filled-form{max-width:none}.form-field textarea{overflow:visible!important}.generated>summary{display:none}.simple-checks table{font-size:10pt!important}.form-record>summary{break-after:avoid}.form-record,.form-extra{break-inside:auto}.form-fields{break-inside:auto}.form-field{break-inside:avoid}}
'''
JS='''
document.documentElement.classList.add('js');
function resizeFields(root){root.querySelectorAll('textarea').forEach(t=>{if(t.offsetParent){t.style.height='auto';t.style.height=Math.max(80,t.scrollHeight+2)+'px';}});}
function showPanel(key){const found=document.querySelector('[data-panel="'+CSS.escape(key)+'"]');if(!found)return;document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('active',p===found));document.querySelectorAll('.rail a[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===key));resizeFields(found);}
function showView(panel,key){if(key==='draft')key='form';panel.querySelectorAll('[data-view]').forEach(v=>v.classList.toggle('active',v.dataset.view===key));panel.querySelectorAll('[data-switch]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.switch===key)));resizeFields(panel);}
function route(){const [panel,view]=location.hash.slice(1).split('/');showPanel(panel||'overview');requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));if(view){const p=document.querySelector('[data-panel="'+CSS.escape(panel)+'"]');if(p)showView(p,view);}}
window.addEventListener('hashchange',route);route();
document.querySelectorAll('[data-switch]').forEach(b=>b.addEventListener('click',()=>{const p=b.closest('[data-panel]');showView(p,b.dataset.switch);history.replaceState(null,'','#'+p.dataset.panel+'/'+b.dataset.switch);}));
document.querySelectorAll('[data-form-section]').forEach(s=>s.addEventListener('change',()=>{const form=s.closest('form');form.classList.remove('all-parts');form.querySelectorAll('[data-form-part]').forEach(p=>p.classList.toggle('active',p.dataset.formPart===s.value));resizeFields(form);}));
document.querySelectorAll('[data-form-all]').forEach(b=>b.addEventListener('click',()=>{const form=b.closest('form');form.classList.toggle('all-parts');form.querySelectorAll('details').forEach(d=>d.open=form.classList.contains('all-parts'));resizeFields(form);}));
document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>resizeFields(d)));
document.fonts.ready.then(()=>resizeFields(document));
let printState=[];window.addEventListener('beforeprint',()=>{printState=[...document.querySelectorAll('details')].map(d=>[d,d.open]);printState.forEach(([d])=>d.open=true);document.querySelectorAll('.filled-form').forEach(f=>f.classList.add('print-all'));resizeFields(document);});window.addEventListener('afterprint',()=>{printState.forEach(([d,o])=>d.open=o);document.querySelectorAll('.filled-form').forEach(f=>f.classList.remove('print-all'));});
'''
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--data',required=True);ap.add_argument('--lv-root',required=True);ap.add_argument('--output',required=True);ap.add_argument('--overwrite',action='store_true');a=ap.parse_args()
 data=json.loads(Path(a.data).read_text());out=Path(a.output).resolve();lv=Path(a.lv_root).resolve()
 if out.exists() and not a.overwrite:ap.error('输出已存在，更新当前文件请用 --overwrite')
 if not data.get('issues'):ap.error('缺少 issues')
 for issue in data['issues']:
  if not issue.get('formData') or not isinstance(issue.get('checks'),list):ap.error('缺少已填表单或简明检查项')
  if not issue.get('draftMarkdown','').startswith('## 摘要'):ap.error('完整草稿必须读取表单生成正文，并以摘要开始')
 subprocess.run([sys.executable,str(lv/'scripts/create_document.py'),'--layout','handbook','--title',data['title'],'--output',str(out)]+(['--overwrite'] if a.overwrite else []),check=True,stdout=subprocess.DEVNULL)
 soup=BeautifulSoup(out.read_text(),'html.parser');soup.body['class']=['handbook','review'];soup.body['data-external-document']='false';cover=soup.select_one('.cover');cover['id']='cover';cover['data-panel']='cover';cover.extract()
 for item in list(soup.body.contents):item.extract()
 nav='<aside class="rail"><a class="brand" href="#cover">'+esc(data['title'])+'</a><nav aria-label="报告目录"><a href="#overview" data-nav="overview">审查总览</a>'+''.join('<a href="#'+esc(i['id'])+'" data-nav="'+esc(i['id'])+'">'+esc(i['title'])+'<small>'+esc(i['id'])+'</small></a>' for i in data['issues'])+'</nav><button class="print" onclick="window.print()">打印报告</button></aside>'
 overview='<section id="overview" data-panel="overview" class="document active"><p class="eyebrow">审查总览</p><h2>需要补齐的内容</h2><p class="lead">'+text(data['intro'])+'</p><div class="overview-list">'
 for i in data['issues']:
  overview+='<article><p class="verdict">'+esc(i['verdict'])+'</p><h3>'+esc(i['id'])+' · '+esc(i['title'])+'</h3><ul>'+''.join('<li>'+text(x)+'</li>' for x in [c['problem'] for c in i['checks']])+'</ul><a class="text-link" href="#'+esc(i['id'])+'">查看检查结果</a>　<a class="text-link" href="#'+esc(i['id'])+'/form">查看已填表单</a></article>'
 overview+='</div></section>'
 md=MarkdownIt('commonmark',{'html':False}).enable('table');md.inline.ruler.before('html_inline','person_underline',person_underline);parts=[]
 for issue in data['issues']:
  ident=esc(issue['id'])
  audits='<div class="simple-checks"><table><thead><tr><th>检查项</th><th>问题</th><th>怎么处理</th></tr></thead><tbody>'+''.join('<tr><th scope="row">'+text(r['item'])+'</th><td>'+text(r['problem'])+'</td><td>'+text(r['action'])+'</td></tr>' for r in issue['checks'])+'</tbody></table></div>'
  filled=filled_form(issue)
  draft=BeautifulSoup(md.render(issue['draftMarkdown']),'html.parser')
  for table in list(draft.find_all('table')):table.wrap(draft.new_tag('div',attrs={'class':'draft-table','tabindex':'0'}))
  for li in draft.find_all('li'):
   first=li.contents[0] if li.contents else None
   if isinstance(first,str) and first.startswith('[ ] '):first.replace_with(BeautifulSoup('<input type="checkbox" disabled aria-label="未完成"> '+esc(first[4:]),'html.parser'))
  props='<dl class="props">'+''.join('<div><dt>'+esc(k)+'</dt><dd>'+text(v)+'</dd></div>' for k,v in issue['properties'].items())+'</dl>'
  parts.append('<section id="'+ident+'" data-panel="'+ident+'" class="document"><p class="eyebrow">'+ident+' · '+esc(issue['verdict'])+'</p><h2>'+esc(issue['title'])+'</h2>'+props+'<div class="issue-actions" role="tablist" aria-label="'+ident+' 内容"><button role="tab" aria-selected="true" data-switch="audit">检查结果</button><button role="tab" aria-selected="false" data-switch="form">已填表单</button></div><div data-view="audit" class="active">'+audits+'</div><div data-view="form">'+filled+'<details class="generated"><summary>查看生成的 Issue 正文</summary><article class="draft">'+str(draft)+'</article></details></div></section>')
  # 原始 Markdown 仅内嵌用于校验，不作为阅读入口。
 layout=soup.new_tag('div',attrs={'class':'layout'});layout.append(cover);main=soup.new_tag('main',attrs={'class':'flow'});frag=BeautifulSoup(overview+''.join(parts),'html.parser');main.extend(list(frag.contents));layout.append(main);soup.body.extend(list(BeautifulSoup(nav,'html.parser').contents));soup.body.append(layout)
 style=soup.new_tag('style');style.string=CSS;soup.head.append(style);script=soup.new_tag('script');script.string=JS;soup.body.append(script)
 out.write_text(str(soup));print(json.dumps({'html':str(out),'issues':len(data['issues']),'checks':sum(len(i['checks']) for i in data['issues']),'format':'standalone HTML'},ensure_ascii=False))
if __name__=='__main__':main()
