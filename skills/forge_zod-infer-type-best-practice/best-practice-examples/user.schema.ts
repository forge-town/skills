import { z } from "zod";

// ✅ 定义 schema（唯一真实来源）
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.date(),
});

// ✅ 类型直接从 schema 派生，永远与校验逻辑同步
export type User = z.infer<typeof UserSchema>;

// ✅ 创建用户时省略服务端生成字段
export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// ✅ 更新用户时所有字段可选，但 id 必须存在
export const UpdateUserSchema = UserSchema.partial().required({ id: true });
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// ✅ 响应体（对外隐藏内部字段）
export const UserResponseSchema = UserSchema.omit({ createdAt: true });
export type UserResponse = z.infer<typeof UserResponseSchema>;
