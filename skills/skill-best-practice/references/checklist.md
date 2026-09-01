# Skill 检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、命名规范检查

### 1.1 目录名格式（正则：`^forge_[a-z0-9]+(-[a-z0-9]+)*$`）
- [ ] ✅ 目录名以 `forge_` 开头，后接小写字母、数字和连字符（`-`），不含其他下划线、空格或大写字母
  - ❌ 错误示例：`exam-grading`、`forge_ExamGrading` → 必须改为 `forge_exam-grading`

### 1.2 禁止在多词名称后追加赘余 `-skill` 后缀
- [ ] ✅ 若目录名以 `-skill` 结尾，且去掉 `-skill` 后前缀本身已含连字符（即已是多词），则视为赘余后缀，必须删除
  - ❌ 错误示例：`forge_exam-grading-skill` → 前缀已含连字符 → 必须改为 `forge_exam-grading`
  - ✅ 合法示例：`forge_create-skill` → namespace 保留，后缀名称符合动词+名词命名规范

### 1.3 动词型 Skill 必须以「动词+名词」形式命名
- [ ] ✅ 动词型 Skill（名称不以 `-best-practice`、`-integration` 结尾）目录名必须是 `动词-名词` 结构
  - ❌ 错误示例：`forge_skill-creator`（名词-名词）→ 应改为 `forge_create-skill`
  - ✅ 正确示例：`forge_create-skill`、`forge_check-components`、`forge_implement-trpc-query`

### 1.4 最佳实践类 Skill 必须有 `-best-practice` 后缀（仅适用于最佳实践检查类）
- [ ] ✅ 最佳实践检查类 Skill 目录名以 `-best-practice` 结尾
  - ❌ 错误示例（最佳实践类）：`skill-quality`、`skill-validator` → 必须改为 `skill-best-practice`
  - ✅ 非最佳实践类 Skill 跳过此项（如 `create-skill`、`check-components` 无需此后缀）

---

## 二、SKILL.md 前言区检查

### 2.1 `name` 字段存在
- [ ] ✅ SKILL.md 的 YAML 前言区（`---` 之间）包含 `name` 字段
  - ❌ 错误示例：前言区只有 `description`，无 `name` → 必须添加 `name: skill-name`

### 2.2 `name` 字段与目录名完全一致
- [ ] ✅ `name` 字段值 = 目录名（字符完全匹配，包含 `forge_` 前缀）
  - ❌ 错误示例：目录名 `forge_dao-best-practice`，但 `name: dao-best-practice` → 必须统一为 `name: forge_dao-best-practice`

### 2.3 `description` 字段存在
- [ ] ✅ 前言区包含 `description` 字段
  - ❌ 错误示例：前言区缺少 `description` 字段 → 必须添加

### 2.4 `description` 为单行文本
- [ ] ✅ `description` 值不含换行符（单行）
  - ❌ 错误示例：description 值跨多行 → 必须改为单行文本

### 2.5 `description` 长度少于 150 字符
- [ ] ✅ `description` 字符数少于 150（字符数 = len(description_value)）
  - ❌ 错误示例：超过或等于 150 字符的 description → 必须精简到少于 150 字符

### 2.6 SKILL.md 主体极简原则
- [ ] ✅ SKILL.md 正文（前言区以外）只包含基本流程入口（如指向 references/ 文件的链接），不包含内联实现细节
  - ❌ 错误示例：正文包含 Step 1/2/3/4 详细步骤、代码块（``` 包裹内容）、超过 5 条的完整清单 → 必须移入 `references/`
  - ✅ 正确示例：正文 ≤ 20 行，只有简短说明 + 指向 `references/workflow.md`、`references/checklist.md` 的链接

### 2.7 `description` 前缀协议
- [ ] ✅ **动词型 Skill**（执行操作/检查，名称不以 `-best-practice` 结尾）`description` 必须以 `Use when` 开头
  - ❌ 错误示例：`description: 自动检查并转换 className...` → 必须改为 `description: Use when 需要检查或转换...`
- [ ] ✅ **名词型 Skill**（定义规范/标准，名称以 `-best-practice` 结尾）`description` 必须以 `Must follow` 开头
  - ❌ 错误示例：`description: 规范化 DAO 文件...` → 必须改为 `description: Must follow when 创建或重构 DAO...`
  - ✅ 判断依据：目录名以 `-best-practice` 结尾 → Must follow；否则 → Use when

### 2.8 动词型 Skill 必须有 `references/checklist.md`
- [ ] ✅ 动词型 Skill（名称不以 `-best-practice` 结尾、不以 `-integration` 结尾）必须在 `references/` 下包含 `checklist.md`（执行完成后的验证清单）
  - ❌ 错误示例：无 `references/checklist.md`，无法判断操作是否正确执行完毕
  - ✅ 正确示例：`references/checklist.md` 包含"执行完毕后逐项确认"的 5-8 条可勾选验证项
  - 🔍 与名词型 Skill 的区别：名词型的 checklist 描述**代码规范**；动词型的 checklist 描述**操作完成校验**

### 2.9 `references/checklist.md` 必须使用 `- [ ]` 勾选格式
- [ ] ✅ 凡存在 `references/checklist.md` 的 Skill，其内容必须以 `- [ ] 已…` 勾选条目为主体（op-completion 格式），每条以 `已` 开头，不得使用 `### 检查项 N` 文档块格式
  - ❌ 错误示例：使用 `### 检查项 1: 命名规范` + `- **通过标准**:` 的 prose 文档格式
  - ❌ 错误示例：使用 `N. [ ]`（带序号）而非 `- [ ]` 格式
  - ❌ 错误示例：条目内容不以 `已` 开头（如 `- [ ] 命名规范已检查` → 应为 `- [ ] 已完成命名规范检查`）
  - ✅ 正确示例：`- [ ] 已…` 可勾选项，无 `##` 分节标题

---

## 三、目录结构检查

### 3.1 SKILL.md 文件存在
- [ ] ✅ Skill 根目录下存在 `SKILL.md` 文件
  - ❌ 错误示例：只有 `README.md`，无 `SKILL.md` → 必须创建 `SKILL.md`

### 3.2 仅包含合法子目录（`scripts/`、`references/`、`assets/`、`best-practice-examples/`）
- [ ] ✅ 根目录下除 `SKILL.md` 外，只存在 `scripts/`、`references/`、`assets/` 三个目录，无其他文件/目录
  - ❌ 错误示例：存在 `README.md`、`LICENSE`、`test/` → 必须删除不符合规范的文件/目录
  - ❌ 错误示例：存在 `docs/` 目录 → 必须移动到 `references/` 下或删除

### 3.3 无空目录
- [ ] ✅ 不存在任何空子目录（不含任何文件的目录）
  - ❌ 错误示例：`scripts/` 目录为空 → 必须删除空目录或添加必要文件

---

## 四、文件清理检查

- [ ] ✅ 不存在以下临时文件或目录：`__pycache__/`、`*.pyc`、`*.pyo`、`.DS_Store`、`Thumbs.db`、`tmp/`、`temp/`、`.cache/`、`.pytest_cache/`、`*.log`
  - ❌ 错误示例：存在 `.DS_Store` → 必须删除
  - ❌ 错误示例：存在 `__pycache__/` → 必须删除

---

## 五、依赖元数据检查

### 5.1 `dependency.python` 格式（如存在）
- [ ] ✅ `dependency.python` 为列表，每个元素符合 requirements.txt 格式（`package>=1.0.0`）
  - ❌ 错误示例：`dependency: pip install PyYAML` → 必须改为 `dependency: { python: ["PyYAML>=5.1"] }`
  - ❌ 错误示例：`python: "PyYAML"` 字符串而非列表 → 必须改为列表格式

### 5.2 `dependency.system` 格式（如存在）
- [ ] ✅ `dependency.system` 为列表，不包含 `pip install`、`pip3 install`、`python -m pip` 命令
  - ❌ 错误示例：`system: ["pip install requests"]` → 必须移到 `dependency.python`

---

## 六、Best Practice Skill 额外检查（仅适用于 `-best-practice` 类 Skill）

- [ ] ✅ `references/checklist.md` 文件存在（强制要求）
  - ❌ 错误示例：缺少 `references/checklist.md` → 必须创建
- [ ] ✅ `best-practice-examples/` 目录存在且包含至少一个示例文件/文件夹（强制要求）
  - ❌ 错误示例：缺少 `best-practice-examples/` 或目录为空 → 必须创建包含真实代码示例的文件
  - ✅ 正确示例：`best-practice-examples/userDao.ts`、`best-practice-examples/UserCard/`（含完整代码）
- [ ] ✅ `.md` 文档（`references/checklist.md`、`references/standard.md` 等）中**不得出现 Good Case 代码块**；所有 Good Case 代码只放在 `best-practice-examples/` 目录下
  - ❌ 错误示例：`standard.md` 里写了 `// ✅ 正确写法` 代码块 → 必须移到 `best-practice-examples/` 文件中
  - ✅ `.md` 中只允许写 Bad Case 代码块（说明错误模式），Good Case 一律以文件形式存放
- [ ] ✅ `references/` 目录下**不得存在**仅包含 Good Case 代码的 `.md` 文件（如 `patterns.md`、`examples.md` 等）
  - ❌ 错误示例：`references/patterns.md` 包含 Good Case 代码块 → 必须删除该文件，代码移至 `best-practice-examples/`
  - ✅ 正确示例：`references/` 只放 checklist、standard（文字描述）、架构图等，不放可运行代码
- [ ] ✅ checklist 中每一项都能映射到**唯一**的正确代码模式（Unique Mapping Principle）
  - ❌ 错误示例：`- [ ] 命名要规范`（无法判断是/否）→ 必须改为 `- [ ] ✅ 文件名格式为 {feature}Dao.ts（如 catsDao.ts），❌ 错误：CatsDAO.ts、cats-dao.ts`
- [ ] ✅ checklist 包含 Bad Case 确认节（列出**不得出现**的反模式）
  - ❌ 错误示例：checklist 只有正面规则，无 `## Bad Case 确认` 节 → 必须添加

---

## 七、报告格式（执行完成后必须输出）

**检查级别说明**：

| 级别 | 含义 | 处理方式 |
|------|------|---------|
| **pass**（通过） | 完全符合规范 | 无需操作 |
| **warning**（警告） | 建议修复但不影响核心功能（如 description 长度略超/略低于范围、存在不影响运行的空目录） | 视情况修复 |
| **error**（错误） | 违反强制规范，必须修复（如缺少 name/description、文件名不合规、带 -skill 后缀） | 必须修复后才能通过检查 |

完成所有检查项后，输出以下格式的报告：

```
Skill 检查报告
- 技能名称: {skill-name}
- 总体状态: ✅ 通过 / ⚠️ 警告 / ❌ 有错误需修复
- 检查统计: 通过 {n} / 警告 {n} / 错误 {n} / 总计 {n}
- 错误详情: [逐条列出 ❌、⚠️ 项及修复建议]
```

---

## Bad Case 确认（Skill 本身的反模式，以下情况不得出现）

- [ ] ❌ 不存在 `README.md` 替代 `SKILL.md` 作为入口文档的情况
- [ ] ❌ 不存在 `name` 字段与目录名不一致的情况
- [ ] ❌ 不存在 description 字符数超过或等于 150 的情况
- [ ] ❌ 不存在未以 `forge_` 开头的技能目录、frontmatter name 或 README 链接
- [ ] ❌ 不存在带赘余 `-skill` 后缀的目录名（即前缀已含连字符却再附加 `-skill`）的情况
- [ ] ❌ 不存在动词型 Skill 以名词+名词（如 `skill-creator`）而非动词+名词（如 `create-skill`）命名的情况
- [ ] ❌ 不存在 `__pycache__`、`.DS_Store` 等临时文件被提交进 Skill 的情况
- [ ] ❌ 不存在 SKILL.md 正文内嵌大量实现细节（步骤代码块、完整清单）而 `references/` 为空的情况
- [ ] ❌ 不存在 `.md` 文档中出现 Good Case 代码块的情况（Good Case 只能在 `best-practice-examples/` 文件中）
- [ ] ❌ 不存在 `references/` 目录包含仅放 Good Case 代码的 `.md` 文件（如 `patterns.md`、`examples.md`）的情况
- [ ] ❌ 不存在动词型 Skill description 未以 `Use when` 开头的情况
- [ ] ❌ 不存在名词型（`-best-practice`）Skill description 未以 `Must follow` 开头的情况
- [ ] ❌ 不存在动词型 Skill 缺少 `references/checklist.md` 的情况
