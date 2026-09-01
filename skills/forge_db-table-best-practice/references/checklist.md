# 数据库与数据表命名规范检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、数据表表名检查（SQL 层）

### 1.1 字符规范
- [ ] ✅ 表名全部使用**小写字母**（严禁大写：`User` → 必须改为 `users`）
- [ ] ✅ 语义段之间用**下划线（_）**分隔（严禁驼峰：`orderDetails` → 必须改为 `order_details`）
- [ ] ✅ 严禁使用**短横杠（-）**作为分隔符（`user-profiles` → 必须改为 `user_profiles`）

### 1.2 结构规范
- [ ] ✅ 最后一个名词必须为**英文复数**形式（`user` → 必须改为 `users`；`child` → `children`）
- [ ] ✅ 结构遵循「限定词 + 名词（复数）」（如 `system_logs`、`order_items`、`user_profiles`）
- [ ] ✅ 长度控制在 2-4 个语义段（`user_order_shipping_receive_addresses` → 太长，需简化）

### 1.3 Bad Case 确认（以下情况不得出现）
- [ ] ❌ 不存在以单数命名的表（`user`、`log`、`item` 等）
- [ ] ❌ 不存在无意义后缀（`_data`、`_info`、`_tbl`、`_table`、`_list` 缀于末尾）
  - ⚠ 此规则针对 **SQL 表名**（`pgTable()` 第一参数）；
  - TypeScript 文件名的 `_table.ts` 后缀是独立的文件命名规范，不受此限制
- [ ] ❌ 不存在无意义缩写（`usr_mgr`、`sys_log` → 必须改为 `user_managers`、`system_logs`）

---

## 二、Drizzle 文件命名检查

> ⚠️ `_table.ts` 是 TypeScript **文件类型标记后缀**，不是 SQL 表名的一部分。一、1.3 中禁止 SQL 表名带 `_table` 后缀的规则**不适用于此处的文件命名**。

### 2.1 文件名规范
- [ ] ✅ 文件名格式严格为 `{sql_tablename}_table.ts`（如 `users_table.ts`、`order_items_table.ts`）
- [ ] ✅ 文件名全部小写+下划线，严禁驼峰（`userTable.ts` → 必须改为 `users_table.ts`）
- [ ] ✅ 文件名中的表名 = SQL 层选定的表名（不允许映射偏差）

### 2.2 文件内容与文件名的一致性
- [ ] ✅ `pgTable("sql_tablename", ...)` 的第一个参数 = 文件名去掉 `_table.ts` 的部分
  - 正确示例：`users_table.ts` → `pgTable("users", ...)`
  - 错误示例：`users_table.ts` → `pgTable("user", ...)` ❌
- [ ] ✅ 导出的 TypeScript 变量名格式为 `{sqlTableName}Table`（camelCase + `Table` 后缀）
  - 正确示例：`export const usersTable = pgTable("users", ...)`
  - 正确示例：`export const accountsTable = pgTable("accounts", ...)`
  - 错误示例：`export const users = pgTable("users", ...)` ❌（缺少 `Table` 后缀）
  - 错误示例：`export const user = pgTable("users", ...)` ❌（单数且缺后缀）

---

## 三、Drizzle 列字段命名检查

### 3.1 列命名（SQL 层）
- [ ] ✅ 列名全部使用 **snake_case**（如 `created_at`、`user_id`、`email_verified`）
- [ ] ✅ 严禁在 SQL 列名中使用驼峰（`createdAt` → 必须改为 `created_at`）

### 3.2 TypeScript 属性名（ORM 层）
- [ ] ✅ 在 `pgTable()` 中，TypeScript 属性键名使用 camelCase，SQL 列名字符串使用 snake_case，两侧均需显式声明
  - 示例：`createdAt: timestamp("created_at")` —— TS 键 `createdAt`，SQL 列 `"created_at"`
  - Drizzle 将在查询结果中使用 camelCase 属性名返回，应用层无需额外的字段映射函数
- [ ] ✅ 不得在 `pgTable()` 定义中手写驼峰列名（`text("createdAt")` → 必须改为 `text("created_at")`）

---

## 四、注释与类型推断

- [ ] ✅ `pgTable()` 导出常量有 JSDoc，说明该表保存的业务实体。
- [ ] ✅ 每个字段属性都有 JSDoc，说明字段语义、可空性或默认值；不要依赖列名猜含义。
- [ ] ✅ 查询与插入类型由 Drizzle 推断：`typeof usersTable.$inferSelect` 与 `typeof usersTable.$inferInsert`。
- [ ] ❌ 不得为表行手写重复的 `interface`，也不得用 `any` 替代 `$inferSelect` / `$inferInsert`。

---

## 五、数据库命名检查（适用时）
- [ ] ✅ 数据库名全小写，下划线分隔，2-4 语义段（如 `mewpaw_prod`、`user_service`）
- [ ] ❌ 不存在驼峰、大写、短横杠形式（`UserCenter` → 必须改为 `user_center`）
