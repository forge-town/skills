---
name: forge_service-best-practice
description: Must follow when 创建或重构 Service 层，基于 tRPC + Service + DAO 架构确保依赖注入、错误处理和业务逻辑分层符合规范。
---

# Service 最佳实践

## 使用说明

1. 阅读 [Service 最佳实践指南](references/forge_service-best-practice-guide.md) 了解完整规范与代码示例
2. 完成后使用 [检查清单](references/checklist.md) 逐项验证

**重要：** Service 不得直接导入 `db`，必须通过 DAO 依赖注入；完成后强制对照检查清单
