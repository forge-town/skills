import { z } from "zod/v4";

// 业务视图 Schema —— 融合多张表字段，由 Service 层组装，替代传统 DTO
export const BattleWithStatsSchema = z.object({
  id: z.number(),
  title: z.string(),
  creator_id: z.string(),
  vote_count: z.number(), // 来自 votes 表的 COUNT（聚合字段）
  rules: z.string(), // 来自 free_battles 表
  is_voted_by_me: z.boolean(), // 用户个性化派生字段
});
export type BattleWithStats = z.infer<typeof BattleWithStatsSchema>;
