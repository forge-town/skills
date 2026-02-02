import { z } from "zod/v4";

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  SMTP_HOST: z.string(),
  NODE_ENV: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_SANDBOX_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_SANDBOX_CLIENT_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
