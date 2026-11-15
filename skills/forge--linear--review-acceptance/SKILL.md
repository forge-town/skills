---
name: forge--linear--review-acceptance
description: Use when 用户要求复核 Linear Issue 的验收证据、执行 reviewer 验收或回评；按原验收条件独立复测，留下输入输出与结论，按实际复核身份和授权流转状态。
lastUpdated: 2026-11-15
---

# 复核 Linear 验收

以原 Task/AC 为准，独立判断真实结果是否满足约定，并保留复核证据。提交人自验通过不等于 reviewer 已通过。

- 开始前读取 [执行流程](references/workflow.md)，核对目标、复核身份及权限。
- 判定前读取 [证据与结论规则](references/assessment.md)，逐项复测并处理缺失、失败和版本变化。
- 组织交付时读取 [复核评论模板](references/comment-template.md)，记录本次实际结果。
- 结束时按 [完成清单](references/checklist.md) 回读核对，区分本地报告、已回评和已关闭。

仅检查或起草时保持只读；执行复核不包含代为修复、部署、修改原验收标准或冒充指定的人类 reviewer。
