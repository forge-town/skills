import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema/users'

type UserRow = typeof users.$inferSelect
type NewUserRow = typeof users.$inferInsert

export const usersDao = {
  async findById(id: string): Promise<UserRow | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return result[0] ?? null
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    return result[0] ?? null
  },

  async create(data: NewUserRow): Promise<UserRow> {
    const result = await db.insert(users).values(data).returning()
    return result[0]
  },

  async updateById(
    id: string,
    data: Partial<NewUserRow>,
  ): Promise<UserRow | null> {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning()
    return result[0] ?? null
  },

  async deleteById(id: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id })
    return result.length > 0
  },
}
