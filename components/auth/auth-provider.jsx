"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useAuthStore from "@/hooks/use-auth-store";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const AuthProvider = ({ children }) => {
    const { data: session, status } = useSession();
    const { login, logout, updateUser, token: currentToken } = useAuthStore();

    // Fetch real-time user data from Convex when token is available
    const convexUser = useQuery(api.users.getCurrentUser, { token: currentToken || undefined });

    // Effect 1: Handle NextAuth session lifecycle
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // Initial sync of NextAuth session to Zustand Store
            if (session.user.token !== currentToken) {
                console.log("AuthProvider: Syncing NextAuth session to Zustand Store");
                login(session.user, session.user.token);
            }
        } else if (status === "unauthenticated") {
            // Clear Zustand to prevent split-state if signed out
            if (currentToken) {
                console.log("AuthProvider: NextAuth unauthenticated, clearing Zustand Store");
                logout();
            }
        }
    }, [status, session, login, logout, currentToken]);

    // Effect 2: Handle real-time Convex role/data synchronization
    useEffect(() => {
        if (convexUser) {
            console.log("AuthProvider: Syncing Convex data to Zustand Store. Role:", convexUser.role);
            updateUser({
                role: convexUser.role,
                profile: convexUser.profile,
                name: convexUser.name
            });
        }
    }, [convexUser, updateUser]);

    return <>{children}</>;
};
