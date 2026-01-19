"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, User, Calendar, Tag, Search, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { OverviewChart } from "@/components/admin/overview-chart";

export default function FinancePage() {
    const { token } = useAuthStore();
    const transactions = useQuery(api.finance.getFinancials, { token: token || undefined });
    const analyticsData = useQuery(api.admin.getAnalyticsData, { token: token || undefined });
    const [searchTerm, setSearchTerm] = useState("");

    if (!transactions) return <div className="text-zinc-400 p-10 animate-pulse">Loading financials...</div>;

    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const filteredTransactions = transactions.filter(tx =>
        tx.payerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 text-white max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>
                <Button
                    onClick={() => window.location.href = "/admin/finance/payouts"}
                    className="bg-[#8C7326] hover:bg-[#8C7326] text-white"
                >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Manage Payouts
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-xl shadow-black/50 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-12 h-12 text-green-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">৳{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">Total revenue processed</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-xl shadow-black/50 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Tag className="w-12 h-12 text-blue-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{transactions.length}</div>
                        <p className="text-xs text-zinc-500 mt-1">Successful payments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Trends Chart */}
            <Card className="bg-zinc-900 border-zinc-800 text-white shadow-xl shadow-black/50 overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                        Revenue & User Growth Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!analyticsData ? (
                        <div className="flex items-center justify-center h-[300px] text-zinc-500 animate-pulse">
                            Loading analytics trends...
                        </div>
                    ) : (
                        <OverviewChart data={analyticsData} />
                    )}
                </CardContent>
            </Card>

            {/* Filter */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                    placeholder="Search by user, event, or type..."
                    className="bg-zinc-900 border-zinc-800 pl-10 h-11 text-white focus:ring-[#D4AF37]/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Transactions Table */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-lg shadow-black/50 transition-all">
                <Table>
                    <TableHeader className="bg-zinc-900">
                        <TableRow className="hover:bg-zinc-900 border-zinc-800">
                            <TableHead className="text-zinc-400 h-12">Date</TableHead>
                            <TableHead className="text-zinc-400">User</TableHead>
                            <TableHead className="text-zinc-400">Event</TableHead>
                            <TableHead className="text-zinc-400">Type</TableHead>
                            <TableHead className="text-zinc-400 text-right">Amount</TableHead>
                            <TableHead className="text-zinc-400 text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.map((tx) => (
                            <TableRow key={tx._id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors group">
                                <TableCell className="text-zinc-400 text-xs whitespace-nowrap py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-zinc-600" />
                                        {tx.timestamp ? format(new Date(tx.timestamp), "MMM d, h:mm a") : "N/A"}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-white">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3 h-3 text-[#D4AF37]/50" />
                                        {tx.payerName}
                                    </div>
                                </TableCell>
                                <TableCell className="text-zinc-400 text-sm max-w-[200px] truncate">
                                    {tx.eventTitle}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize text-[10px] border-zinc-700 text-zinc-500 font-mono">
                                        {tx.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold text-white">
                                    ৳{(tx.amount || 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20 border-green-500/30 capitalize text-[10px]">
                                        {tx.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredTransactions.length === 0 && (
                    <div className="p-20 text-center text-zinc-500">
                        No transactions found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}

