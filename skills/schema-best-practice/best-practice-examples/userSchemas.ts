import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.date(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const CreateUserInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  avatarUrl: z.string().url().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const UpdateUserInputSchema = CreateUserInputSchema.partial();

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
