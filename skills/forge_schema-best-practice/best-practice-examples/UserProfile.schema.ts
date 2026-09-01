import { z } from "zod/v4";

/** 用户资料的跨边界数据契约。 */
export const UserProfileSchema = z.object({
  /** 用户唯一标识。 */
  id: z.uuid(),
  /** 用户展示名称。 */
  name: z.string(),
  /** 用户邮箱地址。 */
  email: z.email(),
  /** 用户头像地址；未设置时为空。 */
  avatarUrl: z.url().nullable(),
  /** 用户创建时间。 */
  createdAt: z.date(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
