---
name: zod-infer-type-best-practice
description: Must follow when 项目中存在 Zod schema 定义时，禁止另建 type.ts 文件重复声明类型；所有类型须直接用 z.infer 从 schema 派生，杜绝类型与 schema 不同步。触发词：类型文件、type.ts、zod类型、schema类型。
---

# Zod 派生类型最佳实践

## 前置条件

**必须先确认项目已安装 Zod**，若未安装则先执行：
```
pnpm add zod
```

## 使用说明

1. 阅读 [规范说明](references/standard.md) 了解核心原则与禁止行为
2. 对照 [检查清单](references/checklist.md) 逐项验证代码
3. 参考 [最佳实践示例](best-practice-examples/) 理解正确写法

**核心规则：** Zod schema 是唯一真实来源（Single Source of Truth），TypeScript 类型必须从 schema 派生，不得手写重复的 interface/type
