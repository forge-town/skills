# 技能初始化指南

此指南提供手动创建新技能的逐步说明，基于技能的标准化结构和最佳实践。

## 步骤 1: 确定技能名称

技能名称应遵循以下约定：
- 使用 `forge_` namespace，后缀采用 kebab-case：`forge_` 后仅允许小写字母、数字和连字符
- 示例：`forge_data-analyzer`、`forge_pdf-processor`、`forge_api-integration`
- 不能以连字符开头或结尾
- 不能包含连续连字符
- 最多 64 个字符

### 步骤 1.2: 确定技能分类

根据技能名称判断所属分类，并读取对应规范文件后再继续：

| 判断条件 | 分类 | 需读取的规范 |
|---------|------|-----------|
| 名称以 `-best-practice` 结尾（如 `forge_dao-best-practice`） | **best-practice** | `references/best-practice/checklist-guide.md` |
| 无特定后缀 | **普通技能** | 无额外规范 |

> **新增分类时**：在 `references/` 下创建对应目录，编写该分类的规范文件，并在此表格中添加新行。

#### best-practice 分类规范

创建名称以 `-best-practice` 结尾的技能时，必须先阅读：

- **Checklist 写法规范**：见 `references/best-practice/checklist-guide.md`
  - 何时读取：创建或修改 `references/checklist.md` 前
  - 内容：checklist 文件结构模板、内容质量要求（唯一映射原则）、SKILL.md 引用格式、AI 执行要求

## 步骤 2: 创建技能目录结构

在适当的位置创建技能目录（例如 `skills/forge_public/` 或 `skills/forge_private/`），包含以下组件（按需选择）：

- `SKILL.md`（**必需**）：YAML 前言（`name`+`description`）+ Markdown 主体。`name` 必须与 `forge_` 目录名一致，主体仅触发后加载。
- `scripts/`（可选）：确定性可重复执行的脚本，可在不加载到上下文的情况下运行
- `references/`（可选）：按需加载的文档、模板。信息只在一处维护——避免与 SKILL.md 内容重叠

完整结构规范见 `references/anatomy.json`。

## 步骤 3: 创建 SKILL.md 文件

使用以下模板创建 `SKILL.md` 文件：

```markdown
---
name: forge_your-skill-name
description: [TODO: 完成并提供关于此技能做什么以及何时使用的信息性解释。包括何时使用此技能 - 具体场景、文件类型或触发任务。]
---

# Your Skill Title

## 概述

[TODO: 1-2 句话解释此技能启用什么]

## 构建此技能

[TODO: 选择最适合此技能目的的结构。常见模式：

**1. 基于工作流程**（最适合顺序过程）
- 当存在清晰的逐步程序时效果良好
- 示例：DOCX 技能使用"工作流程决策树" → "阅读" → "创建" → "编辑"
- 结构：## 概述 → ## 工作流程决策树 → ## 步骤 1 → ## 步骤 2...

**2. 基于任务**（最适合工具集合）
- 当技能提供不同操作/能力时效果良好
- 示例：PDF 技能使用"快速开始" → "合并 PDF" → "拆分 PDF" → "提取文本"
- 结构：## 概述 → ## 快速开始 → ## 任务类别 1 → ## 任务类别 2...

**3. 参考/指南**（最适合标准或规范）
- 适用于品牌指南、编码标准或要求
- 示例：品牌样式使用"品牌指南" → "颜色" → "排版" → "功能"
- 结构：## 概述 → ## 指南 → ## 规范 → ## 使用...

**4. 基于能力**（最适合集成系统）
- 当技能提供多个相互关联的功能时效果良好
- 示例：产品管理使用"核心能力" → 编号能力列表
- 结构：## 概述 → ## 核心能力 → ### 1. 功能 → ### 2. 功能...

模式可以根据需要混合搭配。大多数技能结合模式（例如，从基于任务开始，为复杂操作添加工作流程）。

完成后删除整个"构建此技能"部分 - 这只是指导。]

## [TODO: 根据选择的结构替换为第一个主要部分]

[TODO: 在此处添加内容。请参阅现有技能中的示例：
- 技术技能的代码示例
- 复杂工作流程的决策树
- 具有现实用户请求的具体示例
- 根据需要引用脚本/模板/参考资料]
```

## 步骤 4: 创建可选资源目录

如果技能需要脚本或参考资料，创建相应的目录：

### 创建 scripts/ 目录
创建 `scripts/` 目录并添加脚本文件。

### 创建 references/ 目录
创建 `references/` 目录并添加文档文件。SKILL.md 主体保持 500 行以内；超出时将内容拆到 references 文件，并在 SKILL.md 中明确引用。

**常见组织模式：**

**模式 1：按领域/变体组织**（适合多领域或多框架技能）
```
skill/
├── SKILL.md（工作流程 + 路由）
└── references/
    ├── finance.md
    ├── sales.md
    └── product.md
```
用户选择领域/框架时，AI 只读对应文件。

**模式 2：带参考链接的高级指南**（适合功能丰富的技能）
```markdown
## 高级功能
- **表单填写**：见 [FORMS.md](references/FORMS.md)
- **API 参考**：见 [API.md](references/API.md)
```

**模式 3：条件细节**（适合大多数技能）
```markdown
**对于跟踪更改**：见 [REDLINING.md](references/REDLINING.md)
```

所有 references 文件保持一级深度（直接从 SKILL.md 链接）；超过 100 行的文件在顶部加目录。

## 步骤 5: 自定义和完善

1. 编辑 `SKILL.md` 以完成所有 TODO 项目
2. 更新描述以准确反映技能的功能
3. 自定义或删除示例资源文件
4. 检查技能结构（参见 `checklist.md`）

> 禁止创建 README.md、INSTALLATION_GUIDE.md、QUICK_REFERENCE.md、CHANGELOG.md 等辅助文档——技能只应包含 AI 完成任务所需的文件。

## 后续步骤

- 运行验证以检查技能结构
- 测试技能是否按预期工作
- 根据需要添加更多资源或脚本
