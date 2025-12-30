"use client";

import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, Activity } from "lucide-react";
import { BarLoader } from "react-spinners";

export default function AdminDashboardPage() {
    const { data: stats, isLoading } = useConvexQuery(api.admin.getDashboardStats);

    if (isLoading) {
        return <div className="p-12 text-center text-muted-foreground">Loading dashboard data...</div>;
    }

    // Fallback if data isn't ready
    const safeStats = stats || {
        totalUsers: 0,
        newUsers: 0,
        totalEvents: 0,
        activeEvents: 0,
        totalRevenue: 0
    };

    const cards = [
        {
            title: "Total Revenue",
            value: `৳${safeStats.totalRevenue.toLocaleString()}`,
            change: "+12.5% from last month",
            icon: DollarSign,
            color: "text-emerald-500"
        },
        {
            title: "Total Users",
            value: safeStats.totalUsers.toLocaleString(),
            change: `+${safeStats.newUsers} new this month`,
            icon: Users,
            color: "text-blue-500"
        },
        {
            title: "Active Events",
            value: safeStats.activeEvents.toLocaleString(),
            change: `${safeStats.totalEvents} total created`,
            icon: Calendar,
            color: "text-amber-500"
        },
        {
            title: "Platform Activity",
            value: "98.2%",
            change: "Server Uptime",
            icon: Activity,
            color: "text-purple-500"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Dashboard Overview
                </h1>
                <p className="text-zinc-400 mt-2">Welcome back, Super Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, idx) => (
                    <Card key={idx} className="bg-zinc-900 border-white/5 hover:border-white/10 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{card.value}</div>
                            <p className="text-xs text-zinc-500 pt-1">
                                {card.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity (Placeholder for visual completeness) */}
            <Card className="bg-zinc-900 border-white/5">
                <CardHeader>
                    <CardTitle className="text-white">Recent System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">New user registration</p>
                                    <p className="text-xs text-zinc-500">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
