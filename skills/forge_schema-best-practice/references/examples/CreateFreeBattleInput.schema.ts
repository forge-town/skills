import { z } from "zod/v4";

// 输入 Schema —— 由 tRPC procedure 作为 API 边界契约
export const CreateFreeBattleInputSchema = z.object({
  title: z.string().min(1),
  creatorId: z.string(),
  rules: z.string(),
  duration: z.number().int().positive(),
});

export type CreateFreeBattleInput = z.infer<typeof CreateFreeBattleInputSchema>;
