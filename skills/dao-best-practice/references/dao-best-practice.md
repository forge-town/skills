# DAO 编写最佳实践指南

> 基于 Drizzle ORM 官方文档：
> [Select](https://orm.drizzle.team/docs/select) · [Insert](https://orm.drizzle.team/docs/insert) · [Update](https://orm.drizzle.team/docs/update) · [Delete](https://orm.drizzle.team/docs/delete) · [Joins](https://orm.drizzle.team/docs/joins) · [Transactions](https://orm.drizzle.team/docs/transactions)

---

## 一、文件结构与命名

- 每个 DAO 文件位于 `models/daos/` 下
- 文件名格式为 `{feature}Dao.ts`（camelCase），如 `usersDao.ts` 对应 `users` 表
  - ❌ 错误：`users.ts`、`cats-dao.ts`、`CatsDAO.ts`
- 顶层导出为对象形式：`export const {feature}Dao = { ... }`
  - ❌ 错误：`export function getUser(...)`，禁止散落的函数导出

---

## 二、类型定义（文件顶部）

Drizzle 会从表定义自动推导完整类型，**无需手写 interface**：

```ts
// ✅ 正确：从表定义派生，始终与 schema 保持同步
type UserRow = typeof usersTable.$inferSelect;
type NewUserRow = typeof usersTable.$inferInsert;
```

- ❌ 错误：手写 `interface UserRow { id: string; name: string }`
- ❌ 错误：`Partial<UserRow>` 作为插入类型，应用 `$inferInsert`
- ❌ 错误：用 Zod Schema 作为 DAO 方法参数类型（DAO 是纯数据库 I/O 层）
- ❌ 错误：使用 `any` 类型

---

## 三、导入规范

```ts
// ✅ 只导入实际用到的函数
import { eq, and, count } from "drizzle-orm";
import { db } from "@/db";
import { usersTable } from "@/models/tables";
```

- ❌ 错误：导入 `eq, and, or, desc, asc, sql, count, sum` 但只用了 `eq`
- ❌ 错误：使用相对路径 `../../index`，应使用路径别名 `@/db`

---

## 四、Transaction 类型

Drizzle 的 `db.transaction(async (tx) => {...})` 回调中，`tx` 的实际类型是 `PgTransaction<...>`，**不是** `NodePgDatabase<...>`。

正确做法是从 `db` 自动推导，无需手写泛型参数：

```ts
// ✅ 正确：自动推导，不依赖具体 driver 类型
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
```

- ❌ 错误：`tx: any`
- ❌ 错误：`tx: NodePgDatabase<typeof schema>`（这是 `db` 本身的类型，赋给 tx 参数会导致 TS 报错）

---

## 五、方法命名规范

| 场景 | 方法名模式 | 返回类型 |
|---|---|---|
| 查询单条（按字段） | `findBy{Field}` 或 `find{Resource}By{Field}` | `Promise<XxxRow \| null>` |
| 查询多条 | `findMany` 或 `findManyBy{Field}` | `Promise<XxxRow[]>` |
| 创建 | `create` | `Promise<XxxRow>` |
| 更新 | `update` | `Promise<XxxRow \| null>` |
| 删除 | `delete` | `Promise<void>` |
| 事务变体 | `createWithTx` / `updateWithTx` / `deleteWithTx` | 同上 |

**查询：**
- 单条不存在 → 返回 `null`，不抛出错误
- 多条不存在 → 返回 `[]`，不返回 `null`

**写入：**
- 必须使用 `.returning()` 获取插入/更新后的行
  - 官方文档：insert `.returning()` / update `.returning()`（PostgreSQL & SQLite 支持）
- `update` 使用 `.returning()` 后若行不存在，返回空数组，应 `result[0] ?? null`
- ❌ 错误：`update()` 返回 `Promise<XxxRow>` 且直接取 `result[0]`（行不存在时静默返回 `undefined`）
- `delete` 返回 `Promise<void>`，不返回影响行数

---

## 六、WithTx 变体（事务注入）

写方法（`create` / `update` / `delete`）**必须同时提供** `xxxWithTx` 变体：

```ts
async create(data: NewUserRow): Promise<UserRow> {
  const result = await db.insert(usersTable).values(data).returning();
  return result[0];
},

async createWithTx(tx: Transaction, data: NewUserRow): Promise<UserRow> {
  const result = await tx.insert(usersTable).values(data).returning();
  return result[0];
},
```

- 即使当前没有跨表场景，WithTx 变体也必须提供
- DAO 内部**不调用** `db.transaction()`，事务由 Repository 或 Service 发起
- DAO 内调用另一个 DAO 是禁止的，跨表操作属于 Repository 层

---

## 七、查询写法参考（官方文档对应）

### 7.1 单条查询（select + limit(1)）

Drizzle 官方没有内置 `findOne`，标准做法是 `.select().from().where().limit(1)`：

```ts
async findById(id: string): Promise<UserRow | null> {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  return result[0] ?? null;
}
```

### 7.2 多条查询（带过滤）

```ts
async findManyByStatus(status: string): Promise<UserRow[]> {
  return db
    .select()
    .from(usersTable)
    .where(eq(usersTable.status, status));
}
```

### 7.3 条件动态过滤

`whereClause` 必须显式注明类型，否则 TS 将推导为 `undefined` 导致后续赋值报错：

```ts
import type { SQL } from "drizzle-orm";

async findManyByConditions(conditions: {
  status?: string;
  role?: string;
}): Promise<UserRow[]> {
  let whereClause: SQL<unknown> | undefined = undefined;

  if (conditions.status) {
    whereClause = eq(usersTable.status, conditions.status);
  }
  if (conditions.role) {
    const cond = eq(usersTable.role, conditions.role);
    whereClause = whereClause ? and(whereClause, cond) : cond;
  }

  return db.select().from(usersTable).where(whereClause);
}
```

### 7.4 分页

```ts
async findManyPaged(page: number, pageSize: number): Promise<UserRow[]> {
  return db
    .select()
    .from(usersTable)
    .orderBy(asc(usersTable.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}
```

### 7.5 部分字段查询（Partial select）

Drizzle 的类型推导在 partial select 时完全正确：

```ts
async findManyIdAndName(): Promise<{ id: string; name: string }[]> {
  return db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable);
}
```

### 7.6 联表查询（Left Join / Inner Join）

```ts
// leftJoin：右侧表数据可能为 null，Drizzle 会自动推导
async findByIdWithProfile(id: string) {
  const result = await db
    .select()
    .from(usersTable)
    .leftJoin(profilesTable, eq(usersTable.id, profilesTable.userId))
    .where(eq(usersTable.id, id))
    .limit(1);
  return result[0] ?? null;
  // 返回类型：{ usersTable: UserRow; profilesTable: ProfileRow | null } | null
}
```

若只需部分字段（避免大量 nullable 列），使用嵌套选择：

```ts
async findByIdWithProfile(id: string) {
  const result = await db
    .select({
      user: usersTable,
      profile: {
        bio: profilesTable.bio,
        avatar: profilesTable.avatar,
      },
    })
    .from(usersTable)
    .leftJoin(profilesTable, eq(usersTable.id, profilesTable.userId))
    .where(eq(usersTable.id, id))
    .limit(1);
  return result[0] ?? null;
}
```

### 7.7 创建（Insert + Returning）

```ts
async create(data: NewUserRow): Promise<UserRow> {
  const result = await db.insert(usersTable).values(data).returning();
  return result[0];
}
```

### 7.8 更新（Update + Returning）

`.returning()` 行不存在时返回空数组，须用 `?? null`：

```ts
async update(id: string, data: Partial<NewUserRow>): Promise<UserRow | null> {
  const result = await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id))
    .returning();
  return result[0] ?? null;
}
```

### 7.9 删除（Delete）

```ts
async delete(id: string): Promise<void> {
  await db.delete(usersTable).where(eq(usersTable.id, id));
}
```

### 7.10 聚合查询

```ts
import { count, avg } from "drizzle-orm";

async getStats(): Promise<{ total: number }> {
  const result = await db
    .select({ total: count(usersTable.id) })
    .from(usersTable);
  return result[0];
}
```

---

## 八、禁止事项（Bad Cases）

- ❌ 禁止在 DAO 内使用 `try/catch`：数据库错误向上抛出，由 Service / Repository 处理
- ❌ 禁止在 DAO 内调用 `db.transaction()`：事务由上层发起
- ❌ 禁止 DAO 内部调用另一个 DAO：跨表操作属于 Repository 层
- ❌ 禁止在 DAO 方法中做业务校验（Zod 等）：DAO 只做数据库 I/O
- ❌ 禁止手写 `parseRow()` / `mapRow()`：JSON 列使用 `json().$type<T>()` 后无需解析
- ❌ 禁止在客户端组件（`'use client'`）中导入 DAO：DAO 是服务端数据层




