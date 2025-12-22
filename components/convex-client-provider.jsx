"use client";

import { ConvexReactClient, Authenticated, useMutation } from "convex/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

function UserSync() {
  const { user } = useUser();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (user) {
      // Sync user to Convex
      storeUser();
    }
  }, [user, storeUser]);

  return null;
}

export function ConvexClientProvider({ children }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <Authenticated>
        <UserSync />
      </Authenticated>
      {children}
    </ConvexProviderWithClerk>
  );
}
