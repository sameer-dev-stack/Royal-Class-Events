"use client";

import { useParams, useRouter } from "next/navigation";
import { useEventAnalytics } from "@/hooks/use-event-analytics";
import { ArrowLeft, TrendingUp, Users, Eye, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { format } from "date-fns";

export default function EventAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId;

    const { data: analyticsData, isLoading } = useEventAnalytics(eventId);
    const event = analyticsData?.event;

    if (isLoading || !event) {
        return (
            <div className="min-h-screen bg-black/95 text-white p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32 bg-white/10" />
                        <Skeleton className="h-10 w-64 bg-white/10" />
                        <Skeleton className="h-4 w-48 bg-white/10" />
                    </div>

                    {/* KPI Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-xl bg-white/5 border border-white/10" />
                        ))}
                    </div>

                    {/* Charts Grid Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="h-[400px] rounded-xl bg-white/5 border border-white/10" />
                        <Skeleton className="h-[400px] rounded-xl bg-white/5 border border-white/10" />
                    </div>
                </div>
            </div>
        );
    }

    // Format data for charts
    const chartData = analyticsData?.snapshots.map(snapshot => ({
        date: format(new Date(snapshot.date), 'MMM dd'),
        revenue: snapshot.revenue,
        views: snapshot.views,
        registrations: snapshot.registrations,
    })) || [];

    return (
        <div className="min-h-screen bg-black/95 text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/60 mb-2">
                            <Button
                                variant="ghost"
                                onClick={() => router.push(`/ my - events / ${eventId} `)}
                                className="p-0 hover:bg-transparent hover:text-white"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            {event.title?.en || event.title} Analytics
                        </h1>
                        <p className="text-white/60">Real-time performance metrics and insights</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white/80">Total Revenue</CardTitle>
                            <DollarSign className="w-4 h-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">৳{analyticsData?.totalRevenue?.toLocaleString() || 0}</div>
                            <p className="text-xs text-white/50">{analyticsData?.revenueGrowth > 0 ? '+' : ''}{analyticsData?.revenueGrowth}% from last week</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white/80">Total Views</CardTitle>
                            <Eye className="w-4 h-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analyticsData?.totalViews?.toLocaleString() || 0}</div>
                            <p className="text-xs text-white/50">Page visits</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white/80">Ticket Sales</CardTitle>
                            <Users className="w-4 h-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analyticsData?.totalRegistrations || 0}</div>
                            <p className="text-xs text-white/50">{((analyticsData?.totalRegistrations / (event.capacityConfig?.totalCapacity || event.capacity)) * 100).toFixed(1)}% of capacity</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white/80">Conversion Rate</CardTitle>
                            <TrendingUp className="w-4 h-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analyticsData?.totalViews > 0
                                    ? ((analyticsData.totalRegistrations / analyticsData.totalViews) * 100).toFixed(2)
                                    : 0}%
                            </div>
                            <p className="text-xs text-white/50">Visits to sales</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Chart */}
                    <Card className="bg-white/5 border-white/10 text-white col-span-1">
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription className="text-white/50">Daily revenue over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="date" stroke="#888" tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value} `} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#4ade80" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Views vs Sales */}
                    <Card className="bg-white/5 border-white/10 text-white col-span-1">
                        <CardHeader>
                            <CardTitle>Traffic & Conversions</CardTitle>
                            <CardDescription className="text-white/50">Page views vs ticket sales</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="date" stroke="#888" tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="views" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Page Views" />
                                    <Bar dataKey="registrations" fill="#a855f7" radius={[4, 4, 0, 0]} name="Sales" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Dynamic Pricing Log */}
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Dynamic Pricing Log</CardTitle>
                        <CardDescription className="text-white/50">History of automated price adjustments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analyticsData?.priceHistory?.length > 0 ? (
                            <div className="space-y-4">
                                {analyticsData.priceHistory.map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-purple-500/20 rounded-full">
                                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">Price adjusted to ৳{entry.price}</div>
                                                <div className="text-sm text-white/50">Reason: {entry.reason || "Automated adjustment"}</div>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-white/60">
                                            <div>{format(new Date(entry.timestamp), "MMM dd, yyyy")}</div>
                                            <div>{format(new Date(entry.timestamp), "hh:mm a")}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-white/40">
                                No price adjustments recorded yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
