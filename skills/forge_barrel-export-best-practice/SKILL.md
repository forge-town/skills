---
name: forge_barrel-export-best-practice
description: Must follow when 编写或审查 index.ts/index.js 桶导出文件，确保所有导出遵循只做 re-export、无业务逻辑、命名导出等规范。
lastUpdated: 2026-09-01
---

# 桶导出最佳实践 (Barrel Export Best Practice)

## 使用说明

1. 阅读 [references/checklist.md](references/checklist.md) 获取完整检查清单（8 项规则）
2. 对照清单逐项验证目标目录下所有 `index.ts` / `index.js`
3. 参考 [references/standard.md](references/standard.md) 了解合规示例与反模式

**配合工具：** 需要自动检查/生成/修复时，使用 `forge_check-barrel-export` 技能执行操作
