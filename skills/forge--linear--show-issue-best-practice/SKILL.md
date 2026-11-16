---
name: forge--linear--show-issue-best-practice
description: Use when 用户要查看开发 Issue 怎么写；区分 Feature 与 Bugfix，展示字段映射与可逐步照做的验收写法，包括必要前提、固定数据、具体操作和预期结果。
lastUpdated: 2026-11-16
---

# 查看 Issue 写作最佳实践

摘要在 Feature 和 Bugfix 中都保留，填写做什么／从哪开始／怎样算完成，不作为多余章节删除。

标题只写 Linear 标题栏，项目、负责人、状态、优先级、估点写右侧 Properties；正文从摘要开始，不重复标题或基本信息。表单保留这些输入，统一生成原生字段和正文。模块只匹配团队已有标签或自定义属性；编号、原链接用于定位，类型用于匹配团队分类，不能伪造不存在的原生字段。未知值不清空已有属性。

任务与案例以“前提条件／操作／预期结果”呈现，案例关联对应任务。具体输入与预期写清，不设置执行元信息或完成条件章。

人物在正文中统一使用斜体：Linear Markdown 用标准星号标记，HTML 用原生斜体；不输出 HTML 标签到 Linear，标题与原生属性保持纯文本。

1. 阅读 [写作最佳实践](references/standard.md)，先区分 Feature／Bugfix，再展示对应写法；验收须读取 [可照做要求](references/executable-acceptance.md)。
2. 需要字段或映射细节时读取 [统一字段定义](references/issue-contract.json)，需要实例时展示 [Feature 示例](best-practice-examples/example.md) 或 [Bugfix 示例](best-practice-examples/bugfix-example.md)。
3. Feature 示范任务与验收案例；Bugfix 示范复现、实际／预期对照、任务与验收案例；打开界面用 `forge--linear--show-issue-form`，审查正文用 `forge--linear--review-issue`。
4. 按 [完成清单](references/checklist.md) 核对；展示写法不自动改动 Linear。
