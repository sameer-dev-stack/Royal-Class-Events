"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    LogOut,
    ShieldAlert,
    Crown
} from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoaded, userId, signOut } = useAuth();

    // Fetch current user with roles
    const { data: currentUser, isLoading } = useConvexQuery(api.users.getCurrentUser);

    // Auth Check
    useEffect(() => {
        if (isLoaded && !isLoading) {
            if (!userId) {
                router.push("/");
                return;
            }

            if (currentUser) {
                // const roles = currentUser.roles || [];
                // if (!roles.includes("super_admin")) {
                //     // Not an admin
                //     router.push("/");
                // }
            }
        }
    }, [isLoaded, isLoading, userId, currentUser, router]);

    if (isLoading || !isLoaded || !currentUser) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
        );
    }

    // Double check render block (prevents flash)
    // if (!currentUser.roles?.includes("super_admin")) {
    //     return null;
    // }

    const navItems = [
        { label: "Overview", icon: LayoutDashboard, href: "/admin" },
        { label: "Users", icon: Users, href: "/admin/users" },
        { label: "Events", icon: Calendar, href: "/admin/events" },
        { label: "Settings", icon: Settings, href: "/admin/settings" },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col fixed inset-y-0 bg-zinc-950 z-50">
                <div className="p-6 border-b border-white/10 flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-amber-500" />
                    <span className="font-bold text-xl tracking-tight">Admin<span className="text-amber-500">Panel</span></span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-amber-500 text-black font-semibold"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 items-center justify-center flex text-amber-500">
                            <Crown className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                            <div className="font-bold text-white">Super Admin</div>
                            <div className="text-zinc-500">{currentUser.profile.displayName}</div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 gap-3"
                        onClick={() => signOut(() => router.push("/"))}
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
