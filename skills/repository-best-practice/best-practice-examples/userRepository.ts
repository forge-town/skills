import { z } from 'zod'
import { db } from '@/db'
import { usersDao } from '@/models/daos/usersDao'
import { profilesDao } from '@/models/daos/profilesDao'

export const RegisterUserInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
})

type RegisterUserInput = z.infer<typeof RegisterUserInputSchema>

export const UserRepository = {
  async register(input: RegisterUserInput): Promise<{ id: string }> {
    return await db.transaction(async (tx) => {
      const user = await usersDao.createWithTx(tx, {
        name: input.name,
        email: input.email,
      })

      await profilesDao.createWithTx(tx, {
        userId: user.id,
        avatarUrl: input.avatarUrl ?? null,
      })

      return { id: user.id }
    })
  },
}
