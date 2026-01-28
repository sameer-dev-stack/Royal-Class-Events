"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ticket, Building, LogOut, Settings, RefreshCcw, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UserButton() {
    const { logout, user, isAuthenticated, role, viewMode, setViewMode, token } = useAuthStore();
    const convexLogout = useMutation(api.users.logout);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (!isAuthenticated || !user) return null;

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            // 1. Sign out from Convex (Revoke token)
            await convexLogout({ token: token });

            // 2. Clear local Zustand store
            logout();

            router.push("/");
            router.refresh();
            toast.success("Signed out successfully");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to sign out");
        } finally {
            setIsLoading(false);
        }
    };

    // Role & View Mode Logic
    const hasOrganizerAccess = role === "organizer" || role === "admin";
    const isAdmin = role === "admin";
    const isOrganizerView = viewMode === "organizer";

    // Visuals depend on View Mode
    const roleStyles = isOrganizerView
        ? "ring-[#D4AF37]/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:ring-[#D4AF37] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
        : "ring-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:ring-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]";

    const badgeLabel = (isOrganizerView && isAdmin) ? "ADMIN" : (isOrganizerView ? "ORGANIZER" : "ATTENDEE");
    const badgeColor = (isOrganizerView && isAdmin) ? "bg-red-500" : (isOrganizerView ? "bg-[#D4AF37]" : "bg-blue-500 text-white");

    // Get user display info
    const displayName = user.name || user.email?.split("@")[0] || "User";
    const avatarUrl = user.image || user.user_metadata?.avatar_url || null; // Fallback for Supabase metadata
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleViewSwitch = () => {
        const newMode = isOrganizerView ? "attendee" : "organizer";

        // Navigate FIRST to prevent flash of "Access Denied" on dashboard
        if (newMode === "organizer") {
            router.replace("/dashboard");
        } else {
            router.replace("/"); // Redirect home immediately
        }

        // Then update state (after navigation started)
        setViewMode(newMode);
        toast.success(`Switched to ${newMode === "organizer" ? "Organizer" : "Attendee"} View`);
    };

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
                            isOrganizerView
                                ? "bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37]/20"
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
                        <p className="text[11px] text-muted-foreground truncate opacity-80">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    {/* View Toggle for Organizers */}
                    {hasOrganizerAccess && (
                        <>
                            <DropdownMenuItem
                                onClick={handleViewSwitch}
                                className="rounded-lg h-10 cursor-pointer focus:bg-accent focus:text-accent-foreground transition-colors mb-1"
                            >
                                <RefreshCcw className="w-4 h-4 mr-3 opacity-70" />
                                <span className="text-sm font-medium">
                                    Switch to {isOrganizerView ? "Attendee" : "Organizer"} View
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-border/40" />
                        </>
                    )}

                    <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] transition-colors">
                        <Link href="/my-tickets" className="flex items-center w-full px-2">
                            <Ticket className="w-4 h-4 mr-3 opacity-70" />
                            <span className="text-sm font-medium italic tracking-tight">My Tickets</span>
                        </Link>
                    </DropdownMenuItem>

                    {/* Show Organizer Actions only in Organizer View */}
                    {isOrganizerView && (
                        <>
                            <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] transition-colors">
                                <Link href="/dashboard" className="flex items-center w-full px-2">
                                    <LayoutDashboard className="w-4 h-4 mr-3 opacity-70" />
                                    <span className="text-sm font-medium italic tracking-tight">Dashboard</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] transition-colors">
                                <Link href="/my-events" className="flex items-center w-full px-2">
                                    <Building className="w-4 h-4 mr-3 opacity-70" />
                                    <span className="text-sm font-medium italic tracking-tight">My Events</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] transition-colors">
                        <Link href="/account/profile" className="flex items-center w-full px-2">
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

