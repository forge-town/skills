---
name: page-best-practice
description: Must follow when 创建或审查前端页面结构，确保遵循 Anatomy 规范，正确分离 Wrapper、Content 和 Optional Store 模块。
---

# 页面生成器 (Page Generator Skill)

## 使用说明

**首先询问用户选择生成模式：**
- **无监督模式**：AI 自动推导所有选项，全程无需人工干预
- **有监督模式**：每个关键决策点向用户确认

1. 参照 [ANATOMY.md](references/ANATOMY.md) 了解页面解剖结构规范
2. 阅读 [judgeHasStore.ts](references/judgeHasStore.ts) 和 [judgeUIComplexity.ts](references/judgeUIComplexity.ts) 了解决策逻辑
3. 严格参照 [best-practice-examples/](best-practice-examples/) 中的代码结构
4. 依次生成：Content → Wrapper → Index（若需 Store 则先触发 store-best-practice）

**模板文件：** [TEMPLATE_WRAPPER.md](references/TEMPLATE_WRAPPER.md)、[TEMPLATE_VIEW.md](references/TEMPLATE_VIEW.md)、[TEMPLATE_INDEX.md](references/TEMPLATE_INDEX.md)
