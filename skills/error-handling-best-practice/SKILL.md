---
name: error-handling-best-practice
description: Must follow when 编写包含 try-catch 的错误处理代码，确保 catch 块有实质处理逻辑，不为空、不仅记录日志、必须处理或重新抛出异常。触发词：try-catch规范、错误处理最佳实践、异常处理审查。
---

# 错误处理规范 (Error Handling Best Practice)

## 使用说明

1. 阅读 [references/checklist.md](references/checklist.md) 获取完整检查清单（6 项规则）
2. 参考 [references/patterns.md](references/patterns.md) 了解正确与错误示例

**配合工具：** 使用 `check-try-catch` 技能自动扫描代码中的不规范错误处理
