import { z } from "zod/v4";

/** 用户资料 Schema；运行时校验与静态类型的唯一真实来源。 */
export const UserSchema = z.object({
  /** 用户唯一标识。 */
  id: z.uuid(),
  /** 用户展示名称。 */
  name: z.string().min(1),
  /** 用户邮箱地址。 */
  email: z.email(),
  /** 用户创建时间。 */
  createdAt: z.date(),
});

// ✅ 类型直接从 schema 派生，永远与校验逻辑同步
export type User = z.infer<typeof UserSchema>;

/** 创建用户输入；省略服务端生成字段。 */
export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/** 更新用户输入；允许局部更新，但 id 必须存在。 */
export const UpdateUserSchema = UserSchema.partial().required({ id: true });
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/** 对外用户响应；隐藏内部创建时间字段。 */
export const UserResponseSchema = UserSchema.omit({ createdAt: true });
export type UserResponse = z.infer<typeof UserResponseSchema>;
