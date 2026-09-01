---
name: forge_check-props-drilling
description: Use when 需要检查代码中是否存在 Props Drilling（透传 Props）问题，识别那些本应从 Zustand Store 直接获取却通过多层组件传递的数据。触发词：检查 props 透传、props drilling、消除透传、检查组件依赖。
---

# 检查 Props Drilling

## 使用说明

1. 阅读 [Props Drilling 规范](references/standard.md)，了解什么是 Props Drilling 以及何时应该使用 Store
2. 对照 [检查清单](references/checklist.md) 逐项扫描目标组件
3. 对发现的问题提供重构建议：将透传数据改为从 Store 直接获取

**核心原则：** 数据应该从哪里使用就从哪里获取，避免为了传递给子组件而接收不必要的 props
