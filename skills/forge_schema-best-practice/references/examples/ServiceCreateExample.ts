import { BattleWithStatsSchema } from "./BattleWithStats.schema";
import { CreateFreeBattleInputSchema, type CreateFreeBattleInput } from "./CreateFreeBattleInput.schema";

type Dependencies = {
  freeBattleRepository: { create: (input: CreateFreeBattleInput) => Promise<{ id: number }> };
  battlesDao: { getById: (id: number) => Promise<Record<string, unknown>> };
  votesDao: { countByBattleId: (id: number) => Promise<number> };
};

// tRPC procedure 在 API 边界使用 .input(CreateFreeBattleInputSchema)。
export const parseCreateFreeBattleInput = (rawInput: unknown) =>
  CreateFreeBattleInputSchema.parse(rawInput);

export const createFreeBattle = async (input: CreateFreeBattleInput, dependencies: Dependencies) => {
  const { id } = await dependencies.freeBattleRepository.create(input);
  const battle = await dependencies.battlesDao.getById(id);
  const voteCount = await dependencies.votesDao.countByBattleId(id);

  return BattleWithStatsSchema.parse({ ...battle, voteCount });
};
