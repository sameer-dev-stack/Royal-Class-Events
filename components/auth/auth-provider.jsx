"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useAuthStore from "@/hooks/use-auth-store";

export const AuthProvider = ({ children }) => {
    const { data: session, status } = useSession();
    const { login, logout, token: currentToken } = useAuthStore();

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // Only update if the token has changed to avoid unnecessary re-renders
            if (session.user.token !== currentToken) {
                console.log("AuthProvider: Syncing NextAuth session to Zustand Store");
                login(session.user, session.user.token);
            }
        } else if (status === "unauthenticated") {
            // If NextAuth says we are out, clear Zustand to prevent split-state
            if (currentToken) {
                console.log("AuthProvider: NextAuth unauthenticated, clearing Zustand Store");
                logout();
            }
        }
    }, [status, session, login, logout, currentToken]);

    return <>{children}</>;
};
