---
name: forge_repository-best-practice
description: Must follow when 创建或重构 Repository 层，确保数据访问模式、方法命名、返回类型和接口定义符合项目规范。
lastUpdated: 2026-09-01
---

# Repository 最佳实践

## 使用说明

1. 阅读 [最佳实践指南](references/repository-best-practice-guide.md) 了解架构定位与设计规则
2. 参考 [代码模板](references/template-repository.ts) 了解标准写法
3. 完成后使用 [检查清单](references/checklist.md) 逐项验证

**重要：** Repository 入口使用 PascalCase singleton；跨表写入必须由 Operation 包裹在同一个 `db.transaction()` 中，数据库依赖下沉到 Operation/helpers
