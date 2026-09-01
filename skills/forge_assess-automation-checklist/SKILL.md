---
name: forge_assess-automation-checklist
description: Use when 需要评估现有 checklist 的脚本化可能性，分析哪些检查项可通过代码自动化，哪些必须依赖 LLM 判断，输出明确的脚本化设计方案和实现指南。触发词：规划检查脚本、评估脚本化、设计自动化检查、checklist转脚本。
lastUpdated: 2026-09-01
---

# Assess Automation Checklist

## 使用说明

1. 读取目标 checklist 文件（如 `forge_dao-best-practice/references/checklist.md`）
2. 按 [工作流](references/workflow.md) 逐项分析、分类（可脚本化 / 需 LLM / 混合）、输出设计方案
3. 对照 [检查清单](references/checklist.md) 确认评估覆盖所有条目

**核心原则：** 只出方案不写代码，明确区分机器 vs 人类职责边界
