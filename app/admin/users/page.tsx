"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    ShieldAlert,
    ShieldCheck,
    Mail,
    Calendar,
    Phone,
    Award,
    Crown,
    Search,
    Users,
    Briefcase,
    UserPlus,
    Filter,
    UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function UsersPage() {
    const { token } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    // 1. Wait for Hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 2. Query only if Mounted and Token exists
    const data = useQuery(api.admin.getAllUsers,
        isMounted && token ? { token } : "skip"
    );
    const updateUserStatus = useMutation(api.admin.updateUserStatus);
    const updateUserRole = useMutation(api.admin.updateUserRole);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const filteredUsers = useMemo(() => {
        if (!data?.users) return [];
        return data.users.filter((user: any) => {
            const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
            const userRole = user.role || "attendee";
            const matchesRole = roleFilter === "all" || userRole === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [data?.users, searchTerm, roleFilter]);

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = (currentStatus === "active" || !currentStatus) ? "banned" : "active";
        try {
            await updateUserStatus({ userId: userId as any, status: newStatus, token: token || undefined });
            toast.success(`User updated to ${newStatus}`);
        } catch (err: any) {
            toast.error(err.message || "Action failed");
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateUserRole({ userId: userId as any, role: newRole, token: token || undefined });
            toast.success(`User promoted to ${newRole}`);
        } catch (err: any) {
            toast.error(err.message || "Action failed");
        }
    };

    if (!isMounted) return null;

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] text-zinc-400 gap-4">
                <ShieldAlert className="w-16 h-16 text-zinc-700" />
                <h2 className="text-xl font-medium">Access Denied</h2>
                <p className="text-zinc-500">Please log in as an administrator to view this page.</p>
                <Link href="/admin/login">
                    <Button variant="default" className="bg-#D4AF37 text-black hover:bg-#8C7326">
                        Go to Login
                    </Button>
                </Link>
            </div>
        );
    }

    if (!data) return (
        <div className="space-y-8 max-w-7xl mx-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800" />
                ))}
            </div>
            <div className="h-96 bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800" />
        </div>
    );

    const { summary } = data;

    return (
        <div className="space-y-8 text-white max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-1">User Directory</h1>
                    <p className="text-zinc-500">Monitor access, manage roles, and review account statuses.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Community</CardTitle>
                        <Users className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{summary.totalUsers}</div>
                        <p className="text-xs text-zinc-500 mt-1">Registered accounts</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Organizers</CardTitle>
                        <Briefcase className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{summary.organizerCount}</div>
                        <p className="text-xs text-zinc-500 mt-1">Event creators</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">New Arrivals</CardTitle>
                        <UserPlus className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{summary.newUsersCount}</div>
                        <p className="text-xs text-zinc-500 mt-1">In the last 7 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search by name or email..."
                        className="bg-zinc-950/50 border-zinc-800 text-white pl-10 h-11 focus:ring-#D4AF37"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full md:w-[180px] bg-zinc-950/50 border-zinc-800 text-zinc-400 h-11">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Administrators</SelectItem>
                            <SelectItem value="organizer">Organizers</SelectItem>
                            <SelectItem value="attendee">Attendees</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest pl-6">Profile</TableHead>
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Authority</TableHead>
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Joined On</TableHead>
                            <TableHead className="text-right text-zinc-400 font-bold uppercase text-[10px] tracking-widest pr-6">Management</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user: any) => (
                            <TableRow key={user._id} className="border-zinc-800/50 hover:bg-zinc-800/20 transition-all group">
                                <TableCell className="py-5 pl-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-11 h-11 border-2 border-zinc-800 shadow-lg">
                                            <AvatarImage src={user.avatarUrl} />
                                            <AvatarFallback className="bg-zinc-800 text-zinc-400 font-black text-sm uppercase">
                                                {user.name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white group-hover:text-#D4AF37 transition-colors uppercase tracking-tight">{user.name}</span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Mail className="w-3 h-3 text-zinc-600" />
                                                <span className="text-xs text-zinc-500 font-medium lowercase tracking-tight">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`gap-1.5 px-2.5 py-1 font-black text-[10px] uppercase border-none rounded-full ${user.role === 'admin'
                                            ? 'bg-#D4AF37/10 text-#D4AF37'
                                            : user.role === 'organizer'
                                                ? 'bg-blue-500/10 text-blue-500'
                                                : 'bg-zinc-800 text-zinc-400'
                                            }`}
                                    >
                                        {user.role === 'admin' && <Crown className="w-3 h-3" />}
                                        {user.role === 'organizer' && <Award className="w-3 h-3" />}
                                        {!user.role || user.role === 'attendee' ? 'Attendee' : user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        {(user.status === "active" || !user.status) ? (
                                            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Banned</span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-zinc-500 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-700" />
                                        {new Date(user._creationTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-10 w-10 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-white shadow-2xl p-1 rounded-xl">
                                            <DropdownMenuLabel className="text-[10px] uppercase text-zinc-500 font-black px-3 py-2">Account Authority</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                className="hover:bg-zinc-900 cursor-pointer focus:bg-zinc-900 rounded-lg py-2 transition-colors px-3 font-medium"
                                                onClick={() => handleRoleChange(user._id, "organizer")}
                                            >
                                                <Award className="mr-3 h-4 w-4 text-blue-500" /> Promote to Organizer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="hover:bg-zinc-900 cursor-pointer focus:bg-zinc-900 rounded-lg py-2 transition-colors px-3 font-medium"
                                                onClick={() => handleRoleChange(user._id, "admin")}
                                            >
                                                <Crown className="mr-3 h-4 w-4 text-#D4AF37" /> Grant Admin Access
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-zinc-800 my-1" />
                                            <DropdownMenuLabel className="text-[10px] uppercase text-zinc-500 font-black px-3 py-2">Moderation</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                className={`hover:bg-zinc-900 cursor-pointer focus:bg-zinc-900 rounded-lg py-2 transition-colors px-3 font-bold ${(user.status === "active" || !user.status) ? "text-red-400 focus:text-red-400" : "text-emerald-400 focus:text-emerald-400"
                                                    }`}
                                                onClick={() => handleToggleStatus(user._id, user.status)}
                                            >
                                                {(user.status === "active" || !user.status) ? (
                                                    <><ShieldAlert className="mr-3 h-4 w-4" /> Suspend Account</>
                                                ) : (
                                                    <><ShieldCheck className="mr-3 h-4 w-4" /> Restore Access</>
                                                )}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-4 border border-zinc-800/50">
                            <Users className="w-8 h-8 text-zinc-700" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">No community members found</h3>
                        <p className="text-zinc-500 text-sm max-w-[250px]">Adjust your search keywords or role filters to see results.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

