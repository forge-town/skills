---
name: check-all-components-design
description: Use when 需要全面检查项目中所有 React 组件的设计质量，扫描并报告 God Component、配置驱动、业务耦合等反模式，确保符合设计规范。触发词：检查组件设计、扫描组件质量、组件设计审查。
---

# 检查所有组件设计

## 使用说明

1. 读取 [component-design-best-practice 规范](../component-design-best-practice/references/standard.md)
2. 扫描目标目录（默认 `src/components/` 和 `src/features/`）
3. 对照 [检查清单](references/checklist.md) 逐项检查每个组件
4. 汇总输出报告，标注违规项及重构建议

**检查范围：**
- UI 组件（`components/ui/`）- 检查是否符合原子化、可组合
- 业务组件（`features/*/components/`）- 检查是否专注单一职责
- 共享组件（`components/shared/`）- 检查是否正确使用组合

**核心原则：** 自动识别反模式，提供可执行的重构建议
