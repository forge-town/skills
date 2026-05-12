---
name: writing-plans
description: Use when 需要将已批准的设计规格拆解为可执行实现计划，按最小任务粒度给出文件路径、完整代码、验证命令、依赖上下文和完成标准，便于低上下文执行者稳定落地实现。触发词：写计划、实现计划、任务拆解、plan、roadmap。
---

# 编写实现计划

把规格拆成"一口大小的任务"，假设执行者对代码库零上下文且品味存疑——把他们需要知道的一切（文件路径、完整代码、验证命令）都写进去。DRY、YAGNI、TDD、频繁提交。

## 使用说明

1. 启动时声明："我正在使用 writing-plans 技能来创建实现计划。"
2. 按 [流程](references/workflow.md) 完成范围检查、文件结构规划、任务结构编写、计划自审
3. 对照 [检查清单](references/checklist.md) 确认计划足够可执行
4. 计划保存到 `docs/plans/YYYY-MM-DD-<feature-name>.md`（用户偏好覆盖此默认路径）

## 输入前提

执行本技能前必须满足：
1. 已存在经过用户批准的设计文档
2. 范围已收敛，优先级已明确
3. 约束已明确（时间、兼容性、性能、安全、迁移风险）

若上述任一条件缺失，先回到 brainstorming 补齐。

## 与其他技能的关系

| 上游 | 当前 | 下游 |
|------|------|------|
| brainstorming | writing-plans | subagent-driven-development 或内联执行 |
