"""Package the eight Linear skills and verify extraction without personal installations."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib, json, tempfile, subprocess

repo = Path(__file__).resolve().parents[2]
name = 'forge-linear-skills-2026-11-16.zip'
out = repo / 'docs/distribution' / name
skills = sorted(p for p in (repo / 'skills').glob('forge--linear--*') if p.is_dir())
assert len(skills) == 8
readme = '''# Linear Skills · 2026-11-16

本包包含八个 forge--linear--* Skill，使用统一字段契约 v18。

将 skills/ 内八个完整目录复制到目标应用技能目录，保持同级。采用独立实体目录；已有版本先备份再替换，不需要个人安装路径或软链接。

个人入口 create-linear-issues 对应 forge--linear--create-issues；backfill-linear-issues 对应 forge--linear--backfill-issues。plan-linear-cycle 不包含在此包。

用浏览器打开 forge--linear--show-issue-form/assets/issue-form.html；保留 assets/examples/，Header 中可以查看 Todo List 与类幸存者两个 Feature。

生成页面和正文需要 Node.js 24+；补录计点需要 Python 3。示意命令需调整 SKILL_ROOT / PROJECT_ROOT：

```sh
node --experimental-strip-types SKILL_ROOT/forge--linear--show-issue-form/scripts/show-issue-form.ts --output PROJECT_ROOT/docs/issue-form.html
node SKILL_ROOT/forge--linear--create-issues/scripts/assemble-issue.mjs --input PROJECT_ROOT/docs/form.json --output PROJECT_ROOT/docs/issue.md --linear-output PROJECT_ROOT/docs/linear.json
node SKILL_ROOT/forge--linear--create-issues/scripts/validate-issue-body.mjs --form PROJECT_ROOT/docs/form.json PROJECT_ROOT/docs/issue.md
```

创建和规格 review 共用表单 JSON 及生成器，不手改生成的正文。未知字段拒绝，缺项以待补草稿交付。真实 Linear 写入需要使用者的自装 MCP 和授权，本包不含账号凭据。

独立 HTML 评审报告还需 lv-editorial-pdf 与其 Python 依赖；逐 Task 视频、配音和形式化验证等额外产物按对应 reference 准备依赖。附带源码测试用于原仓库开发检查，本 ZIP 不是完整的仓库测试工程。原型、示例和本地生成不代表真实产品验收通过。

文件校验见 SHA256SUMS。LICENSE 与随包 third_party 版权声明一并保留。
'''
files = {str(f.relative_to(repo)): f.read_bytes() for skill in skills for f in sorted(skill.rglob('*')) if f.is_file()}
assert all(not f.is_symlink() for skill in skills for f in skill.rglob('*'))
files['README.md'] = readme.encode()
files['LICENSE'] = (repo / 'LICENSE').read_bytes()
files['SHA256SUMS'] = ''.join(hashlib.sha256(v).hexdigest() + '  ' + k + '\n' for k, v in sorted(files.items())).encode()
out.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(out, 'w', ZIP_DEFLATED) as z:
    for k, v in files.items():
        z.writestr(k, v)
with ZipFile(out) as z:
    assert z.testzip() is None
    assert set(z.namelist()) == set(files)
    for k, v in files.items():
        assert z.read(k) == v
    with tempfile.TemporaryDirectory(prefix='package-verify-', dir=repo/'docs') as folder:
        root = Path(folder); z.extractall(root)
        env = {'PATH': __import__('os').environ['PATH'], 'HOME': str(root), 'LINEAR_FORM_SKILLS_ROOT': str(root/'skills')}
        def run(args, success=True):
            r = subprocess.run(args, env=env, cwd=root, capture_output=True, text=True)
            assert (r.returncode == 0) == success, r.stderr
            return r
        script = root/'skills/forge--linear--show-issue-form/scripts/show-issue-form.ts'
        output = root/'docs/issue-form.html'
        run(['node', '--experimental-strip-types', str(script), '--output', str(output)])
        for demo in ['todolist', 'survivors']:
            assert (output.parent/'examples'/(demo+'.html')).is_file()
        generator = root/'skills/forge--linear--create-issues/scripts/assemble-issue.mjs'
        validator = generator.with_name('validate-issue-body.mjs')
        source = root/'skills/forge--linear--show-issue-best-practice/best-practice-examples/issue-example.json'
        normalized = root/'docs/form.json'
        normalizer = "import {readFileSync,writeFileSync} from 'node:fs';import {pathToFileURL} from 'node:url';const [model,contract,source,dest]=process.argv.slice(1);const {normalizeDraft}=await import(pathToFileURL(model));writeFileSync(dest,JSON.stringify(normalizeDraft(JSON.parse(readFileSync(source)),JSON.parse(readFileSync(contract)))));"
        run(['node','--input-type=module','-e',normalizer,str(root/'skills/forge--linear--show-issue-form/assets/issue-model.mjs'),str(root/'skills/forge--linear--show-issue-best-practice/references/issue-contract.json'),str(source),str(normalized)])
        source = normalized
        md = root/'docs/issue.md'; linear = root/'docs/linear.json'
        run(['node', str(generator), '--input', str(source), '--output', str(md), '--linear-output', str(linear)])
        assert md.read_text() == json.loads(linear.read_text())['fields']['description']
        run(['node', str(validator), '--form', str(source), str(md)])
        md.write_text(md.read_text()+'\n## 额外正文\n拒绝篡改\n')
        run(['node', str(validator), '--form', str(source), str(md)], success=False)
        extra=json.loads(source.read_text());extra['unknown']='拒绝未知字段'
        bad=root/'docs/unknown.json';bad.write_text(json.dumps(extra))
        rejected=root/'docs/rejected.md'
        run(['node',str(generator),'--input',str(bad),'--output',str(rejected)],success=False)
        assert not rejected.exists()
receipt={'archive': 'docs/distribution/'+name, 'skills':len(skills),'files':len(files),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'checks':['CRC and file hashes','isolated extraction with clean HOME','form launcher and prototype copy','shared create/review generator','strict body validation and tamper rejection','unknown fields rejected without output']}
(repo/'docs/linear-skills-update-20261116/package-verification.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(receipt,ensure_ascii=False,indent=2))
