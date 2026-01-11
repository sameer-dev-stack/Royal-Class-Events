"use client";

import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, DollarSign, Activity, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";
import useAuthStore from "@/hooks/use-auth-store";

export default function AdminDashboardPage() {
    const { token } = useAuthStore();
    const { data: stats, isLoading } = useConvexQuery(api.admin.getDashboardStats, { token: token || undefined });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) return <div>Failed to load stats</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
                <p className="text-muted-foreground mt-2">
                    Platform performance metrics and key indicators.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +{stats.newUsers} in last 30 days
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEvents}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.activeEvents} currently active
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.totalRevenue?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Lifetime ecosystem value
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">99.9%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All systems operational
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-7">
                <Card className="col-span-4 shadow-lg border-primary/10">
                    <CardHeader>
                        <CardTitle>User Acquisition Trend</CardTitle>
                        <CardDescription>
                            New user sign-ups over the last 7 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--primary) / 0.1)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888888"
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { weekday: 'short' })}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                                        cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="signups"
                                        fill="hsl(var(--primary))"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Registrations</CardTitle>
                        <CardDescription>
                            Latest ticket purchases across the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentRegistrations.length === 0 && (
                                <p className="text-sm text-muted-foreground">No recent registrations found.</p>
                            )}
                            {stats.recentRegistrations.map((reg) => (
                                <div key={reg._id} className="flex items-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none truncate w-[150px]">
                                            Ticket ID: {reg._id.substring(0, 8)}...
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(reg.registrationDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        +৳{reg.amountPaid || 0}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
