import { z } from "zod/v4";

// 输入 Schema —— 供 Repository 层接收写操作入参
export const CreateFreeBattleInputSchema = z.object({
  title: z.string().min(1),
  creatorId: z.string(),
  rules: z.string(),
  duration: z.number().int().positive(),
});

export type CreateFreeBattleInput = z.infer<typeof CreateFreeBattleInputSchema>;
