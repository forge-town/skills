import { createAuthClient } from "better-auth/react";
import { getServerEnv } from "@/integrations/server-env";
import { getIsClient } from "@/utils/getIsClient";

export const authClient = createAuthClient({
  baseURL: getIsClient() ? window.location.origin : getServerEnv().VITE_APP_URL,
  fetchOptions: { credentials: "include" },
  session: { refreshOnWindowFocus: true, refreshInterval: 60 * 10 },
});

export const signUpWithEmail = async (input: {
  email: string;
  password: string;
  name: string;
  image?: string;
  callbackURL?: string;
}) => {
  const { data, error } = await authClient.signUp.email({
    ...input,
    callbackURL: input.callbackURL ?? "/dashboard",
  });
  if (error) {
    throw error;
  }
  return data;
};

export const signInWithGitHub = (callbackURL = "/dashboard") =>
  authClient.signIn.social({
    provider: "github",
    callbackURL,
    errorCallbackURL: "/login",
  });

export const signInWithGoogle = (callbackURL = "/dashboard") =>
  authClient.signIn.social({
    provider: "google",
    callbackURL,
    errorCallbackURL: "/login",
  });

export const signOut = (cb?: () => void) =>
  authClient.signOut({ fetchOptions: { onSuccess: cb } });

export const { signIn, signUp, useSession, getSession } = authClient;
