---
name: db-table-best-practice
description: Must follow when 创建或审查 Drizzle ORM 数据库表定义，确保表名、列名、索引和关系配置均遵循项目命名规范与表结构规范。
---

# 数据库与数据表表名规范验证最佳实践

## 使用说明

1. 阅读 [检查清单](references/checklist.md) 了解所有命名规范规则
2. 参照 [best-practice-examples/](best-practice-examples/) 中的合规示例
3. 验证目标文件中数据库名、表名、列字段命名是否符合规范
4. 自动修正不规范的命名（默认行为：直接修改文件）

**规范摘要：** 数据库名全小写+下划线分隔；表名复数形式+snake_case；TS 层使用 camelCase 通过 Drizzle 自动映射
