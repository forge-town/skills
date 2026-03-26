---
name: dao-best-practice
description: Must follow when 创建或重构 DAO 文件，确保遵循 Drizzle ORM 最佳实践（文件结构、方法命名、类型安全、性能优化）。触发词：dao规范、DAO最佳实践、创建DAO文件、审查DAO代码。
---

# DAO规范化技能

## 使用说明

1. 阅读 [DAO最佳实践指南](references/dao-best-practice.md) 了解规范
2. 参考 [代码模板](references/template-dao.ts)
3. 使用 [检查清单](references/checklist.md) 验证

## ⚠️ 强制后置步骤：Repository 评估

每次完成 DAO 写方法创建或修改后，强制评估：**写操作是否涉及多张表？**

- **否（单表）** → 流程结束，确保方法签名含可选 `tx` 参数即可
- **是（跨表）** → **必须触发 `repository-best-practice` 技能**，为该写操作创建 Repository

此评估不可跳过
