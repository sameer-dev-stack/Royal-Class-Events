"use client";

import useAuthStore from "@/hooks/use-auth-store";

/**
 * Legacy hook wrapper. Profile syncing is now handled by Supabase DB triggers.
 */
export function useStoreUser() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  return {
    isLoading: isLoading === undefined ? true : isLoading,
    isAuthenticated,
    user,
    storeFailed: false,
  };
}
