import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** 用户账户的持久化记录。SQL 表名使用复数 snake_case。 */
export const usersTable = pgTable("users", {
  /** 用户唯一标识，由应用层生成。 */
  id: text("id").primaryKey(),
  /** 用户展示名称。 */
  name: text("name").notNull(),
  /** 用户登录邮箱，必须唯一。 */
  email: text("email").notNull().unique(),
  /** 是否已完成邮箱验证，默认为 false。 */
  emailVerified: boolean("email_verified").default(false).notNull(),
  /** 可选的头像 URL。 */
  image: text("image"),
  /** 记录创建时间。 */
  createdAt: timestamp("created_at").defaultNow().notNull(),
  /** 最近一次更新时间。 */
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/** 查询返回的用户行；始终从表定义推断。 */
export type UserRecord = typeof usersTable.$inferSelect;

/** 插入用户时允许传入的字段；始终从表定义推断。 */
export type UserInsert = typeof usersTable.$inferInsert;
