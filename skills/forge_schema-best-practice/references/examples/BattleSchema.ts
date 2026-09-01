import { z } from "zod/v4";

// 表结构 Schema —— 仅在 Service 层需要 Zod 显式校验单张表数据时按需定义（可选）
export const BattleSchema = z.object({
  id: z.number(),
  title: z.string(),
  creator_id: z.string(),
  type: z.enum(["free", "ranked"]),
  created_at: z.date(),
});

export type Battle = z.infer<typeof BattleSchema>;
