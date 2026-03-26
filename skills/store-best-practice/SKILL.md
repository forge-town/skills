---
name: store-best-practice
description: Must follow when 使用 Zustand 创建或重构状态管理 Store，确保遵循 slice 模式、Provider 设置和类型安全规范。触发词：创建store、zustand规范、状态管理最佳实践、store设计审查。
---

# Store 最佳实践

## 使用说明

1. 阅读 [Store 最佳实践指南](references/store-best-practice-guide.md) 了解设计规则
2. 严格参照 [best-practice-examples/](best-practice-examples/) 中的代码结构生成代码
3. 完成后使用 [检查清单](references/checklist.md) 逐项验证

**重要：** 实现时必须严格遵循 `best-practice-examples` 中的结构；Store 只负责跨组件共享状态，组件私有状态用 `useState`
