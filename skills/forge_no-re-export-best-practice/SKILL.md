---
name: forge_no-re-export-best-practice
description: Must follow when 审查或编写非 index 文件中的 import/export，禁止在非桶导出文件中对外部模块做 re-export（间接转发），每个消费文件应直接从来源 import。
---

# 禁止非 index 文件中的 Re-Export 最佳实践

## 使用说明

1. 阅读 [references/checklist.md](references/checklist.md) 获取完整检查清单（5 项规则）
2. 参考 [references/standard.md](references/standard.md) 了解核心原则与合规示例
3. 对照清单逐项扫描项目中所有**非 index 文件**（`index.ts` / `index.js` 除外）

**适用范围：** 仅检查非桶导出文件；`index.ts` 的桶导出行为由 `forge_barrel-export-best-practice` 管理
