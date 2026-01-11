import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";

export function useUserRoles() {
    const { token } = useAuthStore();
    const { data: user, isLoading } = useConvexQuery(api.users.getCurrentUser, { token: token || undefined });

    const roles = user?.roles || [];
    const role = user?.role;

    if (!user && !isLoading) {
        console.log("Current User Role: Not Logged In (User is null)");
    } else if (user) {
        console.log("Current User Role:", role, roles);
    }

    const hasRole = (roleKey) => role === roleKey || roles.some(r => r.key === roleKey);

    // Explicit Admin Check
    const isAdmin = role === "admin" || roles.some(r => r.key === "admin");
    const isOrganizer = isAdmin || role === "organizer" || roles.some(r => r.key === "organizer");
    const isAttendee = !isOrganizer; // Default fallback
    const hasPermission = (permissionKey) => roles.some(role =>
        role.permissions && role.permissions.includes(permissionKey)
    );

    return {
        user,
        isLoading,
        isAdmin,
        isOrganizer,
        isAttendee,
        hasRole,
        hasPermission,
    };
}
