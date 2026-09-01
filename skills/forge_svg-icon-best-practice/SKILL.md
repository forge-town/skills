---
name: forge_svg-icon-best-practice
description: Must follow when 管理或新增 React TypeScript 项目中的 SVG 图标组件，确保命名、封装方式和导出规范遵循项目标准规范。
lastUpdated: 2026-09-01
---

# SVG 图标管理规范

## 使用说明

1. 参照 [best-practice-examples/](best-practice-examples/) 中的代码结构（图标组件与业务组件示例）
2. 按 [icon-component-template.md](references/icon-component-template.md) 封装 SVG 为独立 `.tsx` 组件
3. 迁移内联 SVG 时参考 [migration-checklist.md](references/migration-checklist.md)
4. 完成后使用 [checklist.md](references/checklist.md) 逐项验证

**规范：** 所有 SVG 存放于 `src/components/icons/`，文件名 PascalCase；详细最佳实践见 [best-practice-examples.md](references/best-practice-examples.md)
