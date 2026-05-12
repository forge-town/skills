---
name: error-handling-best-practice
description: Must follow when 编写错误处理代码，必须使用 neverthrow 库进行函数式错误处理，禁止使用原生 try-catch。确保错误显式传递、类型安全、调用方强制处理错误。
---

# 错误处理规范 (Error Handling Best Practice)

## 使用说明

1. 阅读 [references/checklist.md](references/checklist.md) 获取完整检查清单
2. 参考 [best-practice-examples/errorHandlingExamples.ts](best-practice-examples/errorHandlingExamples.ts) 了解 neverthrow 正确用法

**核心规则：** 使用 `neverthrow` 的 `Result<T, E>` 类型替代原生 try-catch，错误必须显式传递，禁止静默捕获
