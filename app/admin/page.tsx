"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BarChart3, DollarSign, Activity, TrendingUp } from "lucide-react";

// Fallback components if ui/card is missing (unlikely but safe)
// const Card = ({className, children}) => <div className={`rounded-xl border ${className}`}>{children}</div>
// ...

import { OverviewChart } from "@/components/admin/overview-chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
    const { token } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    // 1. Wait for Hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 2. Query only if Mounted and Token exists
    const stats = useQuery(api.admin.getAdminStats,
        isMounted && token ? { token } : "skip"
    );
    const analyticsData = useQuery(api.admin.getAnalyticsData,
        isMounted && token ? { token } : "skip"
    );

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

    if (!stats) return <div className="p-10 text-zinc-400 animate-pulse">Loading dashboard stats...</div>;

    return (
        <div className="space-y-8 text-white max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <Link href="/admin/audit">
                    <Button variant="outline" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        Security Audit
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-lg shadow-black/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-[#D4AF37]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-zinc-500 mt-1">Registered accounts</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-lg shadow-black/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Events</CardTitle>
                        <Calendar className="h-4 w-4 text-[#D4AF37]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEvents}</div>
                        <p className="text-xs text-zinc-500 mt-1">Created events</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-lg shadow-black/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Active Events</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeEventsCount || stats.activeEvents}</div>
                        <p className="text-xs text-zinc-500 mt-1">Currently live</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-lg shadow-black/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-[#D4AF37]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue?.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">Gross ticket sales</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg shadow-black/50">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                        Recent Activity
                    </h3>
                    <div className="space-y-6">
                        {!stats.recentRegistrations?.length ? (
                            <p className="text-zinc-500 italic">No recent activity detected.</p>
                        ) : (
                            stats.recentRegistrations.map((reg: any) => (
                                <div key={reg.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37] transition-colors">
                                            {reg.user?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{reg.user}</p>
                                            <p className="text-sm text-zinc-400">Purchased ticket for <span className="text-zinc-300">{reg.event || "Event"}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#D4AF37]">+${reg.amount}</p>
                                        <p className="text-xs text-zinc-500">{new Date(reg.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg shadow-black/50 overflow-hidden">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
                        Trends
                    </h3>
                    {!analyticsData ? (
                        <div className="flex items-center justify-center h-[300px] text-zinc-500 animate-pulse">
                            Loading trends...
                        </div>
                    ) : (
                        <OverviewChart data={analyticsData} />
                    )}
                </div>
            </div>
        </div>
    );
}

