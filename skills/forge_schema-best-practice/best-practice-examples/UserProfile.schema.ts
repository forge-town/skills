import { z } from "zod/v4";

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.date(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
