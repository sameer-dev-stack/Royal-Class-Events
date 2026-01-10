"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";

/**
 * Hook to synchronize the authenticated user with the Convex database.
 * Adapted for NextAuth.js.
 * Works with both Real and Mock Auth (via backend bypass).
 */
export function useStoreUser() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const isAuthenticated = status === "authenticated";

  const [userId, setUserId] = useState(null);
  const [storeFailed, setStoreFailed] = useState(false);

  const { mutate: storeUser } = useConvexMutation(api.users.store);

  useEffect(() => {
    if (!isAuthenticated || !session?.user) {
      setUserId(null);
      return;
    }

    const syncUser = async () => {
      try {
        const urlRole = searchParams.get("role");
        const roleSuggestion = urlRole === "organizer" || urlRole === "attendee" ? urlRole : "attendee";

        console.log("useStoreUser: Syncing with role suggestion:", roleSuggestion);
        const resultId = await storeUser({ role: roleSuggestion });
        setUserId(resultId);
        console.log("useStoreUser: Synced user to Convex:", resultId);
      } catch (e) {
        console.error("useStoreUser: Sync failed", e);
        setStoreFailed(true);
      }
    };

    if (isAuthenticated && session?.user && !userId && !storeFailed) {
      syncUser();
    }

  }, [isAuthenticated, session, storeUser, searchParams]);

  return {
    isLoading: status === "loading",
    isAuthenticated,
    userId,
    storeFailed,
  };
}
