import useAuthStore from "@/hooks/use-auth-store";

export function useUserRoles() {
    const { user, isLoading } = useAuthStore();

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
        isLoading: isLoading === undefined ? true : isLoading,
        isAdmin,
        isOrganizer,
        isVendor,
        isAttendee,
        hasRole,
        hasPermission,
    };
}
