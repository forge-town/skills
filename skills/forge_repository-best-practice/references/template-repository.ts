import { z } from "zod";
import { db } from "@/db";
import { battlesDAO } from "@/db/models/daos/battles";
import { freeBattlesDAO } from "@/db/models/daos/free_battles";

// ============================================================
// Input Schema
// ============================================================

export const CreateFreeBattleInputSchema = z.object({
  title: z.string().min(1),
  creatorId: z.string(),
  rules: z.string(),
  duration: z.number().int().positive(),
});

type CreateFreeBattleInput = z.infer<typeof CreateFreeBattleInputSchema>;

// ============================================================
// Repository
// ============================================================

export const FreeBattleRepository = {
  /**
   * 创建一场 Free Battle（跨表事务写入）
   * 写入 battles 表和 free_battles 表，返回 battle id
   */
  async create(input: CreateFreeBattleInput): Promise<{ id: number }> {
    return await db.transaction(async (tx) => {
      // Step 1: 写入通用 battle 表
      const battleId = await battlesDAO.insert(
        {
          title: input.title,
          creator_id: input.creatorId,
          type: "free",
          created_at: new Date(),
        },
        tx,
      );

      // Step 2: 写入 free_battles 专属表
      await freeBattlesDAO.insert(
        {
          battle_id: battleId,
          rules: input.rules,
          duration: input.duration,
        },
        tx,
      );

      // 只返回关键标识，完整视图由 Service 层组装
      return { id: battleId };
    });
  },
};
