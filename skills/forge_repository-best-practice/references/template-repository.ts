import { z } from "zod/v4";
import { createFreeBattleOperation } from "./_operations/createFreeBattle.operation";

/** 跨表写入的输入契约；仅用于 Repository 的单个业务动作。 */
export const CreateFreeBattleInputSchema = z.object({
  /** 通用 Battle 标题。 */
  title: z.string().min(1),
  /** 创建者 ID。 */
  creatorId: z.uuid(),
  /** Free Battle 规则文本。 */
  rules: z.string().min(1),
  /** 持续时长（分钟）。 */
  duration: z.int().positive(),
});

export type CreateFreeBattleInput = z.infer<typeof CreateFreeBattleInputSchema>;

/**
 * Repository singleton。
 *
 * `createFreeBattleOperation` 内部负责唯一的 `db.transaction`，
 * 外层只聚合 Operation，不直接导入表、DAO 或 drizzle-orm。
 */
export const FreeBattleRepository = {
  create: (input: CreateFreeBattleInput): Promise<{ id: string }> =>
    createFreeBattleOperation(input),
};

export type FreeBattleRepository = typeof FreeBattleRepository;
