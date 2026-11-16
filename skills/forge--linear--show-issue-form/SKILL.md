---
name: forge--linear--show-issue-form
description: Use when 用户要打开开发 Issue 表单；同页切换 Feature 与 Bugfix，从 Header 查看 Todo List 与类幸存者完整示例，提供任务与验收案例的填写、校验和正文映射。
lastUpdated: 2026-11-16
---

# 打开 Issue 需求表单

标题只写 Linear 标题栏，项目、负责人、状态、优先级、估点写右侧 Properties；正文从摘要开始，不重复标题或基本信息。表单保留这些输入，统一生成原生字段和正文。模块只匹配团队已有标签或自定义属性；编号、原链接用于定位，类型用于匹配团队分类，不能伪造不存在的原生字段。未知值不清空已有属性。

任务和验收案例沿用 Given／When／Then 的组织方式，但界面与正文只显示“前提条件／操作／预期结果”。任务直接描述通用业务行为，不再另设业务规则；案例通过 taskRef 关联任务。删除用户流程章，目标预期章下直接写内容，不重复字段标签。案例不设执行元信息，正文不生成完成条件章。

1. 阅读 [打开与交付流程](references/workflow.md)，使用 [打开脚本](scripts/show-issue-form.ts) 唤起一个前端入口，在固定页头切换 Feature／Bugfix。
2. Feature 和 Bugfix 都保留摘要三项：做什么／从哪开始／怎样算完成；填写、预览与生成正文一致。默认 Feature，可指定或切换 Bugfix；按已提供材料预填时保留未知项，不编造案例参数与项目事实。
3. Header 提供两个完整 Feature 示例与可操作原型；页面提供字段气泡、任务和案例校验、正文映射和 JSON／Markdown；优先让用户看到实际界面。
4. 按 [完成清单](references/checklist.md) 验证；此技能不自动创建或更新 Linear Issue。
