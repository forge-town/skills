# 正式环境 Skill 规范同步实现计划

> **执行指引：** 推荐使用 subagent-driven-development 技能逐任务执行此计划。
> 步骤使用 checkbox (`- [ ]`) 语法追踪进度。

**目标：** 将 Daedalus 正式规则同步到 forge-town/skills 的 UI 规范与 Skill 质量检查器，并完成全部 Skill 的 `forge_` namespace 迁移。

**架构：** 先为检查器提取可测试的纯函数和结构化结果，再同步规范文档与示例；最后以机械化重命名更新目录、frontmatter、README、交叉引用和 package 入口。语义性的最终渲染判断留给 Daedalus 项目扫描，不在通用仓库里伪造静态结论。

**技术栈：** TypeScript、tsx、Node `node:test`、Markdown/YAML frontmatter、Git。

---

## 文件结构规划

- 修改 `skills/check-all-skills/references/examples/check-skills.ts`：实现 `forge_` namespace 感知、16 项质量要求的确定性检查、结构化结果和退出码。
- 新建 `skills/check-all-skills/references/examples/check-skills.test.ts`：覆盖阈值、frontmatter、目录、README、临时文件、依赖和 namespace 边界。
- 修改 `skills/check-all-skills/references/checklist.md`、`skills/check-all-skills/references/quality-standards.md`、`skills/check-all-skills/references/examples/check-report-template.json`、`skills/check-all-skills/references/examples/quick-checklist.txt`：同步严格阈值、证据状态和 namespace。
- 修改 `skills/skill-best-practice/SKILL.md`、`skills/skill-best-practice/references/checklist.md`、`skills/skill-best-practice/references/anatomy.json`、`skills/skill-best-practice/references/check-report-template.md`：同步自动检查边界、正式判定原则和 `forge_` 示例。
- 修改 `skills/create-skill/SKILL.md`、`skills/create-skill/references/checklist.md`、`skills/create-skill/references/anatomy.json`、`skills/create-skill/references/skill-initialization-guide.md`：新建 Skill 默认使用 `forge_` namespace，并保持 description `<150`。
- 修改 `skills/ui-components-best-practice/references/standard.md`、`skills/ui-components-best-practice/references/checklist.md`、`skills/ui-components-best-practice/best-practice-examples/UserForm.tsx`、`skills/ui-components-best-practice/best-practice-examples/BadExample.tsx`：同步基础 DOM 边界和示例。
- 修改 `README.md`、`package.json`：更新所有 Skill 链接/名称与检查脚本入口。
- 重命名全部 `skills/<name>/` 为 `skills/forge_<name>/`，并同步各个 `SKILL.md` 的 `name` 和仓库内操作性引用。

## 任务

### Task 1: 提取并测试 Skill 检查器的确定性规则

**文件：**
- 修改: `skills/check-all-skills/references/examples/check-skills.ts`
- 新建: `skills/check-all-skills/references/examples/check-skills.test.ts`
- 修改: `package.json`

- [ ] **Step 1: 编写失败测试（Red）**

在 `check-skills.test.ts` 中使用 `node:test` 和临时目录，覆盖以下可观察行为：

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSkill, parseFrontmatter, isValidSkillName } from "./check-skills.ts";

async function makeSkill(name: string, files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "forge-skill-test-"));
  const skillDir = join(root, name);
  await mkdir(skillDir, { recursive: true });
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = join(skillDir, relativePath);
    await mkdir(join(filePath, ".."), { recursive: true });
    await writeFile(filePath, content, "utf8");
  }
  return root;
}

test("accepts the forge namespace and rejects the unnamespaced directory", () => {
  assert.equal(isValidSkillName("forge_ui-components-best-practice"), true);
  assert.equal(isValidSkillName("ui-components-best-practice"), false);
});

test("description length is strictly less than 150", async () => {
  const frontmatter = parseFrontmatter("---\nname: forge_demo\ndescription: " + "a".repeat(149) + "\n---\n");
  assert.equal(frontmatter?.description.length, 149);
  const root = await makeSkill("forge_demo", {
    "SKILL.md": `---\nname: forge_demo\ndescription: ${"a".repeat(150)}\n---\n简要入口\n`,
    "references/checklist.md": "- [ ] 已完成演示操作\n",
  });
  try {
    const result = checkSkill(join(root, "forge_demo"), "| [forge_demo](skills/forge_demo) |");
    assert.match(result.errors.join("\n"), /少于 150/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("reports each missing structural requirement instead of silently passing", async () => {
  const root = await makeSkill("forge_demo-best-practice", {
    "SKILL.md": `---\nname: forge_demo-best-practice\ndescription: Must follow when 验证示例规范和检查结果，确保结构、元数据与可追溯证据满足项目要求。\n---\n简要入口\n`,
    ".DS_Store": "temporary",
  });
  try {
    const result = checkSkill(join(root, "forge_demo-best-practice"), "");
    assert.ok(result.errors.includes("best-practice-examples/ 缺失或为空"));
    assert.ok(result.errors.includes("存在临时文件: .DS_Store"));
    assert.ok(result.errors.includes("README.md 中未记录"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("frontmatter and README checks use forge names", async () => {
  const root = await makeSkill("forge_demo", {
    "SKILL.md": "---\nname: forge_demo\ndescription: Use when 执行一个可复用的演示操作并需要检查输入、输出和完成状态是否满足约束。\n---\n简要入口\n",
    "references/checklist.md": "- [ ] 已完成演示操作\n",
  });
  try {
    const result = checkSkill(join(root, "forge_demo"), "| [forge_demo](skills/forge_demo) |");
    assert.equal(result.passed, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
```

测试 fixture 必须写入临时目录并在 `finally` 中删除，不能把 fixture 垃圾留在技能目录。

- [ ] **Step 2: 运行测试确认失败**

运行：`pnpm exec tsx --test skills/check-all-skills/references/examples/check-skills.test.ts`

预期：FAIL，因为现有脚本没有导出纯函数、拒绝旧 namespace，也没有检查临时文件和结构化错误。

- [ ] **Step 3: 编写最小实现（Green）**

在 `check-skills.ts` 中导出 `parseFrontmatter`、`isValidSkillName`、`checkSkill`，并引入以下确定性规则：

```typescript
const FORGE_SKILL_NAME = /^forge_[a-z0-9]+(-[a-z0-9]+)*$/;
const DESCRIPTION_LIMIT = 150;

export function isValidSkillName(name: string): boolean {
  return FORGE_SKILL_NAME.test(name);
}

function baseSkillName(name: string): string {
  return name.replace(/^forge_/, "");
}

function getSkillType(name: string): "verb" | "best-practice" | "integration" {
  const base = baseSkillName(name);
  if (base.endsWith("-best-practice")) return "best-practice";
  if (base.endsWith("-integration")) return "integration";
  return "verb";
}

if (frontmatter.description.length >= DESCRIPTION_LIMIT) {
  errors.push(`description 长度: ${frontmatter.description.length} 字符（必须少于 150 字符）`);
}
```

`checkSkill` 还必须检查 `SKILL.md` 正文不超过 20 行、frontmatter 前缀、必需 checklist/example、临时文件模式、dependency 列表格式、README `[forge_name](skills/forge_name)` 链接和旧 `skills/<name>` 操作性引用。每项错误保留单独消息；语义无法静态证明的项目返回 `evidence-required`，不计入 pass。

`package.json` 增加：

```json
{
  "scripts": {
    "check:skills": "tsx skills/forge_check-all-skills/references/examples/check-skills.ts ./skills ./README.md",
    "test:skills": "tsx --test skills/forge_check-all-skills/references/examples/check-skills.test.ts"
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

运行：`pnpm run test:skills`

预期：PASS，边界 fixture 全部通过；149 字符通过，150 字符失败，旧 namespace 失败。

- [ ] **Step 5: 重构（Refactor）**

在测试全绿后，将规则消息集中为常量，确保 CLI 输出、测试断言和文档只维护一份阈值定义；再次运行 `pnpm run test:skills`。

- [ ] **Step 6: 提交**

```bash
git add skills/check-all-skills/references/examples/check-skills.ts skills/check-all-skills/references/examples/check-skills.test.ts package.json
git commit -m "feat: enforce forge skill quality checks"
```

### Task 2: 同步检查器文档和 Skill 元规范

**文件：**
- 修改: `skills/check-all-skills/references/checklist.md`
- 修改: `skills/check-all-skills/references/quality-standards.md`
- 修改: `skills/check-all-skills/references/examples/check-report-template.json`
- 修改: `skills/check-all-skills/references/examples/quick-checklist.txt`
- 修改: `skills/skill-best-practice/SKILL.md`
- 修改: `skills/skill-best-practice/references/checklist.md`
- 修改: `skills/skill-best-practice/references/anatomy.json`
- 修改: `skills/skill-best-practice/references/check-report-template.md`
- 修改: `skills/create-skill/SKILL.md`
- 修改: `skills/create-skill/references/checklist.md`
- 修改: `skills/create-skill/references/anatomy.json`
- 修改: `skills/create-skill/references/skill-initialization-guide.md`

- [ ] **Step 1: 编写失败测试（Red）**

在 Task 1 的 fixture 中增加文档契约断言：自动规则必须在所有规范文档中使用 `description < 150`、`forge_` namespace、`evidence-required` 和“只看最终可呈现结构/行为”的术语，不得出现旧的 `100-150` 或旧 namespace 链接。

- [ ] **Step 2: 运行测试确认失败**

运行：`pnpm run test:skills`

预期：FAIL，因为规范文档仍有旧示例、旧路径或缺少正式判定原则。

- [ ] **Step 3: 编写最小实现（Green）**

把文档统一为以下约束：

```markdown
- `name` 必须与目录名完全一致，目录格式为 `forge_<kebab-case>`。
- `description` 必须是单行且严格少于 150 个字符。
- 动词型 Skill 的 description 以 `Use when` 开头；最佳实践型以 `Must follow when` 开头。
- 结构性检查必须逐项给出实际证据；无法静态证明的语义项标记 `evidence-required`，不能当作 pass 或 skip。
- 语义审查只根据最终可呈现结构与行为，每个 checklist 独立判定，已覆盖问题不重复产生 general finding。
```

移除所有“100-150”描述和未带 `forge_` 的新建示例；历史设计文档中的旧路径保持原样，仅不作为操作性引用。

- [ ] **Step 4: 运行测试确认通过**

运行：`pnpm run test:skills && rg -n "100.?150|description.*少于 100|skills/(?!forge_)" skills/check-all-skills skills/skill-best-practice skills/create-skill -g '*.md' -g '*.json'`

预期：测试 PASS；正则搜索无结果（命令使用支持 PCRE2 的 `rg -P`）。

- [ ] **Step 5: 重构（Refactor）**

统一中文术语（`evidence-required`、`Bad Case`、`best-practice-examples`）和报告字段，避免同一规则在三个 Skill 中出现不同阈值。

- [ ] **Step 6: 提交**

```bash
git add skills/check-all-skills skills/skill-best-practice skills/create-skill
git commit -m "docs: sync skill quality standards"
```

### Task 3: 同步正式 UI 组件规范和示例

**文件：**
- 修改: `skills/ui-components-best-practice/references/standard.md`
- 修改: `skills/ui-components-best-practice/references/checklist.md`
- 修改: `skills/ui-components-best-practice/best-practice-examples/UserForm.tsx`
- 修改: `skills/ui-components-best-practice/best-practice-examples/BadExample.tsx`

- [ ] **Step 1: 编写失败测试（Red）**

新增文本 fixture 检查：规范 Good Case 不得在业务组件中出现原生 `form/button/input/select/textarea/label/a/img/table`；Bad Case 必须明确标注这些反模式；规范必须写出 `div` 唯一布局例外和基础组件职责边界。

- [ ] **Step 2: 运行测试确认失败**

运行：`pnpm run test:skills`

预期：FAIL，因为当前 Good Case 含原生 `<form>`，standard.md 允许非基础组件直接使用语义化标签。

- [ ] **Step 3: 编写最小实现（Green）**

将规范核心段落改为：

```markdown
## 原生 DOM 边界

非基础 UI 组件、页面和业务模块只能直接使用 `div` 作为原生容器。`button`、`input`、`select`、`textarea`、`a`、`form`、`label`、`img`、表格和文本语义标签都必须由职责明确、可复用的基础 UI 组件封装。

基础组件的判定依据是其文件明确实现可复用的单一原生职责；不能通过别名、字符串标签名、`React.createElement` 或中间包装绕过边界。最终检查以实际渲染结构和行为为证据。
```

把 `UserForm.tsx` 改为使用项目级 `Form` 组件（或在示例中只演示字段组合而不渲染原生 form），并保留 `div` 布局容器；`BadExample.tsx` 继续作为反例，但不再与 Good Case 混淆。

- [ ] **Step 4: 运行测试确认通过**

运行：`pnpm run test:skills && pnpm run check:skills`

预期：UI 规范 fixture PASS；全库检查只报告迁移前已知缺失项，不报告 UI Good Case 使用被禁止原生标签。

- [ ] **Step 5: 重构（Refactor）**

删除重复的“任意语义化标签可直接使用”段落，确保组件映射表、检查清单、标准说明和示例使用同一套例外规则。

- [ ] **Step 6: 提交**

```bash
git add skills/ui-components-best-practice
git commit -m "docs: align UI component DOM boundary"
```

### Task 4: 执行 `forge_` namespace 全量迁移

**文件：**
- 重命名: `skills/*` 下全部 56 个 Skill 目录为 `skills/forge_*`
- 修改: 每个迁移后目录的 `SKILL.md` frontmatter `name`
- 修改: `README.md` 中所有 Skill 链接和名称
- 修改: 各 Skill 内操作性跨 Skill 引用
- 修改: `package.json` 中检查/测试脚本路径

- [ ] **Step 1: 编写失败测试（Red）**

在执行迁移前运行：

```bash
pnpm run check:skills
```

预期：FAIL，旧目录名不满足 `forge_` namespace，README 和 package 脚本仍指向旧路径。

- [ ] **Step 2: 运行测试确认失败**

运行：`rg -n "\[([^]]+)\]\(skills/(?!forge_)|name: (?!forge_)" README.md skills -g '*.md' -g '*.json' -g '*.ts' -P`

预期：输出旧 namespace 引用。

- [ ] **Step 3: 编写最小实现（Green）**

先用 Git 保留历史地重命名目录，再逐目录更新 frontmatter：

```bash
for dir in skills/*; do
  [ -d "$dir" ] || continue
  base="${dir#skills/}"
  case "$base" in forge_*) continue;; esac
  git mv "$dir" "skills/forge_$base"
done

rg -l '^name: ' skills/forge_*/SKILL.md | while IFS= read -r file; do
  dir="${file%/SKILL.md}"
  name="${dir##*/}"
  perl -0pi -e "s/^name:\s*[^\\n]+/name: $name/m" "$file"
done
```

随后仅在操作性文档、README、脚本和 Skill 内引用中把 `skills/<name>` 替换为 `skills/forge_<name>`，并把旧 frontmatter 名称替换为新目录名；历史设计规格不做机械改写。

- [ ] **Step 4: 运行测试确认通过**

运行：`pnpm run test:skills && pnpm run check:skills && git diff --check`

预期：namespace、README、frontmatter 和 package 路径全部通过；`git diff --check` 无输出。若存在原有缺失 checklist/example，报告应逐项列出而不是隐藏。

- [ ] **Step 5: 重构（Refactor）**

检查 `rg -n "skills/(?!forge_)" README.md skills package.json -P` 无结果；检查每个 `SKILL.md` 的 `name` 与父目录一致，删除因迁移产生的旧空目录和临时文件。

- [ ] **Step 6: 提交**

```bash
git add README.md package.json skills
git commit -m "refactor: namespace skills with forge prefix"
```

### Task 5: 全量质量验证与交付检查

**文件：**
- 验证: `README.md`
- 验证: `package.json`
- 验证: `skills/forge_*/`
- 验证: `docs/specs/2026-09-01-production-skill-standards-design.md`

- [ ] **Step 1: 编写失败测试（Red）**

构造一次完整报告并断言报告中包含总数、通过数、错误数、evidence-required 数和每项修复建议。

- [ ] **Step 2: 运行测试确认失败**

运行：`pnpm run check:skills`

预期：在已有缺失项未修复前返回非零，并明确指出技能名、规则标识、实际证据和建议。

- [ ] **Step 3: 编写最小实现（Green）**

修复迁移或同步过程中暴露的本次范围内问题；不擅自修复与本次规范无关的业务文件。报告格式固定为：

```text
Skill 检查报告
- 技能名称: forge_<skill-name>
- 检查项: <rule-id>
- 状态: pass | error | evidence-required
- 实际证据: <path/value>
- 修复建议: <action>
```

- [ ] **Step 4: 运行测试确认通过**

运行：`pnpm run test:skills && pnpm run check:skills && git diff --check`

预期：测试 PASS；检查器只对真实错误返回非零；报告无旧 namespace、旧长度阈值或无证据的假通过。

- [ ] **Step 5: 重构（Refactor）**

逐项对照已批准规格和本计划，确认没有修改戴达罗斯数据库、没有暴露环境凭据、没有把历史文档误改成当前事实；检查 Git 状态只包含本次范围文件。

- [ ] **Step 6: 提交**

```bash
git add README.md package.json skills docs/plans/2026-09-01-production-skill-standards-sync.md
git commit -m "chore: verify production skill standards sync"
```
