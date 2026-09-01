import { usersDao } from "@/models/daos/usersDao";
import { profilesDao } from "@/models/daos/profilesDao";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
};

export const createUserService = (deps: {
  usersDao: typeof usersDao;
  profilesDao: typeof profilesDao;
}) => ({
  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await deps.usersDao.findById(userId);
    if (!user) return null;

    const profile = await deps.profilesDao.findByUserId(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: profile?.avatarUrl ?? null,
      createdAt: user.createdAt,
    };
  },

  async updateName(userId: string, name: string): Promise<UserProfile | null> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name cannot be empty");

    await deps.usersDao.updateById(userId, { name: trimmed });
    return this.getProfile(userId);
  },
});

export const UserService = createUserService({ usersDao, profilesDao });
