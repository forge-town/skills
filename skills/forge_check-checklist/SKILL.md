---
name: forge_check-checklist
description: Use when 需要验证 checklist.md 文件是否符合 forge_checklist-best-practice 规范，包括可判定性、示例完整性、分类结构和 Bad Case 节审查。触发词：检查checklist规范、checklist审查、验证清单质量。
lastUpdated: 2026-09-01
---

# Checklist 规范检查工具

## 使用说明

1. 读取 [forge_checklist-best-practice 规范](../forge_checklist-best-practice/references/standard.md) 和 [检查清单](../forge_checklist-best-practice/references/checklist.md)
2. 扫描目标目录，找出所有 `checklist.md` 文件
3. 对每个文件逐项检查：可判定性、示例、分类结构、Bad Case 节
4. 汇总输出报告，列出违规项及修复建议

**依赖规范：** 所有检查以 `forge_checklist-best-practice` 定义的规则为准
