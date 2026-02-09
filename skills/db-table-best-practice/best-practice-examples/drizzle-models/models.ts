import { pgTable, serial, text, timestamp, varchar, integer, index } from "drizzle-orm/pg-core";

// ==========================================
// Drizzle ORM 表定义示例
// ==========================================
// 场景：用户系统，展示最佳实践
// 核心：复数表名、简洁命名、清晰语义

// ✅ 正确：复数表名 users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

// ❌ 错误示例（仅供参考）：
// export const user = pgTable("user", {  // 单数形式
//   id: serial("id").primaryKey(),
// });
// export const userData = pgTable("user_data", {  // 冗余后缀 data
//   id: serial("id").primaryKey(),
// });

// ✅ 正确：扩展表使用复数和下划线
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ✅ 正确：登录记录使用复数
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ✅ 正确：角色关联表使用复数
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleName: text("role_name").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// ==========================================
// Drizzle ORM 命名最佳实践
// ==========================================
// 1. JavaScript 变量名：使用 camelCase（如 userSessions）
// 2. 数据库表名：使用小写+下划线+复数（如 user_sessions）
// 3. 字段映射：使用 snake_case 到 camelCase 的自动转换
// 4. 索引命名：表名_idx（如 email_idx）
// 5. 外键引用：明确指定 onDelete 行为

// ==========================================
// 表名对比
// ==========================================
// JavaScript 变量    数据库表名           说明
// ----------------  -------------------  ------------------
// users              users               主表
// userProfiles       user_profiles       扩展表
// userSessions       user_sessions       会话表
// userRoles          user_roles          关联表
