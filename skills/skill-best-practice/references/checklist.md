# Skill 检查清单

## 目录
1. [命名规范检查](#命名规范检查)
2. [SKILL.md 前言区检查](#skillmd-前言区检查)
3. [目录结构检查](#目录结构检查)
4. [文件清理检查](#文件清理检查)
5. [依赖元数据检查](#依赖元数据检查)
6. [报告格式](#报告格式)

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
- **通过标准**: 根目录仅包含以下目录：`scripts/`、`references/`、`assets/`
- **检查方式**: 列出根目录下所有文件和目录，确认无额外项
- **错误示例**: 包含 `README.md`、`LICENSE`、`test/` 等额外文件/目录
- **通过示例**: 仅包含 `SKILL.md` 和三个固定子目录
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

---

## 依赖元数据检查

### 检查项 13: dependency.python 格式
- **通过标准**（如果存在）: `dependency.python` 为列表，每个元素符合 requirement.txt 格式
- **检查方式**: 检查 `dependency.python` 是否为列表，每个元素是否符合 `package==1.0.0` 或 `package>=1.0.0` 格式
- **错误示例**: `dependency: pip install package` （不在 python 字段中）
- **通过示例**:
  ```yaml
  dependency:
    python:
      - PyYAML>=5.1
      - pandas>=1.3.0
  ```
- **修复建议**: 将依赖项改为列表格式，使用正确的版本号表示法

### 检查项 14: dependency.system 格式
- **通过标准**（如果存在）: `dependency.system` 为列表，不包含 Python 包安装命令
- **检查方式**: 检查 `dependency.system` 是否为列表，是否包含 `pip install`、`pip3 install`、`python -m pip` 等命令
- **错误示例**: `dependency.system: ["pip install requests"]`
- **通过示例**:
  ```yaml
  dependency:
    system:
      - mkdir -p output/results
      - chmod +x scripts/*.sh
  ```
- **修复建议**: 移除 pip install 命令，Python 依赖应在 `dependency.python` 字段中声明

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
    "total": 14,
    "pass": 13,
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
☐ 目录名以 -best-practice 结尾（仅适用于最佳实践检查类 Skill）

SKILL.md 前言区检查
☐ name 字段存在
☐ name 字段与目录名一致
☐ description 字段存在
☐ description 单行格式
☐ description 长度 100-150 字符

目录结构检查
☐ SKILL.md 存在
☐ 仅包含固定结构目录
☐ 无空目录

文件清理检查
☐ 无临时文件（__pycache__、.DS_Store 等）

依赖元数据检查
☐ dependency.python 格式正确（如存在）
☐ dependency.system 无 pip 命令（如存在）
```
