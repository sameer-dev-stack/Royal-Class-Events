import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";

export function useUserRoles() {
    const { data: user, isLoading } = useConvexQuery(api.users.getCurrentUser);

    const roles = user?.roles || [];

    const hasRole = (roleKey) => roles.some((r) => r.key === roleKey);
    const hasPermission = (permission) => {
        if (hasRole("admin")) return true; // Admin has all permissions
        return roles.some((r) => r.permissions.includes(permission) || r.permissions.includes("*"));
    };

    return {
        user,
        isLoading,
        roles: roles.map(r => r.key),
        isAdmin: hasRole("admin"),
        isOrganizer: hasRole("organizer"),
        isAttendee: hasRole("attendee"),
        isSupport: hasRole("support"),
        hasRole,
        hasPermission,
    };
}
