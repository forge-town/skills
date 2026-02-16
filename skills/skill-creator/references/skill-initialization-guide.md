# 技能初始化指南

此指南提供手动创建新技能的逐步说明，基于技能的标准化结构和最佳实践。

## 步骤 1: 确定技能名称

技能名称应遵循以下约定：
- 使用连字符大小写（kebab-case）：仅小写字母、数字和连字符
- 示例：`data-analyzer`、`pdf-processor`、`api-integration`
- 不能以连字符开头或结尾
- 不能包含连续连字符
- 最多 64 个字符
- **最佳实践类技能**：如果是为了检查代码规范或最佳实践，名称必须以 `-best-practice` 结尾（例如 `barrel-export-best-practice`）。

## 步骤 2: 创建技能目录结构

在适当的位置创建技能目录（例如 `skills/`）：

```
skills/
  your-skill-name/               # kebab-case 目录名
    SKILL.md                     # 必需：技能定义
    references/                  # 可选：参考资料 (推荐包含 checklist.md, check-report-template.md)
    best-practice-examples/      # 可选：最佳实践代码示例 (推荐用于 best-practice 类技能)
    bad-practice-examples/       # 可选：反面教材代码示例 (推荐用于 best-practice 类技能)
    scripts/                     # 可选：辅助脚本 (严禁使用 .py 文件)
    assets/                      # 可选：静态资源
```

## 步骤 3: 创建 SKILL.md 文件

使用以下模板创建 `SKILL.md` 文件：

```markdown
---
name: your-skill-name
description: [TODO: 完成并提供关于此技能做什么以及何时使用的信息性解释。包括何时使用此技能 - 具体场景、文件类型或触发任务。]
---

# Your Skill Title

## 概述

[TODO: 1-2 句话解释此技能启用什么]

## 核心原则 / 检查清单

[TODO: 对于 best-practice 类技能，在此列出核心原则或引用 references/checklist.md]

## 构建此技能

[TODO: 选择最适合此技能目的的结构。常见模式：

**1. 最佳实践检查类**（推荐用于代码规范检查）
- 结构：## 概述 → ## 核心原则 → ## 检查清单引用 → ## 示例对比
- 关键文件：references/checklist.md, references/check-report-template.md
- 示例目录：best-practice-examples/, bad-practice-examples/

**2. 基于工作流程**（最适合顺序过程）
- 当存在清晰的逐步程序时效果良好
- 示例：DOCX 技能使用"工作流程决策树" → "阅读" → "创建" → "编辑"
- 结构：## 概述 → ## 工作流程决策树 → ## 步骤 1 → ## 步骤 2...

**3. 基于任务**（最适合工具集合）
- 当技能提供不同操作/能力时效果良好
- 示例：PDF 技能使用"快速开始" → "合并 PDF" → "拆分 PDF" → "提取文本"
- 结构：## 概述 → ## 快速开始 → ## 任务类别 1 → ## 任务类别 2...

**4. 参考/指南**（最适合标准或规范）
- 适用于品牌指南、编码标准或要求
- 示例：品牌样式使用"品牌指南" → "颜色" → "排版" → "功能"
- 结构：## 概述 → ## 指南 → ## 规范 → ## 使用...

完成后删除整个"构建此技能"部分 - 这只是指导。]

## 资源

此技能包含演示如何组织不同类型捆绑资源的示例资源目录：

### references/
文档和参考资料，旨在根据需要加载到上下文中以告知 AI 的过程和思考。

**推荐文件：**
- `checklist.md`: 详细的检查项列表（适用于 best-practice 技能）
- `check-report-template.md`: 检查报告的标准格式模板
- API 文档、领域知识、公司政策等

### best-practice-examples/ & bad-practice-examples/
代码示例库。直接提供可运行的代码片段，帮助 AI 理解什么是“好”的代码，什么是“坏”的代码。
- `best-practice-examples/`: 存放符合规范的正确示例。
- `bad-practice-examples/`: 存放常见错误或反模式示例。

### scripts/
**注意：严禁使用 .py 文件。**
如果必须使用脚本，请使用 shell 脚本或其他项目允许的格式。脚本应仅用于辅助任务，核心逻辑应尽量通过 AI 阅读文档完成。
```
