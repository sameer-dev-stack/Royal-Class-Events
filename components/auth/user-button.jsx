"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ticket, Building, LogOut, Settings, User } from "lucide-react";
import { toast } from "sonner";

export default function UserButton() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (!session?.user) return null;

    const user = session.user;

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut({ callbackUrl: "/" });
            toast.success("Signed out successfully");
        } catch (error) {
            toast.error("Failed to sign out");
            setIsLoading(false);
        }
    };

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
                <button className="focus:outline-none">
                    <Avatar className="w-9 h-9 ring-2 ring-amber-500/20 hover:ring-amber-500 transition-all cursor-pointer">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-amber-500/10 text-amber-500 font-semibold text-sm">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/my-tickets" className="cursor-pointer">
                        <Ticket className="w-4 h-4 mr-2" />
                        My Tickets
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/my-events" className="cursor-pointer">
                        <Building className="w-4 h-4 mr-2" />
                        My Events
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoading ? "Signing out..." : "Sign Out"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
