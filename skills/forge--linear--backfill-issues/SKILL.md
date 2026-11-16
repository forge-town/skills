---
name: forge--linear--backfill-issues
description: Use when 用户要把当前 worktree 或本次 PR 的工作补录到 Linear；先查重，按投入时长计点、实际进度填状态，负责人设为 PR 开发者。
lastUpdated: 2026-11-16
---

# 补录 worktree 工作

读取实际改动，优先复用已有 Issue，再按实际投入、完成情况和 PR 开发者补录。已完成的工作直接填 Done，不将事后补录统一留在 Backlog 或 In Progress。

- 开始时读取 [执行流程](references/workflow.md)，核对 worktree/PR、匹配结果和开发者身份；补录授权包含更新点数、状态和负责人。
- 按 [实际时长规则](references/effort.md) 优先用实际计时；缺少计时时默认依据 Git 与会话回顾估算，不再询问估算授权。使用 [计点脚本](scripts/calculate-points.py) 逐 Issue 汇总、向上取整并写入原生 estimate，替换原计划估点。
- 整理新建正文或补录评论时读取 [记录格式](references/record-format.md)，保持输入、输出、证据和时间依据可核对。
- 按 [完成清单](references/checklist.md) 回读正文、点数、状态和负责人，报告新建、复用、重复及缺口。

理解、盘点或起草请求保持只读。仅更新本技能不自动改 Linear；补录也不授权提交代码、清理 worktree、部署或回填历史完成时间。
