/**
 * DAO 聚合模板：将 User / users 替换为实际领域名称。
 *
 * Operation 实现放在 `_operations/<operation>/`，并与 `.operation.spec.ts` 共置。
 * 普通 Operation 使用共享 db；参与 Repository 事务的能力使用显式 WithTx Operation。
 */

import {
  createUserOperation,
  createUserWithTxOperation,
  findUserByIdOperation,
  findUserByIdWithTxOperation,
} from "./_operations";

/** Users DAO 是 singleton 聚合对象，不创建 `createUsersDao` 工厂。 */
export const usersDao = {
  findById: findUserByIdOperation,
  findByIdWithTx: findUserByIdWithTxOperation,
  create: createUserOperation,
  createWithTx: createUserWithTxOperation,
};

/** DAO 聚合对象的公共类型。 */
export type UsersDao = typeof usersDao;
