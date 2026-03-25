# DAO 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、文件结构与导出

### 1.1 文件位置与命名
- [ ] ✅ DAO 文件位于 `models/daos/` 目录下
  - ❌ 错误示例：`db/cats.ts` → 必须移动到 `models/daos/`
- [ ] ✅ 文件名格式为 `{feature}Dao.ts`（camelCase）
  - ❌ 错误示例：`cats-dao.ts`、`CatsDAO.ts`、`cats.ts` → 必须改为 `catsDao.ts`
- [ ] ✅ 顶层导出格式严格为 `export const {feature}Dao = { ... }`（对象形式）
  - ❌ 错误示例：`export function getCat(...)` → 必须改为对象内的方法

### 1.2 类型定义（文件顶部）
- [ ] ✅ 使用 `type XxxRow = typeof xxxTable.$inferSelect` 定义行类型
  - ❌ 错误示例：手写 `interface CatRow { id: string; name: string }` → 必须用 `$inferSelect` 自动派生
- [ ] ✅ 使用 `type NewXxxRow = typeof xxxTable.$inferInsert` 定义插入类型
  - ❌ 错误示例：`Partial<CatRow>` 作为插入类型 → 必须用 `$inferInsert`
- [ ] ✅ 不使用 `any` 类型，不使用 Zod Schema 作为参数类型（DAO 层不引入业务校验）
  - ❌ 错误示例：`data: CatSchema`（Zod 推导类型）→ 必须改为 `data: NewCatRow`

---

## 二、导入规范

- [ ] ✅ 从 `@/db` 导入 `db` 和表对象（路径别名，不用相对路径）
  - ❌ 错误示例：`import { db } from "../../index"` → 必须改为 `import { db } from "@/db"`
- [ ] ✅ 仅从 `drizzle-orm` 导入实际用到的函数（`eq`, `and`, `asc` 等），无多余导入
  - ❌ 错误示例：导入 `eq, and, or, desc, asc, sql, count` 但只用了 `eq` → 删除未使用的

---

## 三、方法命名与签名

- [ ] ✅ 查询单条：方法名为 `findBy{Field}` 或 `find{Resource}By{Field}`，返回 `Promise<XxxRow | null>`
  - 不存在返回 `null`，不抛出错误，使用 `.limit(1)` + `result[0] ?? null`
  - ℹ `find` 前缀语义：返回可能为 null，调用方必须处理空值；与 Drizzle 自身 API（`findMany`/`findFirst`）保持一致
  - ❌ 错误示例：`getUser()` → 必须改为 `findByUserId()`
  - ❌ 错误示例：`result[0] || null`（`||` 会把 falsy 值如 `0` 也视为 null）→ 改用 `?? null`
- [ ] ✅ 查询多条：方法名为 `findMany` 或 `findManyBy{Field}`，返回 `Promise<XxxRow[]>`
  - 不存在返回 `[]`，不返回 `null`
  - ❌ 错误示例：`listUsers()` 返回 `null` → 必须返回 `[]`
- [ ] ✅ 创建：`create(data: NewXxxRow): Promise<XxxRow>`，使用 `.returning()` 返回插入后的行
  - ❌ 错误示例：`create()` 返回 `void` → 必须返回插入后的行
  - ℹ 官方文档：PostgreSQL / SQLite 支持 `.returning()`
- [ ] ✅ 更新：`update(id, data): Promise<XxxRow | null>`，使用 `.returning()` 返回更新后的行
  - 行不存在时 `.returning()` 返回 `[]`，须用 `result[0] ?? null`
  - ❌ 错误示例：`update()` 不调用 `.returning()` → 必须加 `.returning()`
  - ❌ 错误示例：返回类型写 `Promise<XxxRow>`（而非 `| null`）且直接取 `result[0]` → 行不存在时静默返回 `undefined`
- [ ] ✅ 删除：`delete(id): Promise<void>`，返回类型为 `void`
  - ❌ 错误示例：`delete()` 返回影响行数 `number` → 统一改为 `void`

---

## 四、Transaction 类型与 WithTx 变体

- [ ] ✅ 写方法（`create` / `update` / `delete`）**必须同时提供** `xxxWithTx` 变体
  - 即使当前无跨表场景也必须提供，保证上层可在需要时注入事务而无需改 DAO
  - ❌ 错误示例：只有 `update()`，无 `updateWithTx()` → 上层事务无法注入
  - ⚠️ **例外情形**：由外部库（如 better-auth）完全托管的表（如 `users`），若满足以下**全部条件**，可豁免 `WithTx` 变体：
    1. 该表的写入操作**仅由外部库内部完成**，项目代码不直接写入
    2. 整个项目中**不存在**任何需要将该表写入纳入自定义事务的场景
    3. 团队已明确记录豁免决策（在 DAO 文件顶部注释说明）
  - 若 DAG 的 Service 层存在任何自定义写入（如 `updateProfile`），则**不满足例外条件**，必须提供 `WithTx` 变体
- [ ] ✅ `WithTx` 变体的 executor 参数类型使用 `DbExecutor` 联合类型，同时覆盖 db 实例与事务对象：
  ```
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type DbExecutor = NodePgDatabase<any> | PgTransaction<any, any, any>;
  ```
  需从 `drizzle-orm/node-postgres` 导入 `NodePgDatabase`，从 `drizzle-orm/pg-core` 导入 `PgTransaction`
  - ⚠️ **命名强制规范**：类型名称必须统一为 `DbExecutor`，**不得**添加特征前缀（如 `UsersDbExecutor`、`CatsDbExecutor`）。每个 DAO 文件各自声明同名类型，内容完全一致，保证项目内类型名称统一
  - ❌ 错误示例：`tx: any` → 类型不安全，IDE 无法补全
  - ❌ 错误示例：`tx: NodePgDatabase<typeof schema>` → 只覆盖 db 实例，不能接收 `PgTransaction`，事务场景会有 TS 报错
  - ❌ 错误示例：`type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]` → 只覆盖事务对象，无法在非事务场景复用（可读性差）
  - ❌ 错误示例：`export type UsersDbExecutor = ...` → 带前缀命名破坏全局统一性，禁止使用

---

## 五、Bad Cases（以下情况不得出现）

- [ ] ❌ 不存在在 DAO 内使用 `try/catch` 的情况
  - 数据库错误（唯一约束冲突、连接失败等）应直接向上抛出，由 Service / Repository 处理
- [ ] ❌ 不存在在 DAO 内调用 `db.transaction()` 的情况
  - 事务由 Repository 或 Service 发起，DAO 只提供 `WithTx` 变体
- [ ] ❌ 不存在 DAO 内部直接调用另一个 DAO 的情况
  - 跨表操作属于 Repository 层
- [ ] ❌ 不存在 DAO 方法做业务校验（Zod 等）后返回的情况
  - DAO 只做数据库 I/O，不做业务校验
- [ ] ❌ 不存在 `parseRow()` / `mapRow()` 等手动 JSON 解析函数
  - JSON 列使用 `json().$type<T>()` 后 Drizzle 自动处理，无需解析
- [ ] ❌ 不存在在客户端组件（`'use client'`）中导入 DAO 的情况
  - DAO 是服务端数据层，严禁在浏览器环境运行

---

## 六、⚠️ Repository 评估（强制后置步骤）

- [ ] ✅ 已评估：当前写方法是否涉及多张表同时写入？
  - **否（单表）** → 流程结束，确认写方法已提供 `WithTx` 变体即可
  - **是（跨表）** → 必须触发 `repository-best-practice` 技能，创建 Repository 封装事务
