---
name: forge_check-error-handling
description: Use when 需要检查代码中是否违规使用原生 try-catch，确保项目使用 neverthrow 进行函数式错误处理；扫描并报告所有原生异常处理代码。触发词：检查错误处理、neverthrow检查、错误处理规范检查、Result类型检查。
lastUpdated: 2026-09-01
---

# Check Error Handling 代码审查指南

## 使用说明

1. 阅读 `forge_error-handling-best-practice` 的 [规范说明](../forge_error-handling-best-practice/SKILL.md)
2. 扫描代码中所有**原生 try-catch** 结构（包装函数内部除外）
3. 标记违规使用，要求改为 `Result<T, E>` 或 `ResultAsync<T, E>`
4. 参考 [最佳实践示例](references/best-practice-examples/GoodExample.tsx) 了解 neverthrow 正确用法

**核心原则：** 禁止使用原生 try-catch，必须使用 neverthrow 的 Result 类型进行显式错误传递
