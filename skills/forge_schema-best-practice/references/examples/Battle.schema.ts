import { z } from "zod/v4";

// 领域数据 Schema —— 共享契约；Drizzle 表结构由 forge_db-table-best-practice 管理
export const BattleSchema = z.object({
  id: z.number(),
  title: z.string(),
  creatorId: z.string(),
  type: z.enum(["free", "ranked"]),
  createdAt: z.date(),
});

export type Battle = z.infer<typeof BattleSchema>;
