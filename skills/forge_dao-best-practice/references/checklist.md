# DAO 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、文件结构与导出

### 1.1 文件位置与命名
- [ ] ✅ DAO 位于 `packages/models/src/daos/<feature>Dao/`，聚合文件命名为 `<feature>.dao.ts`
  - ❌ 错误示例：`models/daos/catsDao.ts` 单文件承载全部查询 → 必须按实体目录组织
- [ ] ✅ 顶层导出格式为 `export const <feature>Dao = { ... }`，并导出 `type <Feature>Dao = typeof <feature>Dao`
  - ❌ 错误示例：在聚合文件中直接实现查询或导出 class
- [ ] ✅ DAO 聚合是 singleton，不导出 `create<Feature>Dao` 构造工厂
  - ❌ 错误示例：`export const createUsersDao = (db) => ({ ... })`
- [ ] ✅ 每个公开方法位于 `_operations/<operation>/`，实现与 `.operation.spec.ts` 共置
  - ❌ 错误示例：所有 `create`、`update`、`delete` 逻辑堆在 `<feature>.dao.ts`

### 1.2 类型定义（文件顶部）
- [ ] ✅ 使用 `typeof xxxTable.$inferSelect` 定义行类型
  - ❌ 错误示例：手写 `interface CatRow { id: string; name: string }` → 必须用 `$inferSelect` 自动派生
- [ ] ✅ 使用 `typeof xxxTable.$inferInsert` 定义插入类型
  - ❌ 错误示例：`Partial<CatRow>` 作为插入类型 → 必须用 `$inferInsert`
- [ ] ✅ 不使用 `any` 类型，不使用 Zod Schema 作为参数类型（DAO 层不引入业务校验）
  - ❌ 错误示例：`data: CatSchema`（Zod 推导类型）→ 必须改为 `data: NewCatRow`

---

## 二、导入规范

- [ ] ✅ 从 `@repo/db` 和 `@repo/db-schema` 导入数据库与表对象，避免跨包深层相对路径
  - ❌ 错误示例：在 DAO 中从页面或 Service 路径反向导入数据库
- [ ] ✅ 仅从 `drizzle-orm` 导入实际用到的函数（`eq`, `and`, `asc` 等），无多余导入
  - ❌ 错误示例：导入 `eq, and, or, desc, asc, sql, count` 但只用了 `eq` → 删除未使用的

---

## 三、方法命名与签名

- [ ] ✅ 查询单条：方法名使用 `getBy...` 或 `findBy...`，返回 `Promise<XxxRow | null>`
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

## 四、事务边界

- [ ] ✅ 仅在 Operation 需要参与跨表写入时接收可绑定的 Database/transaction 执行器；单表 DAO 不强制虚构 `WithTx` API
  - Repository 调用时必须把同一事务上下文传入所有相关 Operation
- [ ] ✅ DAO 不调用 `db.transaction()`；事务由 Repository 的 Operation 统一发起
  - ❌ 错误示例：DAO 内自行开启事务，或在多个 DAO 调用之间丢失同一 `tx`
- [ ] ✅ 普通 Operation 使用共享 `db`；事务 Operation 使用 workspace 导出的 `DatabaseTransaction`，不使用 `any` 或自定义重复类型

---

## 五、Bad Cases（以下情况不得出现）

- [ ] ❌ 不存在在 DAO 内使用 `try/catch` 的情况
  - 数据库错误（唯一约束冲突、连接失败等）应直接向上抛出，由 Service / Repository 处理
- [ ] ❌ 不存在在 DAO 内调用 `db.transaction()` 的情况
  - 事务由 Repository 的 Operation 发起；需要参与事务的 DAO 能力使用显式 `WithTx` Operation，而不是可选 `tx` 参数
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
  - **否（单表）** → 留在 DAO，按单表 Operation 验证
  - **是（跨表）** → 必须触发 `forge_repository-best-practice` 技能，创建 Repository 封装事务
