"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import useAuthStore from "@/hooks/use-auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ticket, Building, LogOut, Settings, User, Crown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UserButton() {
    const { logout, user, isAuthenticated, role } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (!isAuthenticated || !user) return null;

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            // 1. Clear NextAuth session
            await signOut({ redirect: false });
            // 2. Clear local Zustand store
            logout();

            router.push("/");
            router.refresh(); // Refresh to clear any server-component state
            toast.success("Signed out successfully");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to sign out");
        } finally {
            setIsLoading(false);
        }
    };

    // Role-based styling
    const isOrganizer = role === "organizer";
    const isAdmin = role === "admin";

    const roleStyles = (isOrganizer || isAdmin)
        ? "ring-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:ring-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
        : "ring-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:ring-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]";

    const badgeLabel = isAdmin ? "ADMIN" : isOrganizer ? "ORGANIZER" : "ATTENDEE";
    const badgeColor = isAdmin ? "bg-red-500" : isOrganizer ? "bg-amber-500" : "bg-blue-500 text-white";

    // Get user display info
    const displayName = user.name || user.email?.split("@")[0] || "User";
    const avatarUrl = user.image || null;
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="focus:outline-none group">
                    <Avatar className={cn(
                        "w-10 h-10 ring-2 transition-all duration-300 cursor-pointer",
                        roleStyles
                    )}>
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className={cn(
                            "font-bold text-sm transition-colors",
                            (isOrganizer || isAdmin)
                                ? "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20"
                                : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
                        )}>
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-2 bg-background/95 backdrop-blur-xl border-border shadow-2xl">
                <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-muted/30 rounded-xl border border-border/50">
                    <Avatar className="w-10 h-10 ring-1 ring-border/50">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-muted text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold truncate tracking-tight">{displayName}</p>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-black",
                                badgeColor
                            )}>
                                {badgeLabel}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate opacity-80">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer focus:bg-amber-500/10 focus:text-amber-500 transition-colors">
                        <Link href="/my-tickets" className="flex items-center w-full px-2">
                            <Ticket className="w-4 h-4 mr-3 opacity-70" />
                            <span className="text-sm font-medium italic tracking-tight">My Tickets</span>
                        </Link>
                    </DropdownMenuItem>

                    {(isOrganizer || isAdmin) && (
                        <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer focus:bg-amber-500/10 focus:text-amber-500 transition-colors">
                            <Link href="/my-events" className="flex items-center w-full px-2">
                                <Building className="w-4 h-4 mr-3 opacity-70" />
                                <span className="text-sm font-medium italic tracking-tight">My Events</span>
                            </Link>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer focus:bg-amber-500/10 focus:text-amber-500 transition-colors">
                        <Link href="/dashboard" className="flex items-center w-full px-2">
                            <Settings className="w-4 h-4 mr-3 opacity-70" />
                            <span className="text-sm font-medium italic tracking-tight">Account Settings</span>
                        </Link>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-2 bg-border/40" />

                <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="rounded-lg h-10 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/5 transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-3 opacity-70" />
                    <span className="text-sm font-bold italic tracking-tight">
                        {isLoading ? "Signing out..." : "Logout"}
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
