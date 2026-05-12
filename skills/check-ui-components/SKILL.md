---
name: check-ui-components
description: Use when 需要检查代码中是否违规使用原生 HTML 元素（如 button、input、select 等），确保符合组件库规范，优先使用组件库组件而非原生元素。触发词：检查 UI 组件、检查原生元素、ui 组件规范检查。
---

# 检查 UI 组件规范

## 使用说明

1. 读取 [ui-components-best-practice 规范](../ui-components-best-practice/references/standard.md)
2. 对照 [检查清单](references/checklist.md) 逐项扫描目标代码
3. 标记所有违规使用的原生元素，输出报告

**核心判断标准：** 标准 UI 交互元素必须使用组件库组件，禁止直接使用原生 HTML 元素
