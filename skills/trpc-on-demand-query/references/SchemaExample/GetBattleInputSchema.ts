import { z } from "zod/v4";

export const GetBattleInputSchema = z.object({
  id: z.string(),
  include: z.array(z.enum(["voteCounts", "recentVoteId"])).optional(),
  fields: z.array(z.string()).optional(),
});

export type GetBattleInput = z.infer<typeof GetBattleInputSchema>;
