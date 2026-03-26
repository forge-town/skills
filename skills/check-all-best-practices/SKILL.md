---
name: check-all-best-practices
description: Use when 需要对项目进行全量最佳实践检查——自动发现并依次执行所有以 best-practice 结尾的技能，输出汇总报告并强制执行标准化验证指令。触发词：检查所有技能、全量规范验证、批量最佳实践检查。
---

# 检查所有项目 (Check All Items)

## 使用说明

1. 自动扫描技能库，发现所有以 `best-practice` 结尾的技能
2. 对目标项目依次执行每个 best-practice 技能的检查
3. 完成后输出汇总报告；工作流细节见 [execution-workflow.md](references/execution-workflow.md)

**完成后强制步骤：** 执行 [after-hook-validation.md](references/after-hook-validation.md) 中的验证指令

*详细机制请参考：[自动发现机制指南](references/auto-discovery-guide.md)*
