# DAO 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、文件结构与导出检查

### 1.1 文件位置与命名
- [ ] ✅ DAO 文件位于 `models/daos/` 目录下
  - ❌ 错误示例：`db/cats.ts` → 必须移动到 `models/daos/`
- [ ] ✅ 文件名格式为 `{feature}Dao.ts`（camelCase）
  - ❌ 错误示例：`cats-dao.ts`、`CatsDAO.ts` → 必须改为 `catsDao.ts`
- [ ] ✅ 顶层导出格式严格为 `export const {feature}Dao = { ... }`（对象形式）
  - ❌ 错误示例：`export function getCat(...)` → 必须改为对象内的方法

### 1.2 类型定义（本文件顶部）
- [ ] ✅ 使用 `type XxxRow = typeof xxxTable.$inferSelect` 定义行类型
  - ❌ 错误示例：手写 `interface CatRow { id: string; name: string }` → 必须用 `$inferSelect` 派生
- [ ] ✅ 使用 `type NewXxxRow = typeof xxxTable.$inferInsert` 定义插入类型
  - ❌ 错误示例：`Partial<CatRow>` 代替插入类型 → 必须用 `$inferInsert`
- [ ] ✅ 不使用 `any` 类型，不使用 Zod Schema 作为参数类型（DAO 层不引入 Zod）
  - ❌ 错误示例：`data: CatSchema` 使用 Zod → 必须改为 `data: NewCatRow`

---

## 二、导入规范检查

- [ ] ✅ 从 `@/db` 导入 `db` 和表对象（如 `import { db, cats } from "@/db"`）
  - ❌ 错误示例：直接从 `drizzle/node-postgres` 创建 db → 必须复用 `@/db`
- [ ] ✅ 仅从 `drizzle-orm` 导入实际用到的函数（`eq`, `and`, `asc` 等），无多余导入
  - ❌ 错误示例：导入 `eq, and, or, desc, asc, sql, count` 但只用了 `eq` → 删除未使用的

---

## 三、方法命名与签名检查

- [ ] ✅ 查询单条记录：方法名为 `getBy{Field}` 或 `get{Resource}By{Field}`，返回 `Promise<XxxRow | null>`（不存在返回 `null`，不抛出错误）
  - ❌ 错误示例：`findUser()` → 必须改为 `getByUserId()`；存在时返回、不存在时也返回同类型而非 undefined
- [ ] ✅ 查询多条记录：方法名为 `getAllBy{Field}` 或 `getMany{...}`，返回 `Promise<XxxRow[]>`（不存在返回空数组）
  - ❌ 错误示例：`listUsers()` 返回 `null` → 必须改为返回 `[]`
- [ ] ✅ 创建记录：`create(data: NewXxxRow): Promise<XxxRow>`，使用 `.returning()` 获取并返回结果
  - ❌ 错误示例：`create()` 返回 `void` → 必须返回插入后的行
- [ ] ✅ 更新记录：`update(id, data): Promise<XxxRow>`，使用 `.returning()` 返回更新后的行
  - ❌ 错误示例：`update()` 不调用 `.returning()` → 必须加 `.returning()`
- [ ] ✅ 删除记录：`delete(id1, id2): Promise<void>`，返回类型为 `void`
  - ❌ 错误示例：`delete()` 返回影响行数 `number` → 统一改为 `void`

---

## 四、事务支持检查

- [ ] ✅ 写方法（`create` / `update` / `delete`）：若有跨表事务场景，同时提供 `xxxWithTx` 变体，参数签名为 `(tx: Transaction, ...)`
  - ❌ 错误示例：只有普通 `update()`，无 `updateWithTx()` → 当 Service 需要事务时无法注入 tx
- [ ] ✅ `Transaction` 类型从 `drizzle-orm/node-postgres` 的 `NodePgDatabase<typeof schema>` 派生，不使用 `any`
  - ❌ 错误示例：`tx: any` → 必须改为 `tx: NodePgDatabase<typeof schema>`

---

## 五、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在 `parseRow()` / `mapRow()` 等手动 JSON 解析函数（JSON 列使用 `json().$type<T>()` 后无需解析）
- [ ] ❌ 不存在在 DAO 内部直接调用另一个 DAO 的情况（跨表操作属于 Repository 层）
- [ ] ❌ 不存在在 DAO 内调用 `db.transaction()` 的情况（事务由 Repository 或 Service 发起）
- [ ] ❌ 不存在 DAO 方法返回 Zod 校验后的类型的情况（DAO 只做数据库 I/O，不做业务校验）

---

## 六、⚠️ Repository 评估（强制后置步骤）

- [ ] ✅ 已评估：当前写方法是否涉及多张表同时写入？
  - **否（单表）** → 流程结束，确认写方法已提供 `WithTx` 变体即可
  - **是（跨表）** → 必须触发 `repository-best-practice` 技能，创建 Repository 封装事务