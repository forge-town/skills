---
name: check-barrel-export
description: Use when 需要生成、优化、修复或检查项目中所有 index 文件（桶导出），确保 index.ts/index.js 均遵循标准桶导出规范。触发词：生成barrel导出、优化index文件、检查桶导出规范。
---

# 桶导出操作工具

## 使用说明

根据场景选择操作：

- **生成/优化/修复** `index.ts`：扫描目标目录，按桶导出规范生成或修正导出
- **检查并报告**：扫描目录，列出不符合规范的 index 文件及修复建议

**核心原则：** 所有 `index.ts` / `index.js` 必须遵循桶导出规范，只做 re-export，不包含业务逻辑
