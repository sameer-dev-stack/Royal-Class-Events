"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Trash2,
    Eye,
    Calendar,
    AlertTriangle,
    Search,
    CheckCircle2,
    Clock,
    Building2,
    DollarSign,
    TrendingUp,
    ExternalLink,
    Filter,
    ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function EventsPage() {
    const { token } = useAuthStore();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    // 1. Wait for Hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 2. Query only if Mounted and Token exists
    const data = useQuery(api.admin.getAllEvents,
        isMounted && token ? { token } : "skip"
    );
    const deleteEvent = useMutation(api.admin.adminDeleteEvent);
    const toggleStatus = useMutation(api.admin.adminToggleEventStatus);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredEvents = useMemo(() => {
        if (!data?.events) return [];
        return data.events.filter((event: any) => {
            const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.organizerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || event.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [data?.events, searchTerm, statusFilter]);

    const handleDelete = async (eventId: string) => {
        try {
            await deleteEvent({ eventId: eventId as any, token: token || undefined });
            toast.success("Event deleted permanently");
        } catch (err: any) {
            toast.error(err.message || "Failed to delete event");
        }
    };

    const handleToggleStatus = async (eventId: string, currentStatus: string) => {
        const newStatus = currentStatus === "published" ? "draft" : "published";
        try {
            await toggleStatus({
                eventId: eventId as any,
                status: newStatus,
                token: token || undefined
            });
            toast.success(`Event status updated to ${newStatus}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to update status");
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
                    <Button variant="default" className="bg-[#D4AF37] text-black hover:bg-[#8C7326]">
                        Go to Login
                    </Button>
                </Link>
            </div>
        );
    }

    if (!data) return (
        <div className="space-y-8 max-w-7xl mx-auto p-8 border border-zinc-900 rounded-3xl bg-zinc-950/50">
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
                    <h1 className="text-4xl font-black tracking-tight text-white mb-1">Platform Events</h1>
                    <p className="text-zinc-500">Manage, verify, and monitor all platform activity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 gap-2 shrink-0"
                        onClick={() => router.push('/marketplace')}
                    >
                        <ExternalLink className="w-4 h-4" />
                        Marketplace
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Live Events</CardTitle>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{summary.liveCount}</div>
                        <p className="text-xs text-zinc-500 mt-1">Ready for bookings</p>
                    </CardContent>
                    <div className="h-1 bg-emerald-500/20 w-full" />
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Drafts</CardTitle>
                        <Clock className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{summary.draftCount}</div>
                        <p className="text-xs text-zinc-500 mt-1">Pending publication</p>
                    </CardContent>
                    <div className="h-1 bg-[#D4AF37]/20 w-full" />
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Platform Revenue</CardTitle>
                        <TrendingUp className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">${summary.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">Total across all events</p>
                    </CardContent>
                    <div className="h-1 bg-blue-500/20 w-full" />
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search events or organizers..."
                        className="bg-zinc-950/50 border-zinc-800 text-white pl-10 h-11 focus:ring-[#D4AF37]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[180px] bg-zinc-950/50 border-zinc-800 text-zinc-400 h-11">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest pl-6">Event Details</TableHead>
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Organizer</TableHead>
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Revenue</TableHead>
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest text-center">Live Status</TableHead>
                            <TableHead className="text-right text-zinc-400 font-bold uppercase text-[10px] tracking-widest pr-6">Manage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEvents.map((event: any) => (
                            <TableRow key={event._id} className="border-zinc-800/50 hover:bg-zinc-800/20 transition-all group">
                                <TableCell className="py-5 pl-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex-shrink-0 shadow-lg">
                                            {event.coverImage ? (
                                                <img src={event.coverImage} className="w-full h-full object-cover" alt={event.title} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                                    <Building2 className="w-6 h-6 text-zinc-700" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-base group-hover:text-[#D4AF37] transition-colors">{event.title}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-3 h-3 text-zinc-500" />
                                                <span className="text-xs text-zinc-500 font-medium tracking-tight">
                                                    {event.startDate ? new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBD"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8 ring-2 ring-zinc-800">
                                            <AvatarImage src={event.organizerAvatar} />
                                            <AvatarFallback className="bg-[#D4AF37]/10 text-[#D4AF37] text-[10px]">{event.organizerName?.[0] || 'O'}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-zinc-300">{event.organizerName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">${event.revenue.toLocaleString()}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase font-black">Success txs</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Switch
                                            checked={event.status === "published"}
                                            onCheckedChange={() => handleToggleStatus(event._id, event.status)}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] uppercase font-black px-1.5 py-0 border-none ${event.status === 'published'
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : 'bg-zinc-800 text-zinc-500'
                                                }`}
                                        >
                                            {event.status}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-10 w-10 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-zinc-800 text-white shadow-2xl p-1">
                                            <DropdownMenuItem
                                                className="hover:bg-zinc-900 cursor-pointer focus:bg-zinc-900 rounded-lg py-2.5 transition-colors"
                                                onClick={() => router.push(`/events/${event._id}`)}
                                            >
                                                <Eye className="mr-3 h-4 w-4 text-blue-500" />
                                                <span className="font-medium">Preview Event</span>
                                            </DropdownMenuItem>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <div className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 text-sm outline-none transition-colors hover:bg-red-500/10 focus:bg-red-500/10 text-red-500 focus:text-red-500 mt-1">
                                                        <Trash2 className="mr-3 h-4 w-4" />
                                                        <span className="font-bold uppercase tracking-tight text-xs">Delete Permanently</span>
                                                    </div>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-3xl animate-in zoom-in-95 duration-200">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="flex items-center gap-3 text-red-500 text-2xl font-black italic uppercase">
                                                            <AlertTriangle className="w-8 h-8" /> Alert!
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-zinc-400 text-base">
                                                            This action is irreversible. You are about to permanently delete the event:
                                                            <div className="mt-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                                                                <strong className="text-white text-lg">{event.title}</strong>
                                                                <p className="text-xs text-zinc-500">ID: {event._id}</p>
                                                            </div>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-8 gap-3">
                                                        <AlertDialogCancel className="bg-zinc-800 border-none text-white hover:bg-zinc-700 h-12 rounded-2xl px-6">Dismiss</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(event._id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white border-none h-12 rounded-2xl px-8 font-black uppercase tracking-widest shadow-lg shadow-red-900/20"
                                                        >
                                                            Delete Forever
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-4 border border-zinc-800/50">
                            <Filter className="w-8 h-8 text-zinc-700" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">No matching events</h3>
                        <p className="text-zinc-500 text-sm max-w-[250px]">Try adjusting your search or filters to see more results.</p>
                        <Button
                            variant="ghost"
                            className="text-[#D4AF37] hover:text-[#F7E08B] hover:bg-transparent text-sm mt-4 font-bold"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                            }}
                        >
                            Reset all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

