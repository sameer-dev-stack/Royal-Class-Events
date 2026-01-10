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
    const hasPermission = (permissionKey) => roles.some(role =>
        role.permissions && role.permissions.includes(permissionKey)
    );

    return {
        user,
        isLoading,
        isAdmin: hasRole("admin"),
        isOrganizer: hasRole("organizer") || hasRole("admin"),
        isAttendee: hasRole("attendee"),
        hasRole,
        hasPermission,
    };
}
