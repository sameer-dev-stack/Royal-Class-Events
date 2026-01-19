"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ShieldAlert,
    ShieldCheck,
    Calendar,
    Search,
    Filter,
    UserCircle,
    Activity,
    AlertCircle,
    Info,
    Trash2,
    Edit3,
    UserPlus,
    Lock
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function AuditPage() {
    const { token } = useAuthStore();
    const [actionFilter, setActionFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const logs = useQuery(api.audit.getAuditLogs, {
        actionType: actionFilter,
        token: token || undefined
    });

    const filteredLogs = logs?.filter(log => {
        const adminMatch = log.adminName.toLowerCase().includes(searchTerm.toLowerCase());
        const targetMatch = log.targetId?.toLowerCase().includes(searchTerm.toLowerCase());
        return adminMatch || targetMatch;
    });

    if (logs === undefined) {
        return <div className="text-zinc-400 p-10 animate-pulse">Scanning audit database...</div>;
    }

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'USER_STATUS_CHANGE':
            case 'USER_STATUS_CHANGE_V2':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1.5 px-3 py-1 font-black uppercase text-[10px] tracking-widest"><ShieldAlert className="w-3 h-3" /> Moderation</Badge>;
            case 'USER_ROLE_CHANGE':
                return <Badge className="bg-#D4AF37/10 text-#D4AF37 border-#D4AF37/20 gap-1.5 px-3 py-1 font-black uppercase text-[10px] tracking-widest"><CrownIcon className="w-3 h-3" /> Promotion</Badge>;
            case 'EVENT_DELETE':
                return <Badge className="bg-rose-600/10 text-rose-500 border-rose-500/20 gap-1.5 px-3 py-1 font-black uppercase text-[10px] tracking-widest"><Trash2 className="w-3 h-3" /> Suppression</Badge>;
            case 'EVENT_STATUS_TOGGLE':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 px-3 py-1 font-black uppercase text-[10px] tracking-widest"><Activity className="w-3 h-3" /> Visibility</Badge>;
            case 'VENDOR_PAYOUT_PROCESSED':
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 px-3 py-1 font-black uppercase text-[10px] tracking-widest"><ShieldCheck className="w-3 h-3" /> Disbursement</Badge>;
            default:
                return <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 gap-1.5 px-3 py-1 font-black uppercase text-[10px] tracking-widest"><Info className="w-3 h-3" /> General</Badge>;
        }
    };

    return (
        <div className="space-y-8 text-white max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tight mb-2 italic">Security Audit Logs</h2>
                    <p className="text-zinc-500">Immutable trail of administrative power. Every action is recorded.</p>
                </div>
                <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/10 px-4 py-2 rounded-2xl">
                    <Lock className="w-4 h-4 text-red-500/50" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500/70 italic">End-to-End Encryption</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search by Admin name or Target ID..."
                        className="bg-zinc-950/50 border-zinc-800 text-white pl-10 h-11 focus:ring-red-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-full md:w-[220px] bg-zinc-950/50 border-zinc-800 text-zinc-400 h-11">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="All Actions" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="USER_STATUS_CHANGE">Moderation (Ban/Active)</SelectItem>
                            <SelectItem value="USER_ROLE_CHANGE">Promotions (Roles)</SelectItem>
                            <SelectItem value="EVENT_STATUS_TOGGLE">Event Visibility</SelectItem>
                            <SelectItem value="EVENT_DELETE">Event Deletions</SelectItem>
                            <SelectItem value="VENDOR_PAYOUT_PROCESSED">Finance (Payouts)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Audit Table */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-zinc-400 font-black uppercase text-[10px] tracking-widest pl-6">Executor (Admin)</TableHead>
                            <TableHead className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Protocol (Action)</TableHead>
                            <TableHead className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Target Subject</TableHead>
                            <TableHead className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Timestamp</TableHead>
                            <TableHead className="text-right text-zinc-400 font-black uppercase text-[10px] tracking-widest pr-6">Data Payload</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs?.map((log) => (
                            <TableRow key={log._id} className="border-zinc-800/50 hover:bg-zinc-800/10 transition-all group">
                                <TableCell className="py-5 pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors">
                                            <UserCircle className="w-4 h-4 text-zinc-500" />
                                        </div>
                                        <span className="font-bold text-white uppercase tracking-tight text-sm">{log.adminName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getActionBadge(log.action)}
                                </TableCell>
                                <TableCell>
                                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800">
                                        {log.targetId || "N/A"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-zinc-600 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-800" />
                                        {format(new Date(log.timestamp), "MMM d, yyyy • HH:mm:ss")}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" className="h-9 px-4 text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg">
                                                Inspect Payload
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-3xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-black italic uppercase text-zinc-400 flex items-center gap-3">
                                                    <Activity className="w-6 h-6" /> Data Payload Inspect
                                                </DialogTitle>
                                                <DialogDescription className="text-zinc-500">
                                                    Historical context captured at the moment of execution.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="mt-4 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 font-mono text-xs overflow-auto max-h-[400px]">
                                                <pre className="text-emerald-500">{JSON.stringify(log.details, null, 2)}</pre>
                                            </div>
                                            <div className="mt-2 text-[10px] text-zinc-700 font-black uppercase text-center">
                                                Checksum Valid • Hash: {log._id.substring(0, 16)}...
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredLogs?.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-4 border border-zinc-800/50">
                            <Activity className="w-8 h-8 text-zinc-800" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Audit Ledger Clean</h3>
                        <p className="text-zinc-500 text-sm">No actions recorded matching your parameters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function CrownIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
        </svg>
    )
}

