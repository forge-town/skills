---
name: forge_check-svg
description: Use when 需要扫描或检查项目中 SVG 图标的使用情况，发现并报告不符合规范的写法，包括命名、路径和组件化问题；适用于代码审查阶段。触发词：检查svg规范、图标规范检查、SVG使用审查、SVG图标优化。
---

# SVG 组件检查

## 使用说明

1. 扫描组件文件，用正则 `<svg[^>]*>[\s\S]*?<\/svg>` 检测内联 `<svg>` 标签
2. 发现违规时，将内联 SVG 提取为 `IconName.tsx`（PascalCase），放入 `components/icons/`，原处改为 `import` + `<IconName />`
3. 迁移时将 `width/height/fill/className` 等属性改为 props

**规范：** 禁止在业务组件中内联 `<svg>`；所有图标必须封装为独立组件并通过 import 使用

**参考：** 具体迁移流程见 [forge_svg-icon-best-practice](../forge_svg-icon-best-practice/SKILL.md)
