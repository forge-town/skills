---
name: forge_refine-trpc-best-practice
description: Must follow when 在 React 组件中进行数据获取，确保通过 Refine hooks（useList/useOne 等）经由 DataProvider 访问数据，禁止直接调用 trpc 客户端。
lastUpdated: 2026-09-01
---

# Refine + tRPC 数据访问规范

## 使用说明

1. 阅读 [references/checklist.md](references/checklist.md) 获取完整禁止/允许清单
2. 参考 [references/pattern.md](references/pattern.md) 了解正确的数据访问模式
3. 违规代码需迁移至 `DataProvider`，通过 Refine hooks 使用

**配合工具：** 使用 `forge_check-refine-trpc` 技能自动扫描组件中的违规调用
