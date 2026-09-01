import {
  findUserByEmailOperation,
  findUserByIdOperation,
} from "./usersDao/_operations";

/** Users DAO 聚合对象；查询实现位于共置的 Operation 单元。 */
export const usersDao = {
  getById: findUserByIdOperation,
  getByEmail: findUserByEmailOperation,
};

/** Users DAO 的公共契约。 */
export type UsersDao = typeof usersDao;
