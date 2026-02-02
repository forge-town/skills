import { z } from "zod/v4";

export const clientEnvSchema = z.object({
  VITE_APP_URL: z.string().optional(),
  VITE_API_URL: z.string(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
