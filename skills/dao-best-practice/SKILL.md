---
name: dao-best-practice
description: 用于规范化DAO文件，确保遵循Drizzle ORM最佳实践，包括文件结构、方法命名、类型安全和性能优化。当需要重构或创建DAO文件以符合项目标准时使用。完成后强制评估是否需要创建对应的 Repository 层以封装跨表事务。
---

# DAO规范化技能

此技能帮助规范化DAO文件，使其符合项目的最佳实践。

## 使用说明

1. 识别需要规范化的DAO文件，通常位于 `models/daos/`。

2. 阅读参考指南：[DAO最佳实践指南](references/dao-best-practice.md) 以了解规范。
3. 代码示例：[DAO代码参考](references/template-dao.ts) 作为参考。
4. 使用[检查清单](references/checklist.md)验证文件是否符合规范。

5. 重构文件以匹配指南中的模式。

**重要：** 调用完毕技能后，强制查看[检查清单](references/checklist.md)，并确保返回的内容完全匹配清单中的所有项目。

## ⚠️ 强制后置步骤：Repository 评估

**每次完成 DAO 写方法的创建或修改后，必须立即执行以下评估：**

> "当前 DAO 的写操作是否涉及多张表？"

- **否（单表写入）** → 流程结束，确保 DAO 方法签名包含可选 `tx` 参数即可
- **是（跨表写入）** → **必须触发 `repository-best-practice` 技能**，为该写操作创建对应的 Repository

此评估不可跳过，漏掉 Repository 会导致跨表写入缺乏原子性保证。

## 核心规范

- 文件结构：文件名与表名一致，导出为对象。
- 方法：使用驼峰命名，标准CRUD方法。
- 类型安全：使用Drizzle类型推断。
- 性能：使用分页、联表查询等。

如果需要更多细节，请阅读参考文件。
