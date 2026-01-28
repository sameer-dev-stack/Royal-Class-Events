"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import Cookies from "js-cookie";

export const AuthProvider = ({ children }) => {
    const { logout, updateUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    const token = Cookies.get("auth-token");
    const user = useQuery(api.users.getCurrentUser, { token: token || "" });

    useEffect(() => {
        // user is undefined during initial fetch
        if (user === undefined) return;

        if (user) {
            updateUser({
                ...user,
                // Ensure internal user fields map to store expectation
                role: user.role,
                name: user.name || user.profile?.displayName,
            });
        } else if (token) {
            // Token invalid or expired - silent logout for consistency
            console.log("AuthProvider: Token invalid or session expired. Logging out.");
            logout();
        }
        setIsLoading(false);
        useAuthStore.getState().setIsLoading(false);
    }, [user, token, logout, updateUser]);

    return <>{children}</>;
};
