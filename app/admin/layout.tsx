"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/hooks/use-auth-store";
import { useUserRoles } from "@/hooks/use-user-roles";
import { useAdminStore } from "@/hooks/use-admin-store";
import { Loader2, LayoutDashboard, Users, Calendar, DollarSign, LogOut, Lock, ShieldAlert, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isOrganizer, isAdmin, isLoading } = useUserRoles();
    const { logout } = useAuthStore();
    const { isVerified, clearAdminSession } = useAdminStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auth Guard
    useEffect(() => {
        if (!isLoading && isMounted) {
            if (pathname === "/admin/login") return;

            if (!user) {
                router.push("/sign-in?redirect=" + pathname);
            } else if (!isAdmin) {
                router.push("/dashboard");
            } else if (!isVerified) {
                // High Security Zone: Even if logged in, must be verified for Admin
                router.push("/admin/login");
            }
        }
    }, [user, isAdmin, isLoading, router, isMounted, isVerified, pathname]);

    if (!isMounted || isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-zinc-950 text-white">
                <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            </div>
        );
    }

    const isLoginPage = pathname === "/admin/login";

    // True Lock Screen: No sidebar if unverified or on login page
    if (!isVerified || isLoginPage) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
                {children}
            </div>
        );
    }

    // Safety fallback: If somehow reached here without being an admin, don't show anything
    if (!isAdmin) return null;

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Events", href: "/admin/events", icon: Calendar },
        { name: "Finance", href: "/admin/finance", icon: DollarSign },
        { name: "Audit Logs", href: "/admin/audit", icon: ShieldAlert },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-zinc-950 text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-black tracking-tighter text-amber-500 uppercase">
                        Admin Portal
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-800 space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-500">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold uppercase">
                            {user?.name?.[0] || "A"}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="truncate font-medium text-white">{user?.name}</p>
                            <p className="text-xs truncate">Verified Admin</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-zinc-500 hover:text-red-400 hover:bg-red-400/10 gap-3 px-4"
                        onClick={() => {
                            clearAdminSession();
                            router.push("/admin/login");
                        }}
                    >
                        <Lock className="w-4 h-4" />
                        Lock Session
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-zinc-500 hover:text-white hover:bg-zinc-800 gap-3 px-4"
                        onClick={() => logout()}
                    >
                        <LogOut className="w-4 h-4" />
                        System Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="h-full p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
