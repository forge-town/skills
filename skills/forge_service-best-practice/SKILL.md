---
name: forge_service-best-practice
description: Must follow when 创建或重构 Service 层，基于 tRPC + Service + DAO 架构确保依赖注入、错误处理和业务逻辑分层符合规范。
lastUpdated: 2026-09-01
---

# Service 最佳实践

## 使用说明

1. 阅读 [Service 最佳实践指南](references/service-best-practice-guide.md) 了解完整规范与代码示例
2. 完成后使用 [检查清单](references/checklist.md) 逐项验证

**重要：** Service 实现入口是 PascalCase singleton（如 `CratesService`）；不得使用 `create*Service` 工厂或连接注入，DAO/Repository 与环境依赖下沉到 helpers
