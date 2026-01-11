"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import useAuthStore from "@/hooks/use-auth-store";

/**
 * Hook to synchronize the authenticated user with the Convex database.
 * Adapted for NextAuth.js.
 */
export function useStoreUser() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const isAuthenticated = status === "authenticated";
  const { updateUser, token: storeToken } = useAuthStore();

  const [storeFailed, setStoreFailed] = useState(false);

  // 1. Reactive Query to get the latest user data from Convex
  const convexUser = useQuery(api.users.getCurrentUser, {
    token: session?.user?.token || storeToken || undefined
  });

  // 2. Mutation to store/sync the user if they don't exist
  const { mutate: storeUser } = useConvexMutation(api.users.store);

  useEffect(() => {
    if (!isAuthenticated || !session?.user) {
      return;
    }

    const syncUser = async () => {
      try {
        const urlRole = searchParams.get("role");
        const roleSuggestion = urlRole === "organizer" || urlRole === "attendee" ? urlRole : "attendee";

        console.log("useStoreUser: Syncing with role suggestion:", roleSuggestion);
        await storeUser({ role: roleSuggestion });
      } catch (e) {
        console.error("useStoreUser: Sync failed", e);
        setStoreFailed(true);
      }
    };

    // If we are authenticated but Convex doesn't have the user yet (or we need to sync)
    // We rely on convexUser being undefined or null to trigger the sync
    if (isAuthenticated && session?.user && convexUser === null && !storeFailed) {
      syncUser();
    }
  }, [isAuthenticated, session, storeUser, searchParams, convexUser, storeFailed]);

  // Sync Convex role back to Zustand store whenever it changes
  useEffect(() => {
    if (convexUser) {
      updateUser(convexUser);
    }
  }, [convexUser, updateUser]);

  return {
    isLoading: status === "loading" || convexUser === undefined,
    isAuthenticated,
    user: convexUser,
    storeFailed,
  };
}
