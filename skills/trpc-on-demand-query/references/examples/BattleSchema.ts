import { z } from "zod/v4";

export const BattleSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
});

export type Battle = z.infer<typeof BattleSchema>;
