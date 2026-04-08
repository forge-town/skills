---
name: check-zod-infer-type
description: Use when 需要检查项目中是否存在违规的 types.ts/type.ts 文件，或检查是否有手写类型与 Zod schema 重复定义，确保所有类型都从 Zod schema 派生。触发词：检查类型文件、检查types目录、zod类型检查、type.ts检查。
---

# 检查 Zod 派生类型规范

## 使用说明

1. 阅读 `zod-infer-type-best-practice` 的 [规范说明](../zod-infer-type-best-practice/references/standard.md) 了解核心原则
2. 扫描目标目录，查找所有违规文件和目录
3. 对照 [检查清单](references/checklist.md) 逐项确认
4. 生成违规报告，提供修复建议

**核心规则：** 禁止任何 `type.ts`/`types.ts` 文件和 `types/` 目录，所有类型必须从 Zod schema 派生
