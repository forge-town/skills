---
name: forge_check-barrel-export
description: Use when 需要生成、优化、修复或检查项目中所有 index 文件（桶导出），确保 index.ts/index.js 均遵循标准桶导出规范。触发词：生成barrel导出、优化index文件、检查桶导出规范。
lastUpdated: 2026-09-01
---

# 桶导出操作工具

## 使用说明

1. 读取 `forge_barrel-export-best-practice` 技能中的 [规范标准](../forge_barrel-export-best-practice/references/standard.md) 和 [检查清单](../forge_barrel-export-best-practice/references/checklist.md)
2. 扫描目标目录（递归），找出所有 `index.ts` / `index.js` 文件
3. 根据场景执行操作：
   - **检查**：对照清单报告不合规项及修复建议
   - **生成/修复**：按规范自动生成或修正 `index.ts` 内容

**依赖规范：** 所有操作以 `forge_barrel-export-best-practice` 定义的 8 条规则为准

