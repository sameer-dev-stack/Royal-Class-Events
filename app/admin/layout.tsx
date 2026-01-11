"use client";

import { useUserRoles } from "@/hooks/use-user-roles";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LayoutDashboard, Users, Calendar, DollarSign, ShieldCheck, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminLayout({ children }) {
    const { isAdmin, isLoading, user } = useUserRoles();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            console.log("Admin Layout Check:", { isAdmin, userRole: user?.role, userRoles: user?.roles });
            if (!isAdmin) {
                toast.error("Access Denied. Admins Only.");
                router.push("/");
            }
        }
    }, [isLoading, isAdmin, router, user]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return null; // Will redirect via useEffect
    }

    const navItems = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/users", label: "User Management", icon: Users },
        { href: "/admin/events", label: "All Events", icon: Calendar },
        { href: "/admin/finance", label: "Finance & Revenue", icon: DollarSign },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0",
                    !isSidebarOpen && "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-center border-b px-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-red-600" />
                        <span className="text-lg font-bold tracking-tight">Admin Console</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-primary",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t p-4">
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                            {user?.name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium">{user?.name}</p>
                            <p className="truncate text-xs text-muted-foreground">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 transition-all duration-300 md:ml-64",
            )}>
                <div className="container mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
