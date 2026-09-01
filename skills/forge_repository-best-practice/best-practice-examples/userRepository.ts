import type { RegisterUserInput, RegisterUserResult } from "./contracts";
import { registerUserOperation } from "./_operations";

/** User Repository singleton；跨表事务和数据库依赖位于 Operation。 */
export const UserRepository = {
  register: (input: RegisterUserInput): Promise<RegisterUserResult> =>
    registerUserOperation(input),
};

/** User Repository 的公共契约。 */
export type UserRepository = typeof UserRepository;
