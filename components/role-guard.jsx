"use client";

import { useUserRoles } from "@/hooks/use-user-roles";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Role-based access control wrapper component
 * Renders children only if user has the required role
 * 
 * @param {string} role - Required role key (e.g., "organizer", "admin")
 * @param {React.ReactNode} children - Content to render if authorized
 * @param {React.ReactNode} fallback - Content to render if not authorized (default: null)
 * @param {boolean} showLoading - Whether to show skeleton while loading (default: true)
 */
export function RequireRole({ role, children, fallback = null, showLoading = true }) {
    const { hasRole, isLoading } = useUserRoles();

    if (isLoading) {
        return showLoading ? <RoleGuardSkeleton /> : null;
    }

    if (!hasRole(role)) {
        return fallback;
    }

    return children;
}

/**
 * Permission-based access control wrapper
 * Renders children only if user has the required permission
 * 
 * @param {string} permission - Required permission string (e.g., "events:create")
 * @param {React.ReactNode} children - Content to render if authorized
 * @param {React.ReactNode} fallback - Content to render if not authorized
 */
export function RequirePermission({ permission, children, fallback = null, showLoading = true }) {
    const { hasPermission, isLoading } = useUserRoles();

    if (isLoading) {
        return showLoading ? <RoleGuardSkeleton /> : null;
    }

    if (!hasPermission(permission)) {
        return fallback;
    }

    return children;
}

/**
 * Admin-only content wrapper
 */
export function AdminOnly({ children, fallback = null }) {
    return <RequireRole role="admin" fallback={fallback}>{children}</RequireRole>;
}

/**
 * Organizer-only content wrapper
 */
export function OrganizerOnly({ children, fallback = null }) {
    return <RequireRole role="organizer" fallback={fallback}>{children}</RequireRole>;
}

/**
 * Loading skeleton for role-guarded content
 */
function RoleGuardSkeleton() {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
        </div>
    );
}

/**
 * Hook for programmatic role checks in components
 */
export function useRoleGuard(requiredRole) {
    const { hasRole, isLoading, user } = useUserRoles();

    return {
        isAuthorized: hasRole(requiredRole),
        isLoading,
        user,
    };
}
