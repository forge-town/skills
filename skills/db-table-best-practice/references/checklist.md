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
- [ ] ❌ 不存在无意义缩写（`usr_mgr`、`sys_log` → 必须改为 `user_managers`、`system_logs`）

---

## 二、Drizzle 文件命名检查

### 2.1 文件名规范
- [ ] ✅ 文件名格式严格为 `{sql_tablename}_table.ts`（如 `users_table.ts`、`order_items_table.ts`）
- [ ] ✅ 文件名全部小写+下划线，严禁驼峰（`userTable.ts` → 必须改为 `users_table.ts`）
- [ ] ✅ 文件名中的表名 = SQL 层选定的表名（不允许映射偏差）

### 2.2 文件内容与文件名的一致性
- [ ] ✅ `pgTable("sql_tablename", ...)` 的第一个参数 = 文件名去掉 `_table.ts` 的部分
  - 正确示例：`users_table.ts` → `pgTable("users", ...)`
  - 错误示例：`users_table.ts` → `pgTable("user", ...)` ❌
- [ ] ✅ 导出的 TypeScript 变量名与 SQL 表名语义一致
  - 正确示例：`export const users = pgTable("users", ...)`
  - 错误示例：`export const user = pgTable("users", ...)` ❌

---

## 三、Drizzle 列字段命名检查

### 3.1 列命名（SQL 层）
- [ ] ✅ 列名全部使用 **snake_case**（如 `created_at`、`user_id`、`email_verified`）
- [ ] ✅ 严禁在 SQL 列名中使用驼峰（`createdAt` → 必须改为 `created_at`）

### 3.2 TypeScript 属性名（ORM 层）
- [ ] ✅ Drizzle 将 SQL 列映射为驼峰属性，无需手动转换（如 `created_at` → `createdAt`）
- [ ] ✅ 不得在 `pgTable()` 定义中手写驼峰列名（`text("createdAt")` → 必须改为 `text("created_at")`）

---

## 四、数据库命名检查（适用时）
- [ ] ✅ 数据库名全小写，下划线分隔，2-4 语义段（如 `mewpaw_prod`、`user_service`）
- [ ] ❌ 不存在驼峰、大写、短横杠形式（`UserCenter` → 必须改为 `user_center`）
