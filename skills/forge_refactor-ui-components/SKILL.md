---
name: forge_refactor-ui-components
description: Use when 需要将代码中的原生 HTML 元素（如 button、input、select 等）自动重构为项目组件库组件，确保符合组件库规范并保持功能不变。触发词：重构 UI 组件、替换原生元素、迁移到组件库。
---

# 重构 UI 组件

## 使用说明

1. 读取 [forge_ui-components-best-practice 规范](../forge_ui-components-best-practice/references/standard.md)
2. 扫描目标文件，识别所有需要替换的原生元素
3. 按照 [重构清单](references/checklist.md) 逐项执行替换
4. 确保导入语句正确添加，Props 正确映射

**核心原则：** 替换时保持原有功能不变，Props 一一对应映射
