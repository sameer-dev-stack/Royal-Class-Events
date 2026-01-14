"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import { Loader2, Building2, DollarSign, Users, ExternalLink, Star, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MerchantsPage() {
    const { data: session } = useSession();
    const merchants = useQuery(api.admin.getMerchantMetrics, {
        token: session?.customToken
    });

    // Calculate totals for summary cards
    const totalRevenue = merchants?.reduce((sum, m) => sum + m.totalSales, 0) || 0;
    const totalCommission = merchants?.reduce((sum, m) => sum + m.commission, 0) || 0;
    const totalActiveLeads = merchants?.reduce((sum, m) => sum + m.activeLeads, 0) || 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-amber-500" />
                        Merchant Operations
                    </h1>
                    <p className="text-zinc-400 mt-1">Track vendor sales, commissions, and performance</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="py-4">
                        <CardDescription className="text-zinc-400">Total Merchants</CardDescription>
                        <CardTitle className="text-2xl text-white">{merchants?.length || 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="py-4">
                        <CardDescription className="text-zinc-400">Total Revenue</CardDescription>
                        <CardTitle className="text-2xl text-green-400">৳ {totalRevenue.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="py-4">
                        <CardDescription className="text-zinc-400">Commission Earned</CardDescription>
                        <CardTitle className="text-2xl text-amber-500">৳ {totalCommission.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="py-4">
                        <CardDescription className="text-zinc-400">Active Leads</CardDescription>
                        <CardTitle className="text-2xl text-white">{totalActiveLeads}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Merchants Table */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white">All Merchants</CardTitle>
                    <CardDescription>Vendor performance and earnings overview</CardDescription>
                </CardHeader>
                <CardContent>
                    {merchants === undefined ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        </div>
                    ) : merchants.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No merchants registered yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-400">Vendor</TableHead>
                                    <TableHead className="text-zinc-400">Category</TableHead>
                                    <TableHead className="text-zinc-400">Location</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Total Revenue</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Commission (10%)</TableHead>
                                    <TableHead className="text-zinc-400 text-center">Leads</TableHead>
                                    <TableHead className="text-zinc-400 text-center">Status</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {merchants.map((merchant) => (
                                    <TableRow key={merchant._id} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                                                    {merchant.name?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{merchant.name}</p>
                                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                        {merchant.verified && (
                                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                        )}
                                                        {merchant.rating > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                                {merchant.rating.toFixed(1)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                                                {merchant.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-300">{merchant.location}</TableCell>
                                        <TableCell className="text-right font-medium text-green-400">
                                            ৳ {merchant.totalSales.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-amber-500">
                                            ৳ {merchant.commission.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={merchant.activeLeads > 0 ? "bg-blue-500/20 text-blue-400" : "bg-zinc-700 text-zinc-400"}>
                                                {merchant.activeLeads}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {merchant.status === "active" ? (
                                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-zinc-700 text-zinc-400">
                                                    {merchant.status}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/marketplace/vendor/${merchant._id}`}>
                                                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-amber-500">
                                                    View <ExternalLink className="w-3 h-3 ml-1" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
