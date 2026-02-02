import { clientEnvSchema } from "./envSchema";

export const getClientEnv = () => {
  const { error, data } = clientEnvSchema.safeParse(process.env);
  if (error) {
    throw new Error(
      `Client env not valid. Message is: ${JSON.stringify(error.issues, null, 2)}`,
    );
  }

  return data;
};
