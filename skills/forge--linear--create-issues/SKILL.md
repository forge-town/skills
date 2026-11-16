---
name: forge--linear--create-issues
description: Use when 用户要求创建、补充或重写 Linear Issue；先核对已有事项，按统一最佳实践填写表单 JSON，由同一生成器输出原生属性与正文，获授权后写入并回读。
lastUpdated: 2026-11-16
---

# 创建 Linear Issue

最佳实践规定字段和写法，AI 填表单，生成器映射 Linear。不得先自由写正文再声称符合表单，不手工追加章节或另一套格式。

1. 开始前读 [执行工作流](references/workflow.md)，核对真实项目、已有事项和授权，并按 [模块负责人](references/module-ownership.md) 填写原生 Assignee。
2. 起草标题时读 [标题与正文来源](references/issue-template.md)，正文必须来自统一字段契约及表单生成器。
3. 生成前读 [Task 写法](references/task-writing.md)、[验收写法](references/acceptance-criteria.md) 和 [语言模式](references/language-modes.md)，按相同表单填写。
4. 视频及独立验证材料遵守 [产物规范](references/artifact-output.md) 和 [HTML 视频](references/html-video.md) 的适用要求；它们使用表单生成的业务文案，不能反过来覆盖正文。
5. 写入前用 scripts/assemble-issue.mjs 生成，再用 scripts/validate-issue-body.mjs --form 核对正文未被改写；写入后按 [完成清单](references/checklist.md) 回读核验。

仅理解、起草或展示表单不授权修改 Linear。真实产品验收、提交评审、排期和 worktree 补录仍由对应技能负责。
