---
name: forge_repository-best-practice
description: Must follow when 创建或重构 Repository 层，确保数据访问模式、方法命名、返回类型和接口定义符合项目规范。
---

# Repository 最佳实践

## 使用说明

1. 阅读 [最佳实践指南](references/forge_repository-best-practice-guide.md) 了解架构定位与设计规则
2. 参考 [代码模板](references/template-repository.ts) 了解标准写法
3. 完成后使用 [检查清单](references/checklist.md) 逐项验证

**重要：** Repository 只负责跨表事务性写入，不构建业务视图；多表写入必须包裹在同一个 `db.transaction()` 中
