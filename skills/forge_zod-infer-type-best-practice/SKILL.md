---
name: forge_zod-infer-type-best-practice
description: Must follow when 项目中存在 Zod Schema 定义时，禁止重复声明可推导的业务类型；可推导类型使用 z.infer，跨层 contract 保持独立职责。
lastUpdated: 2026-09-01
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

**核心规则：** 对可由 Zod Schema 表达的运行时数据，Schema 是唯一真实来源；TypeScript 类型使用 `z.infer` 派生，不得手写重复字段
