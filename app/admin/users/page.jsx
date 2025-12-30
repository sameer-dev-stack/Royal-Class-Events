"use client";

import { useState } from "react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Ban, CheckCircle, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");
    const { data: users, isLoading } = useConvexQuery(api.admin.searchUsers, {
        query: search,
        limit: 20
    });

    const { mutate: toggleBan } = useConvexMutation(api.admin.toggleUserBan);

    const handleBanToggle = async (userId, currentStatus) => {
        const isBanned = currentStatus === "suspended";
        await toggleBan({ userId, banned: !isBanned });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-zinc-400 mt-2">Manage user access and roles</p>
                </div>
            </div>

            <Card className="bg-zinc-900 border-white/5">
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Search users by name or email..."
                            className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-zinc-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-hidden overflow-x-auto">
                        <div className="min-w-[800px]">
                            <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-sm font-medium text-zinc-400 border-b border-white/10">
                                <div className="col-span-5">User</div>
                                <div className="col-span-3">Role</div>
                                <div className="col-span-2">Joined</div>
                                <div className="col-span-1">Status</div>
                                <div className="col-span-1 text-right">Actions</div>
                            </div>

                            {isLoading ? (
                                <div className="p-8 text-center text-zinc-500">Loading users...</div>
                            ) : users?.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">No users found.</div>
                            ) : (
                                users?.map((user) => (
                                    <div key={user._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">

                                        {/* User Info */}
                                        <div className="col-span-5 flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={user.profile?.avatarUrl} />
                                                <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xs">
                                                    {(user.profile?.displayName || "U").charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-white truncate">{user.profile?.displayName || "Unknown"}</p>
                                                <p className="text-xs text-zinc-500 truncate">{user.profile?.primaryEmail?.address}</p>
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div className="col-span-3">
                                            {user.roles?.includes("super_admin") ? (
                                                <Badge className="bg-amber-500 text-black hover:bg-amber-400">Super Admin</Badge>
                                            ) : (
                                                <span className="text-sm text-zinc-400">User</span>
                                            )}
                                        </div>

                                        {/* Date */}
                                        <div className="col-span-2 text-sm text-zinc-500">
                                            {format(user.createdAt, "MMM d, yyyy")}
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-1">
                                            <Badge variant={user.status === "active" ? "outline" : "destructive"} className="text-xs">
                                                {user.status}
                                            </Badge>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-1 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">
                                                    <DropdownMenuItem
                                                        className="text-red-400 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                                                        onClick={() => handleBanToggle(user._id, user.status)}
                                                    >
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        {user.status === "suspended" ? "Unban User" : "Ban User"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
