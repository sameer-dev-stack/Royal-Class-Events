import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function useUserRoles() {
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchUser() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    if (mounted) setIsLoading(false);
                    return;
                }

                // Fetch comprehensive profile data
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) console.error("Error fetching profile:", error);

                if (mounted) {
                    setUser(profile);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Auth check failed", err);
                if (mounted) setIsLoading(false);
            }
        }

        fetchUser();

        return () => { mounted = false; };
    }, []);

    const role = user?.role; // 'admin', 'organizer', 'vendor', 'attendee'

    // Explicit Role Checks
    const isAdmin = role === "admin";
    const isOrganizer = isAdmin || role === "organizer";
    const isVendor = role === "vendor";
    const isAttendee = !isOrganizer && !isVendor;

    // Helper for checking specific roles (flexible)
    const hasRole = (roleKey) => role === roleKey;

    const hasPermission = (permissionKey) => {
        // Simple permission logic for now - ideally fetched from a permissions table
        if (isAdmin) return true;
        if (isOrganizer && ['create_event', 'manage_seats'].includes(permissionKey)) return true;
        return false;
    };

    return {
        user,
        isLoading,
        isAdmin,
        isOrganizer,
        isVendor,
        isAttendee,
        hasRole,
        hasPermission,
    };
}
