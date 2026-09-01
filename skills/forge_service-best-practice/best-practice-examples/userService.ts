import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { User } from "@repo/schemas";
import { usersDao } from "@repo/models";

/** Service 对外返回的用户视图。 */
export type UserProfile = Pick<User, "id" | "name" | "email" | "createdAt"> & {
  avatarUrl: string | null;
};

/** 创建依赖注入的用户 Service；不直接访问数据库。 */
const profilesDao = { findByUserId: async (_userId: string) => null as { avatarUrl: string | null } | null };

/** User Service singleton；持久化依赖由 helper/适配器提供。 */
export const UserService = {
  getProfile(userId: string): ResultAsync<UserProfile | null, Error> {
    return ResultAsync.fromPromise(usersDao.getById(userId), (cause) =>
      cause instanceof Error ? cause : new Error(String(cause)),
    ).andThen((user) => {
      if (!user) return okAsync(null);

      return ResultAsync.fromPromise(profilesDao.findByUserId(userId), (cause) =>
        cause instanceof Error ? cause : new Error(String(cause)),
      ).map((profile) => ({
        avatarUrl: profile?.avatarUrl ?? null,
        createdAt: user.createdAt,
        email: user.email,
        id: user.id,
        name: user.name,
      }));
    });
  },

  updateName(userId: string, name: string): ResultAsync<UserProfile | null, Error> {
    const trimmed = name.trim();
    if (!trimmed) return errAsync(new Error("Name cannot be empty"));

    return ResultAsync.fromPromise(usersDao.updateById(userId, { name: trimmed }), (cause) =>
      cause instanceof Error ? cause : new Error(String(cause)),
    ).andThen(() => this.getProfile(userId));
  },
};

export type UserService = typeof UserService;
