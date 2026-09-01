import { z } from "zod/v4";

/** 创建 Free Battle 的 tRPC 输入契约。 */
export const CreateFreeBattleInputSchema = z.object({
  /** Battle 标题。 */
  title: z.string().min(1),
  /** 创建者用户标识。 */
  creatorId: z.string(),
  /** Battle 规则文本。 */
  rules: z.string(),
  /** Battle 持续时间（正整数）。 */
  duration: z.int().positive(),
});

export type CreateFreeBattleInput = z.infer<typeof CreateFreeBattleInputSchema>;
