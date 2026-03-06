import { z } from "zod/v4";
import { t } from "@/integrations/trpc";
import { createBattleService } from "@/services/battleService";
import { battlesDao } from "@/db/models/daos/battlesDao";

// ─── 支持的扩展字段枚举 ───────────────────────────────
const BattleIncludeEnum = z.enum(["voteCounts", "recentVoteId"]);
type BattleInclude = z.infer<typeof BattleIncludeEnum>;

// ─── Input Schema ──────────────────────────────────────
const GetBattleInputSchema = z.object({
  id: z.string(),
  include: z.array(BattleIncludeEnum).optional(),
  fields: z.array(z.string()).optional(),
});

// ─── tRPC Procedure ───────────────────────────────────
export const getBattle = t.procedure
  .input(GetBattleInputSchema)
  .query(async ({ input, ctx }) => {
    const { id, include = [], fields } = input;
    const battleService = createBattleService({ battlesDao });

    // Step 1: 基础查询
    let result: Record<string, unknown> = await battleService.findById(id);

    // Step 2: include 扩展加载
    if (include.includes("voteCounts")) {
      result.voteCounts = await battleService.getVoteCounts(id);
    }

    if (include.includes("recentVoteId")) {
      // 权限校验示例：敏感字段加载前校验
      if (!ctx.user) throw new Error("Unauthorized");
      result.recentVoteId = await battleService.getRecentVoteId(
        id,
        ctx.user.id,
      );
    }

    // Step 3: fields 字段裁剪
    if (fields && fields.length > 0) {
      const allowed = new Set(fields);
      result = Object.fromEntries(
        Object.entries(result).filter(([key]) => allowed.has(key)),
      );
    }

    return result;
  });
