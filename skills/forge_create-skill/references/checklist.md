# 技能验证检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过。**

---

## 一、命名检查

### 1.1 目录名格式
- [ ] ✅ 技能目录名以 `forge_` 开头，后缀仅包含小写字母、数字和连字符（kebab-case），符合正则 `^forge_[a-z0-9]+(-[a-z0-9]+)*$`
  - ❌ 错误示例：`my-skill`、`forge_MySkill` → 必须改为 `forge_my-skill`、`forge_my-skill`
- [ ] ✅ `name` 长度 ≤ 64 个字符
- [ ] ❌ 不得以连字符开头或结尾（`-skill` → 必须改为 `skill`，`skill-` → 必须改为 `skill`）
- [ ] ❌ 不得包含连续连字符（`my--skill` → 必须改为 `my-skill`）
- [ ] ❌ 不得在已是多词的前缀后再追加赘余 `-skill`（前缀已含连字符）
  - ❌ 错误示例：`exam-grading-skill` → 必须改为 `exam-grading`
  - ✅ 合法示例：`forge_create-skill` → `create`无连字符，`skill` 是合法名词
- [ ] ✅ 动词型 Skill 必须以「动词+名词」命名，不得倒置为名词+动词
  - ❌ 错误示例：`skill-creator`（名词-名词）、`classname-refactor`（名词-动词） → 应改为 `forge_create-skill`、`forge_refactor-classname`
  - ✅ 正确示例：`forge_create-skill`、`forge_check-components`、`forge_implement-trpc-query`

### 1.2 name 字段与目录名一致性
- [ ] ✅ SKILL.md 前言 `name` 字段值与所在目录名完全一致（字符级对比，包含 `forge_`）
  - ❌ 错误示例：目录名为 `forge_log-monitor`，前言 `name: log-monitor` → 必须统一为 `forge_log-monitor`
- [ ] ✅ 最佳实践类技能目录名以 `-best-practice` 结尾
  - ❌ 错误示例：`skill-quality`、`skill-validator` → 必须改为 `forge_skill-best-practice`

---

## 二、SKILL.md 前言检查

### 2.1 YAML 格式
- [ ] ✅ 文件以 `---` 开头，前言区是有效 YAML，以 `---` 结束
  - ❌ 错误示例：前言缺少结束 `---`，或 YAML 缩进不正确 → 必须修复为合法 YAML
- [ ] ❌ 前言不得包含 `name`/`description` 以外的字段（不允许 `version`、`author`、`tags` 等）

### 2.2 name 字段
- [ ] ✅ 前言包含 `name` 字段且值为非空字符串
  - ❌ 错误示例：`name: ""` 或 `name:` → 必须填写实际技能名称

### 2.3 description 字段
- [ ] ✅ 前言包含 `description` 字段，且为单行文本（不含换行符）
  - ❌ 错误示例：`description: 批改考试\n支持多题型` → 必须合并为单行
- [ ] ✅ `description` 长度少于 150 个字符（过长会影响扫描和触发判断）
  - ❌ 错误示例：超过或等于 150 个字符 → 必须精简
- [ ] ❌ `description` 不得包含 `<` 或 `>` 字符（会破坏 XML/HTML 渲染）
- [ ] ❌ `description` 不得包含未完成的 TODO 占位文本（`{todo}`、`[待填写]` 等）
- [ ] ✅ `description` 同时说明技能做什么 **和** 何时触发（不得只写功能而省略触发条件）
  - ❌ 错误示例：`description: 用于创建技能` → 缺少触发短语
  - ✅ 正确示例：`description: 创建新技能或更新现有技能的指南。当用户说"创建一个技能"、"帮我写 SKILL.md"时触发`

---

## 三、SKILL.md 主体检查

### 3.1 篇幅控制
- [ ] ✅ 主体（前言以外部分）不超过 500 行
  - ❌ 超出原因通常是把代码、完整示例内联在主体中 → 必须移至 `references/` 文件

### 3.2 引用完整性
- [ ] ✅ 主体中提到的所有 `references/` 文件在文件系统中实际存在（逐一核对路径）
  - ❌ 错误示例：主体写了 `references/schema.md` 但该文件不存在 → 必须创建文件或删除引用
- [ ] ✅ 所有引用均为一级深度（直接从 SKILL.md 链接，不通过其他 references 文件中转）
  - ❌ 错误示例：SKILL.md → `references/overview.md` → `references/detail.md`（二级引用）→ 必须将 detail 内容合并或直接从 SKILL.md 链接
- [ ] ✅ 每个引用的 references 文件都标注了 **何时** 应读取它（触发条件或使用场景）
  - ❌ 错误示例：只写 `参见 references/checklist.md`，未说明在哪个步骤读取

### 3.3 内容边界
- [ ] ❌ 主体不得包含"何时使用此技能"的说明（该内容应放在 `description` 字段）
- [ ] ❌ 主体不得包含代码块（代码/命令/SQL 必须放 `scripts/` 或 `references/` 文件中）
  - ❌ 错误示例：SKILL.md 中出现 ` ```bash ... ``` ` 代码块 → 提取到 references 文件

---

## 四、文件完整性检查

### 4.1 必需文件
- [ ] ✅ Skill 根目录存在 `SKILL.md` 文件（必须大写，文件名固定）
  - ❌ 错误示例：`skill.md`、`Skill.md`、`README.md` → 必须重命名为 `SKILL.md`
- [ ] ✅ `scripts/` 中的所有文件均为可执行脚本（`.ts`、`.py`、`.sh` 等），不含文档文件
  - ❌ 错误示例：`scripts/notes.md`、`scripts/todo.txt` → 必须移至 `references/`
- [ ] ✅ `references/` 中的所有文件均为 Markdown 或 JSON 文档，不含脚本文件
  - ❌ 错误示例：`references/deploy.sh` → 必须移至 `scripts/`

### 4.2 禁止文件
- [ ] ❌ 不得存在辅助文档（`README.md`、`INSTALLATION_GUIDE.md`、`QUICK_REFERENCE.md`、`CHANGELOG.md`）
- [ ] ❌ 不得存在临时文件或缓存（`__pycache__/`、`*.pyc`、`.DS_Store`、`Thumbs.db`、`tmp/`、`*.log`）
- [ ] ❌ 不得包含与 AI 完成任务无关的文件或目录（如 `LICENSE`、`.git/`、`node_modules/`）

### 4.3 空目录检查
- [ ] ❌ 不得存在空目录（`scripts/` 或 `references/` 目录下无任何文件时必须删除该空目录）

### 4.4 references 文件一致性
- [ ] ✅ `references/` 目录中的每个文件都被 SKILL.md 主体引用（无孤立文件）
  - ❌ 错误示例：`references/old-notes.md` 从未在 SKILL.md 中提及 → 必须删除或补充引用
- [ ] ✅ SKILL.md 引用的每个 references 文件路径拼写正确、大小写一致

---

## 五、内容一致性检查

- [ ] ❌ SKILL.md 与 references 文件不得包含相同内容（每个信息只在一处维护，避免同步问题）
  - ❌ 错误示例：SKILL.md 里写了完整的命令示例，references 文件里又写了一遍 → 选一处保留
- [ ] ✅ Skill 整体传递的执行流程与步骤编号前后一致（SKILL.md 中步骤 N 对应的 references 文件内容与步骤描述匹配）
  - ❌ 错误示例：SKILL.md 写"步骤 3 见 checklist.md"，但 checklist.md 对应的是步骤 5 的内容

---

## 六、⚠️ 仓库注册检查（强制后置步骤）

- [ ] ✅ 已确认：如果仓库 `README.md` 文档中有技能表格，确认新技能是否已添加到仓库根目录 `README.md` 的技能表格中？
