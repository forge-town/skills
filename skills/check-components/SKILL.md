---
name: check-components
description: Use when 需要扫描并验证 React 组件文件夹是否符合 component-unit-best-practice 规范，包括文件夹结构、单元测试和 Storybook 故事文件的完整性检查。触发词：检查组件规范、组件文件夹审查、check components、组件结构扫描。
---

# 组件规范检查工具

## 使用说明

1. 读取 [component-unit-best-practice 规范](../component-unit-best-practice/references/standard.md) 及 [检查清单](../component-unit-best-practice/references/checklist.md)
2. 递归扫描目标目录（默认 `src/components/`），找出所有组件文件夹
3. 对每个组件文件夹执行逐项检查，标注违规项及修复建议
4. 汇总输出报告，列出通过/警告/错误统计

**依赖规范：** 所有检查以 `component-unit-best-practice` 定义的规则为准
