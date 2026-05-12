---
name: use-store-not-props-best-practice
description: Must follow when 设计组件数据流——优先通过 Store 访问全局状态，不得通过 Props 层层传递；适用于代码审查和新功能设计阶段。
---

# 使用 Store 而非 Props 最佳实践

## 使用说明

1. 检查组件是否通过 props 接收了 store 中已有的数据
2. 确认所需数据在全局 store 中可用后，重构组件直接从 store 获取，移除无需透传的 props
3. 完成后使用 [检查清单](references/checklist.md) 逐项验证

**重要：** 完成后强制对照 [检查清单](references/checklist.md)，所有项目必须通过
