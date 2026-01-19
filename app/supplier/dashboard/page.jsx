"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
    Users,
    Eye,
    Sparkles,
    MessageSquare,
    Calendar,
    DollarSign,
    Loader2,
    ArrowUpRight,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SupplierDashboardPage() {
    const { token } = useAuthStore();

    const data = useQuery(
        api.suppliers.getDashboardStats,
        token ? { token } : "skip"
    );

    // 1. Loading State
    if (data === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-#D4AF37 animate-spin" />
            </div>
        );
    }

    if (!data?.isSupplier) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md mx-auto p-8 rounded-3xl bg-card border border-border">
                    <Search className="w-12 h-12 mx-auto text-#D4AF37/50" />
                    <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
                    <p className="text-muted-foreground">{data?.message || "You must be a registered vendor to access this dashboard."}</p>
                    <Button asChild className="bg-#D4AF37 hover:bg-#8C7326 text-black">
                        <Link href="/supplier/join">Join as Vendor</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const { stats, recentLeads } = data;

    const statCards = [
        {
            title: "Total Leads",
            value: stats.totalLeads,
            icon: Users,
            color: "text-#D4AF37",
        },
        {
            title: "New Requests",
            value: stats.newLeads,
            icon: Sparkles,
            color: "text-#D4AF37",
        },
        {
            title: "Profile Views",
            value: stats.profileViews,
            icon: Eye,
            color: "text-#D4AF37",
        },
    ];

    const getStatusStyle = (status) => {
        const styles = {
            new: "bg-#D4AF37/10 text-#D4AF37 border-#D4AF37/20",
            contacted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            quoted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
            booked: "bg-green-500/10 text-green-400 border-green-500/20",
            declined: "bg-red-500/10 text-red-400 border-red-500/20",
        };
        return styles[status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    };

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Overview</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Manage your incoming leads and track performance.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card border border-border p-8 rounded-3xl relative overflow-hidden group hover:border-#D4AF37/30 transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-#D4AF37/5 rounded-full blur-3xl -z-10 group-hover:bg-#D4AF37/10 transition-colors" />

                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-#D4AF37/10 rounded-2xl">
                                <card.icon className="w-6 h-6 text-#D4AF37" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-zinc-800 group-hover:text-#D4AF37/50 transition-colors" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-4xl font-bold text-foreground tracking-tight leading-none">
                                {card.value}
                            </p>
                            <p className="text-muted-foreground font-medium text-sm uppercase tracking-wider">
                                {card.title}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Leads */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Recent Leads</h2>
                    <Button asChild variant="ghost" className="text-#D4AF37 hover:text-#8C7326 dark:hover:text-#F7E08B hover:bg-#D4AF37/5">
                        <Link href="/messages">View All Messages</Link>
                    </Button>
                </div>

                <div className="bg-card border border-border rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                    {recentLeads.length === 0 ? (
                        <div className="p-16 text-center space-y-6">
                            <div className="w-20 h-20 bg-#D4AF37/10 rounded-full flex items-center justify-center mx-auto">
                                <MessageSquare className="w-10 h-10 text-#D4AF37/50" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-foreground">Waiting for leads...</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    Your business is visible to planners, but you haven't received any inquiries yet.
                                </p>
                            </div>
                            <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl inline-block">
                                <p className="text-sm text-#F7E08B flex items-center gap-2 font-medium">
                                    <Sparkles className="w-4 h-4" />
                                    Tip: Share your profile on social media to get started!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-widest">
                                        <th className="px-8 py-6">Client</th>
                                        <th className="px-6 py-6 font-bold">Event Date</th>
                                        <th className="px-6 py-6 font-bold">Budget</th>
                                        <th className="px-6 py-6 font-bold text-center">Status</th>
                                        <th className="px-8 py-6 text-right font-bold tracking-widest leading-none">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {recentLeads.map((lead) => (
                                        <tr key={lead._id} className="group hover:bg-muted/10 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="font-semibold text-foreground">{lead.clientName}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Inquiry received</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-foreground/80">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    {lead.eventDate ? format(new Date(lead.eventDate), "MMM d, yyyy") : "—"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-foreground/80 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                                                    {lead.budget ? lead.budget.toLocaleString() : "—"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors",
                                                    getStatusStyle(lead.status)
                                                )}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Button asChild size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-#D4AF37/10 hover:text-#D4AF37 transition-all rounded-xl border border-border hover:border-#D4AF37/30">
                                                    <Link href={`/messages/${lead._id}`}>
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

