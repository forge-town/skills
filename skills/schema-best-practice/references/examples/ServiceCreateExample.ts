import { CreateFreeBattleInputSchema } from "./CreateFreeBattleInputSchema";
import { BattleWithStatsSchema } from "./BattleWithStatsSchema";
import { FreeBattleRepository } from "@/db/models/repositories/freeBattleRepository";
import { battlesDAO } from "@/db/models/daos/battles";
import { votesDAO } from "@/db/models/daos/votes";

// Service 示例：以 InputSchema 校验入参，Repository 写入，多个 DAO 组装 Business View Schema
async function createFreeBattle(rawInput: unknown) {
  // 1. 校验输入
  const input = CreateFreeBattleInputSchema.parse(rawInput);

  // 2. 调用 Repository 完成事务性写入
  const { id } = await FreeBattleRepository.create(input);

  // 3. 调用多个 DAO 组装完整视图
  const battle = await battlesDAO.getById(id);
  const voteCount = await votesDAO.countByBattleId(id);

  // 4. 用 Business View Schema 校验并返回
  return BattleWithStatsSchema.parse({ ...battle, vote_count: voteCount });
}
