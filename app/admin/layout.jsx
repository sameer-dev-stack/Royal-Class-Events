"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import AdminHeader from "./_components/AdminHeader";
import useAuthStore from "@/hooks/use-auth-store";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuthStore();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/sign-in");
        } else {
            // Check for admin role
            const hasAdminRole = user?.role === "admin" || (user?.roles && user.roles.some(r => r.key === "admin"));
            if (!hasAdminRole) {
                // If not admin, check if they are an organizer trying to access admin
                // Actually, let's just allow admins for now
                router.push("/");
            } else {
                setIsAdmin(true);
            }
            setLoading(false);
        }
    }, [isAuthenticated, user, router]);

    if (loading || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminHeader onLogout={() => {
                    logout();
                    router.push("/");
                }} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
