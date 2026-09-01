import { z } from "zod/v4";

/** Battle 领域数据契约；Drizzle 表结构由 forge_db-table-best-practice 管理。 */
export const BattleSchema = z.object({
  /** Battle 唯一标识。 */
  id: z.int(),
  /** Battle 标题。 */
  title: z.string(),
  /** 创建者用户标识。 */
  creatorId: z.string(),
  /** Battle 类型。 */
  type: z.enum(["free", "ranked"]),
  /** 创建时间。 */
  createdAt: z.date(),
});

export type Battle = z.infer<typeof BattleSchema>;
