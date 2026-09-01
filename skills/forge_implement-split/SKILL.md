---
name: forge_implement-split
description: Use when 需要将大型组件或模块按最佳实践拆分为多个独立文件，系统性地执行代码拆分与重构，确保拆分后各模块结构符合规范。触发词：拆分组件、实现文件拆分、代码模块拆分重构、component-split。
---

# implementSplit

## 使用说明

1. 读取 forge_generate-preview 生成的预览文档（`.temp.json` 和 `.temp.md`）
2. 参照 [forge_use-store-not-props-best-practice](../forge_use-store-not-props-best-practice/SKILL.md)：分析数据流，识别可从 store 获取的数据
3. 创建子组件文件，确保每个子组件直接从 store 获取所需数据
4. 更新主组件，移除透传的 props
5. 生成 `index.ts` 导出文件

**重要：** 数据优先从 Zustand store 获取，避免 props 透传；每个子组件职责单一
