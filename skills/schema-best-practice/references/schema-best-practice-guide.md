# Schema 最佳实践指南

## 一、为什么不用传统 DTO？

项目采用 **Zod Schema** 作为前后端共享的数据结构定义工具，替代传统 DTO 类。

Zod Schema 兼具：
- **类型定义**：通过 `z.infer<>` 自动推导 TypeScript 类型
- **运行时验证**：请求参数校验（`.parse()` / `.safeParse()`）
- **前后端契约**：避免字段不一致，共享同一 Schema 定义

---

## 二、两种核心 Schema 类型

### 2.1 表结构 Schema（Table-level Schema）—— 可选

> ⚠️ **DAO 层不需要 Zod Schema**：DAO 直接使用 Drizzle 生成的 `$inferInsert` / `$inferSelect` 类型，无需额外定义 Zod Schema。
>
> `{TableName}Schema` 仅在 Service 层需要以 Zod 显式校验单张表数据时按需使用。

描述单张数据库表字段，对应物理存储，不含业务聚合字段。

示例：[examples/BattleSchema.ts](examples/BattleSchema.ts)

### 2.2 业务视图 Schema（Business View Schema）

描述前端/API 所需的聚合数据结构，由 Service 层组装，本质是 DTO 替代品。

示例：[examples/BattleWithStatsSchema.ts](examples/BattleWithStatsSchema.ts)

**特点：**
- 可融合多张表字段
- 仅在 Service 层组装，不在 Repository 中构建
- 供 Controller 层序列化返回

### 2.3 输入 Schema（Input Schema）

描述写操作的输入结构，供 Repository 层使用。

示例：[examples/CreateFreeBattleInputSchema.ts](examples/CreateFreeBattleInputSchema.ts)

---

## 三、Schema 在各层的流转

各层流转路径：[examples/LayerFlow.txt](examples/LayerFlow.txt)

---

## 四、Repository 与 Schema 的协同关系

| 层级 | 关注点 | Schema / 类型 |
|------|--------|------------|
| DAO | 物理存储 | Drizzle `$inferInsert` / `$inferSelect`（非 Zod） |
| Repository | 写对（事务正确性） | Input Schema（Zod） |
| Service | 读好（数据完整性） | Business View Schema（Zod） |

**核心原则：**
- Repository 的输出 ≠ 最终视图：只返回 `{ id: number }`，不构建包含关联数据的完整视图
- 完整视图由 Service 构建：调用多个 DAO 后组装 Business View Schema

---

## 五、Service 组装示例

完整示例：[examples/ServiceCreateExample.ts](examples/ServiceCreateExample.ts)

---

## 六、命名约定

| Schema 类型 | 命名格式 | 示例 |
|-------------|---------|------|
| 表结构 | `{TableName}Schema` | `BattleSchema` |
| 业务视图 | `{Feature}With{Aggregation}Schema` | `BattleWithStatsSchema` |
| 写操作输入 | `{Action}{Feature}InputSchema` | `CreateFreeBattleInputSchema` |

**文件命名：** Schema 文件名即 Schema 名，PascalCase，**一个文件只导出一个 Schema 及其对应类型**。

示例：`BattleSchema.ts` 只导出 `BattleSchema` 和 `Battle` 类型，`CreateFreeBattleInputSchema.ts` 只导出 `CreateFreeBattleInputSchema` 和 `CreateFreeBattleInput` 类型

---

## 七、常见错误

| 错误 | 说明 |
|------|------|
| 在 Repository 中构建业务视图 Schema | 职责混乱，违反只写原则 |
| 使用 `any` 代替 `z.infer<>` 类型 | 类型安全缺失 |
| 表结构 Schema 包含聚合字段 | 违反表结构贴近物理存储的原则 |
| 不用 Schema 直接用手写 interface | 丧失运行时校验能力，前后端契约无法保证 |
| Business View Schema 放在 DAO 层 | 应在 Service 层组装视图 |
