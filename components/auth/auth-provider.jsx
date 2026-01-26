"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import useAuthStore from "@/hooks/use-auth-store";

export const AuthProvider = ({ children }) => {
    const { supabase } = useSupabase();
    const { login, logout, updateUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const syncUser = async (session) => {
            if (!session) {
                logout();
                setIsLoading(false);
                return;
            }

            try {
                // Fetch profile from Supabase
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error("AuthProvider: Sync error:", error);
                }

                if (mounted) {
                    // Update Zustand store
                    login(session.user, session.access_token);
                    if (profile) {
                        updateUser({
                            role: profile.role,
                            profile: profile,
                            name: profile.full_name,
                            metadata: profile.metadata // Sync metadata for onboarding check
                        });
                    }
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("AuthProvider: Critical sync failure:", err);
                if (mounted) setIsLoading(false);
            }
        };

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            syncUser(session);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            syncUser(session);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase, login, logout, updateUser]);

    return <>{children}</>;
};

