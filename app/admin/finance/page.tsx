"use client";

import { useState } from "react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, DollarSign, ArrowUpRight, ArrowDownRight, Download, CreditCard, History } from "lucide-react";
import { format } from "date-fns";
import useAuthStore from "@/hooks/use-auth-store";
import { Loader2 } from "lucide-react";

export default function AdminFinancePage() {
    const { token } = useAuthStore();
    const [search, setSearch] = useState("");

    // Fetch dashboard stats for the summary cards
    const { data: stats } = useConvexQuery(api.admin.getDashboardStats, { token: token || undefined });

    // Fetch detailed transaction history
    const { data: transactions, isLoading } = useConvexQuery(api.admin.getFinanceData, {
        limit: 50,
        token: token || undefined
    });

    const renderSafeString = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (typeof val === "object") {
            return val.en || val.en_US || Object.values(val)[0] || "";
        }
        return String(val);
    };

    const filteredTransactions = transactions?.filter(tx =>
        tx.userName.toLowerCase().includes(search.toLowerCase()) ||
        renderSafeString(tx.eventTitle).toLowerCase().includes(search.toLowerCase()) ||
        tx.registrationNumber?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finance & Transactions</h1>
                    <p className="text-muted-foreground mt-2">Monitor platform revenue and ticket sales history</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">৳{stats?.totalRevenue?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-green-500" />
                            +12.5% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Sales volume</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{transactions?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Successful registrations processed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Ticket Value</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            ৳{transactions && transactions.length > 0
                                ? Math.round(transactions.reduce((acc, tx) => acc + (tx.amountPaid || 0), 0) / transactions.length).toLocaleString()
                                : 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Based on current sales data
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>A list of all ticket purchases across the platform.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, event or ID..."
                                className="pl-10 bg-background/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border/50 overflow-hidden overflow-x-auto">
                        <div className="min-w-[900px]">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border/50">
                                <div className="col-span-3">User</div>
                                <div className="col-span-3">Event</div>
                                <div className="col-span-2">Reg. ID</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-1 text-right">Amount</div>
                                <div className="col-span-1 text-center">Status</div>
                            </div>

                            {filteredTransactions.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground">
                                    No transaction records found.
                                </div>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <div key={tx._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0 group">
                                        <div className="col-span-3">
                                            <p className="font-medium text-foreground truncate">{tx.userName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{tx.userEmail}</p>
                                        </div>
                                        <div className="col-span-3">
                                            <p className="text-sm font-medium truncate pr-4">{renderSafeString(tx.eventTitle)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{tx.registrationNumber || tx._id.substring(0, 8)}</code>
                                        </div>
                                        <div className="col-span-2 text-sm text-muted-foreground">
                                            {format(new Date(tx._creationTime || Date.now()), "MMM d, yyyy HH:mm")}
                                        </div>
                                        <div className="col-span-1 text-right font-bold text-foreground">
                                            ৳{(tx.amountPaid || tx.unitPrice * tx.ticketQuantity || 0).toLocaleString()}
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <Badge variant="outline" className={
                                                tx.status?.current === 'confirmed'
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : tx.status?.current === 'cancelled'
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                            }>
                                                {tx.status?.current?.toUpperCase() || "PENDING"}
                                            </Badge>
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
