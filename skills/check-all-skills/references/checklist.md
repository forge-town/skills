# Skill 检查清单

## 目录
1. [命名规范检查](#命名规范检查)
2. [SKILL.md 前言区检查](#skillmd-前言区检查)
3. [目录结构检查](#目录结构检查)
4. [文件清理检查](#文件清理检查)
5. [依赖元数据检查](#依赖元数据检查)
6. [README.md 记录检查](#readmemd-记录检查)
7. [报告格式](#报告格式)

---

## 命名规范检查

### 检查项 1: 目录名格式
- **通过标准**: 目录名仅使用小写字母、数字和连字符（-）
- **检查方式**: 查看目录名是否符合正则表达式 `^[a-z0-9]+(-[a-z0-9]+)*$`
- **错误示例**: `ExamGrading`, `pdf_parser`, `MySkill-1.0`
- **通过示例**: `exam-grading`, `pdf-parser`, `my-skill-1`
- **修复建议**: 重命名目录为符合规范的名称

### 检查项 2: 目录名后缀
- **通过标准**: 目录名不以 `-skill` 结尾
- **检查方式**: 检查目录名末尾是否包含 `-skill`
- **错误示例**: `exam-grading-skill`, `pdf-parser-skill`
- **通过示例**: `exam-grading`, `pdf-parser`
- **修复建议**: 移除目录名末尾的 `-skill` 后缀

### 检查项 3: 目录名最佳实践后缀
- **通过标准**: 目录名以 `-best-practice` 结尾（仅适用于最佳实践检查类 Skill）
- **检查方式**: 检查目录名末尾是否包含 `-best-practice`
- **错误示例**: `best-practice-checker`, `skill-quality`, `skill-validator`
- **通过示例**: `skill-best-practice`, `quality-best-practice`
- **修复建议**: 对于最佳实践检查类 Skill，添加 `-best-practice` 后缀
- **说明**: 此检查项仅适用于最佳实践检查类的 Skill，其他 Skill 可忽略

---

## SKILL.md 前言区检查

### 检查项 4: name 字段存在
- **通过标准**: SKILL.md 前言区包含 `name` 字段
- **检查方式**: 打开 SKILL.md，查看 YAML 前言区（`---` 之间）是否有 `name` 字段
- **错误示例**: 前言区缺少 `name` 字段
- **通过示例**: `name: my-skill`
- **修复建议**: 在前言区添加 `name` 字段

### 检查项 5: name 字段与目录名一致
- **通过标准**: 前言区 `name` 字段值与目录名完全一致
- **检查方式**: 对比 `name` 字段值和目录名
- **警告示例**: 目录名为 `exam-grading`，但 `name` 字段为 `exam-grading-skill`
- **通过示例**: 目录名和 `name` 字段均为 `exam-grading`
- **修复建议**: 修改 `name` 字段值使其与目录名一致

### 检查项 6: description 字段存在
- **通过标准**: SKILL.md 前言区包含 `description` 字段
- **检查方式**: 查看前言区是否有 `description` 字段
- **错误示例**: 前言区缺少 `description` 字段
- **通过示例**: `description: 自动批改考试答案，支持多种题型`
- **修复建议**: 在前言区添加 `description` 字段

### 检查项 7: description 单行格式
- **通过标准**: `description` 为单行文本（不含换行符）
- **检查方式**: 检查 `description` 值中是否包含 `\n` 换行符
- **错误示例**: `description: 自动批改考试答案\n支持多种题型`
- **通过示例**: `description: 自动批改考试答案，支持多种题型`
- **修复建议**: 将 `description` 改为单行文本

### 检查项 8: description 长度
- **通过标准**: `description` 长度在 100-150 字符之间
- **检查方式**: 统计 `description` 值的字符数（不含空格和标点建议单独统计）
- **警告示例**: 长度 < 100 或 > 150 字符
- **通过示例**: 长度为 125 字符
- **修复建议**: 补充或精简 `description` 内容，使其长度符合要求

---

## 目录结构检查

### 检查项 9: SKILL.md 存在
- **通过标准**: Skill 根目录包含 `SKILL.md` 文件
- **检查方式**: 查看 Skill 根目录下是否有 `SKILL.md`
- **错误示例**: 根目录缺少 `SKILL.md` 文件
- **通过示例**: 根目录包含 `SKILL.md` 文件
- **修复建议**: 创建 `SKILL.md` 文件

### 检查项 10: 固定结构目录
- **通过标准**: 根目录仅包含以下目录：`scripts/`、`references/`、`assets/`、`best-practice-examples/`、`bad-practice-examples/`
- **检查方式**: 列出根目录下所有文件和目录，确认无额外项
- **错误示例**: 包含 `README.md`、`LICENSE`、`test/` 等额外文件/目录
- **通过示例**: 仅包含 `SKILL.md` 和允许的子目录
- **修复建议**: 删除不符合规范的文件或目录

### 检查项 11: 空目录检查
- **通过标准**: 不存在空目录（不包含任何文件的目录）
- **检查方式**: 递归遍历所有子目录，检查是否为空
- **警告示例**: `scripts/` 目录为空（无任何脚本文件）
- **通过示例**: 所有目录都包含必要文件
- **修复建议**: 删除空目录或添加必要文件

---

## 文件清理检查

### 检查项 12: 临时文件清理
- **通过标准**: 不存在以下临时文件或目录：
  - `__pycache__/` （Python 缓存）
  - `*.pyc`、`*.pyo` （Python 字节码）
  - `.DS_Store` （macOS 系统文件）
  - `Thumbs.db` （Windows 缩略图）
  - `tmp/`、`temp/` （临时目录）
  - `.cache/` （缓存目录）
  - `.pytest_cache/` （pytest 缓存）
  - `*.log` （日志文件）
- **检查方式**: 遍历目录，查找上述模式
- **错误示例**: 包含 `__pycache__/` 或 `.DS_Store`
- **通过示例**: 不存在任何临时文件
- **修复建议**: 删除所有临时文件和缓存目录

### 检查项 13: 禁止 Python 脚本
- **通过标准**: 不存在任何 `.py` 文件
- **检查方式**: 遍历目录，查找 `.py` 后缀的文件
- **错误示例**: 包含 `scripts/run_test.py`
- **通过示例**: 所有脚本均为 Shell 或 Node.js 脚本
- **修复建议**: 删除 Python 脚本，使用 Shell 或 Node.js 重写

---

## 依赖元数据检查

## README.md 记录检查

### 检查项 16: README.md 文件存在
- **通过标准**: 项目根目录存在 `README.md` 文件
- **检查方式**: 检查项目根目录（`/workspace/projects/`）是否有 `README.md` 文件
- **错误示例**: 项目根目录缺少 `README.md` 文件
- **通过示例**: 项目根目录包含 `README.md` 文件
- **修复建议**: 创建 `README.md` 文件

### 检查项 17: skills/ 目录存在
- **通过标准**: 项目根目录存在 `skills/` 目录
- **检查方式**: 检查项目根目录（`/workspace/projects/`）是否有 `skills/` 目录
- **错误示例**: 项目根目录缺少 `skills/` 目录
- **通过示例**: 项目根目录包含 `skills/` 目录
- **修复建议**: 创建 `skills/` 目录

### 检查项 18: Skill 在 skills/ 目录中
- **通过标准**: Skill 目录位于 `skills/` 目录下
- **检查方式**: 检查 Skill 目录是否在 `/workspace/projects/skills/` 路径下
- **错误示例**: Skill 目录直接在根目录下，不在 `skills/` 中
- **通过示例**: Skill 在 `skills/` 目录下，如 `/workspace/projects/skills/check-all-skills/`
- **修复建议**: 将 Skill 目录移动到 `skills/` 目录下

### 检查项 19: Skill 已记录在 README.md
- **通过标准**: Skill 已在 README.md 的表格中正确记录
- **检查方式**: 
  1. 读取根目录的 `README.md` 文件
  2. 查找包含 Skills 的表格或章节（通常在"## Skills"或类似章节下）
  3. 验证表格中是否包含该 Skill 的记录
- **错误示例**: README.md 中缺少该 Skill 的记录
- **通过示例**: README.md 中存在类似 `| [check-all-skills](skills/check-all-skills/) | 批量检查Skill是否符合最佳实践规范 |` 的记录
- **修复建议**: 在 README.md 的 Skills 表格中添加该 Skill 的记录

### 检查项 20: README.md 记录格式正确
- **通过标准**: README.md 中的 Skill 记录格式正确
- **检查方式**: 检查记录是否包含：
  - Skill 名称链接（如 `[check-all-skills](skills/check-all-skills/)`，注意路径是 `skills/skill-name/`）
  - Skill 描述（通常在第二列）
- **错误示例**: 
  - 只有名称没有链接
  - 链接路径不正确（如 `check-all-skills/` 而不是 `skills/check-all-skills/`）
  - 格式不正确
- **通过示例**: 表格格式正确，包含正确的链接和描述
- **修复建议**: 修正 README.md 中的记录格式和路径

---

## 报告格式

### 检查报告模板
完成所有检查项后，生成结构化报告：

```json
{
  "skill_name": "my-skill",
  "skill_path": "/path/to/skill",
  "status": "pass|warning|error",
  "summary": "通过检查，但有 1 个警告",
  "stats": {
    "total": 20,
    "pass": 19,
    "warning": 1,
    "error": 0
  },
  "checks": [
    {
      "name": "naming_convention",
      "status": "pass",
      "message": "目录名 'my-skill' 符合命名规范",
      "fix_suggestion": ""
    },
    {
      "name": "front_matter_description",
      "status": "warning",
      "message": "description 长度为 80 字符，建议 100-150 字符",
      "fix_suggestion": "补充 description 内容，使其更详细"
    }
  ]
}
  "checks": [
    {
      "name": "naming_convention",
      "status": "pass",
      "message": "目录名 'my-skill' 符合命名规范",
      "fix_suggestion": ""
    },
    {
      "name": "front_matter_description",
      "status": "warning",
      "message": "description 长度为 80 字符，建议 100-150 字符",
      "fix_suggestion": "补充 description 内容，使其更详细"
    }
  ]
}
```

### 状态定义
- **pass**: 所有检查项通过
- **warning**: 无错误，但存在警告项
- **error**: 存在必须修复的错误项

---

## 快速检查表

打印此表用于快速勾选检查：

```
命名规范检查
☐ 目录名格式（小写字母+连字符）
☐ 目录名不以 -skill 结尾
☐ 最佳实践后缀（仅限检查类 Skill）

SKILL.md 前言区检查
☐ name 字段存在
☐ name 字段与目录名一致
☐ description 字段存在
☐ description 为单行格式
☐ description 长度 100-150 字符

目录结构检查
☐ SKILL.md 文件存在
☐ 固定结构目录（scripts/references/assets）
☐ 无空目录

文件清理检查
☐ 无临时文件和缓存

README.md 记录检查
☐ README.md 文件存在
☐ skills/ 目录存在
☐ Skill 在 skills/ 目录中
☐ Skill 已记录在 README.md
☐ README.md 记录格式正确
```
