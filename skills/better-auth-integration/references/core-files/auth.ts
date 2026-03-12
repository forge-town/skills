import bcrypt from "bcryptjs";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";
import { accounts, sessions, users, verifications } from "@/db/schema";
import { getServerEnv } from "@/integrations/server-env";

const {
  BETTER_AUTH_SECRET,
  VITE_APP_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NODE_ENV,
} = getServerEnv();

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: { users, sessions, accounts, verifications },
  }),
  plugins: [tanstackStartCookies()],
  baseURL: VITE_APP_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: (pwd) => bcrypt.hash(pwd, 10),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  socialProviders: {
    github: GITHUB_CLIENT_ID
      ? {
          clientId: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET ?? "",
          redirectURI: `${VITE_APP_URL}/api/auth/callback/github`,
        }
      : undefined,
    google: GOOGLE_CLIENT_ID
      ? {
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET ?? "",
          redirectURI: `${VITE_APP_URL}/api/auth/callback/google`,
        }
      : undefined,
  },
  trustedOrigins: [
    VITE_APP_URL,
    ...(NODE_ENV === "development"
      ? [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002",
          "http://localhost:3003",
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 5,
    cookieCache: { enabled: true, maxAge: 60 * 60 * 24 * 7 },
  },
  advanced: { useSecureCookies: NODE_ENV === "production" },
  logger: { level: "debug", disabled: false },
});
