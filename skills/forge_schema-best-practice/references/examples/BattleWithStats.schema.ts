import { z } from "zod/v4";

/** Battle 聚合视图契约，由 Service 层组装。 */
export const BattleWithStatsSchema = z.object({
  /** Battle 唯一标识。 */
  id: z.int(),
  /** Battle 标题。 */
  title: z.string(),
  /** 创建者用户标识。 */
  creatorId: z.string(),
  /** 投票总数（来自 votes 表的 COUNT）。 */
  voteCount: z.int(),
  /** Battle 规则文本（来自 free_battles 表）。 */
  rules: z.string(),
  /** 当前用户是否已投票（用户个性化派生字段）。 */
  isVotedByMe: z.boolean(),
});
export type BattleWithStats = z.infer<typeof BattleWithStatsSchema>;
