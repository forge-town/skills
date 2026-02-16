# 技能库文档完整性检查报告模板

## 1. JSON 格式报告（推荐）
适用于程序化处理和集成。

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

## 2. Markdown 格式报告
适用于人工阅读和文档记录。

### 报告头部

```markdown
## 📋 技能库文档完整性检查报告

**检查时间**: 2025-02-10 10:42:00
**检查对象**: 项目根目录 README.md 和 skills/ 目录
**检查结果**: ❌ 发现问题
```

### 目录结构说明

```
README.md                 # 项目根目录下的 README 文件
skills/                    # 技能目录
├── barrel-export         # 技能子目录 1
├── check-all-items       # 技能子目录 2
├── xxx1-best-practice    # 技能子目录 3
├── xxx2-best-practice    # 技能子目录 4
└── xxx3-best-practice    # 技能子目录 5
```

### 检查结果概览

```markdown
### 1. 实际存在的技能目录
共 5 个技能：
- barrel-export
- check-all-items
- xxx1-best-practice
- xxx2-best-practice
- xxx3-best-practice

### 2. README.md 中记录的技能
共 2 个技能：
- barrel-export
- check-all-items
```

### 详细对比结果

#### ❌ 遗漏的技能
以下技能在 `skills/` 目录中存在，但没有在 README.md 表格中被记录：

```markdown
| [xxx1-best-practice](skills/xxx1-best-practice) | xxx1最佳实践检查工具 |
| [xxx2-best-practice](skills/xxx2-best-practice) | xxx2最佳实践检查工具 |
| [xxx3-best-practice](skills/xxx3-best-practice) | xxx3最佳实践检查工具 |
```

#### ✅ 冗余的技能
无。

## 3. 简化版报告模板

### 模板 1：发现问题

```markdown
### 技能库文档完整性检查

**遗漏的技能**（3个）：
- [xxx1-best-practice](skills/xxx1-best-practice)
- [xxx2-best-practice](skills/xxx2-best-practice)
- [xxx3-best-practice](skills/xxx3-best-practice)

**冗余的技能**（0个）：无
```

### 模板 2：通过检查

```markdown
### 技能库文档完整性检查

✅ **检查通过**

所有 5 个技能都已正确记录在 README.md 中。
```

## 状态定义
- **pass**: 所有检查项通过
- **warning**: 无错误，但存在警告项
- **error**: 存在必须修复的错误项
