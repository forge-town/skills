import { useSession } from "@/integrations/better-auth-client";

export function useAuth() {
  const { data: session, isPending } = useSession();
  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isPending,
  };
}
