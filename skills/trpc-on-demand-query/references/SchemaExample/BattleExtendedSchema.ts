import { z } from "zod/v4";
import { BattleSchema } from "./BattleSchema";

export const BattleExtendedSchema = BattleSchema.extend({
  voteCounts: z.number().optional(),
  recentVoteId: z.string().nullable().optional(),
});

export type BattleExtended = z.infer<typeof BattleExtendedSchema>;
