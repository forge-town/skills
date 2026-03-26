---
name: check-try-catch
description: Use when 需要扫描代码中 try-catch 的使用情况，识别不规范的错误处理模式，确保异常处理符合项目规范；适用于代码审查阶段。触发词：检查try-catch写法、错误处理规范检查、异常捕获审查。
---

# Check Try-Catch 代码审查指南

## 使用说明

1. 扫描代码中所有 `try-catch` / `try-except` 结构
2. 识别以下违规模式（详细示例与修复策略见 [references/patterns.md](references/patterns.md)）：
   - 空 catch 块（错误被完全忽略）
   - catch 块中只有 `console.log`（错误被记录但未处理）
3. 对每个违规点提供修复建议

**适用语言：** JavaScript/TypeScript 和 Python
