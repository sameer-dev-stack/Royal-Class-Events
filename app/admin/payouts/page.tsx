"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { useState, useEffect } from "react";
import {
    DollarSign, CheckCircle2, Clock, AlertTriangle, Loader2,
    Unlock, Building2, User, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminPayoutsPage() {
    const { token, isAuthenticated } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);
    const [releaseDialog, setReleaseDialog] = useState(null);
    const [adminNote, setAdminNote] = useState("");
    const [isReleasing, setIsReleasing] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const heldEscrows = useQuery(
        api.finance.getHeldEscrows,
        isMounted && token ? { token } : "skip"
    );

    const pendingWithdrawals = useQuery(
        api.finance.getPendingWithdrawals,
        isMounted && token ? { token } : "skip"
    );

    const platformStats = useQuery(
        api.finance.getPlatformFinanceSummary,
        isMounted && token ? { token } : "skip"
    );

    const releaseEscrow = useMutation(api.finance.releaseEscrow);
    const processWithdrawal = useMutation(api.finance.processWithdrawal);

    const handleReleaseEscrow = async () => {
        if (!releaseDialog) return;
        setIsReleasing(true);

        try {
            const result = await releaseEscrow({
                token,
                transactionId: releaseDialog._id,
                note: adminNote,
            });

            toast.success(result.message);
            setReleaseDialog(null);
            setAdminNote("");
        } catch (err) {
            toast.error(err.message || "Failed to release escrow.");
        } finally {
            setIsReleasing(false);
        }
    };

    const handleApproveWithdrawal = async (withdrawalId) => {
        try {
            const result = await processWithdrawal({
                token,
                withdrawalId,
                action: "approve",
            });
            toast.success(result.message);
        } catch (err) {
            toast.error(err.message || "Failed to process withdrawal.");
        }
    };

    if (!isMounted) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-#D4AF37" />
            </div>
        );
    }

    if (!isAuthenticated || !token) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <AlertTriangle className="w-16 h-16 text-red-500" />
                <p className="text-zinc-400">Admin access required.</p>
            </div>
        );
    }

    const formatDate = (ts) => new Date(ts).toLocaleDateString("en-BD", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    const formatCurrency = (amount) => `৳ ${amount?.toLocaleString() || 0}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-500" />
                    Payout Management
                </h1>
                <p className="text-zinc-400 mt-1">Release escrow funds and process vendor withdrawals</p>
            </div>

            {/* Platform Stats */}
            {platformStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Total GMV</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {formatCurrency(platformStats.totalGMV)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Commission Earned</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">
                                {formatCurrency(platformStats.totalCommission)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Total Payouts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-400">
                                {formatCurrency(platformStats.totalPayouts)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Pending Payouts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-#F7E08B">
                                {formatCurrency(platformStats.pendingPayoutAmount)}
                            </div>
                            <p className="text-xs text-zinc-500">{platformStats.pendingPayoutCount} requests</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Held Escrows - Ready for Release */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-#D4AF37" />
                        Held Escrows (Ready for Release)
                    </CardTitle>
                    <CardDescription>
                        Funds held in escrow. Release to credit vendor wallet (10% commission deducted).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {heldEscrows === undefined ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-#D4AF37" />
                        </div>
                    ) : heldEscrows.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                            <p>No held escrows. All funds released!</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800">
                                    <TableHead className="text-zinc-400">Date</TableHead>
                                    <TableHead className="text-zinc-400">Vendor</TableHead>
                                    <TableHead className="text-zinc-400">Client</TableHead>
                                    <TableHead className="text-zinc-400">Lead Status</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Amount</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {heldEscrows.map((txn) => (
                                    <TableRow key={txn._id} className="border-zinc-800">
                                        <TableCell className="text-zinc-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-zinc-500" />
                                                {formatDate(txn.timestamp)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-#D4AF37" />
                                                <span className="text-white font-medium">{txn.supplierName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-zinc-500" />
                                                <span className="text-zinc-300">{txn.payerName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                txn.leadStatus === "booked" ? "bg-green-500/20 text-green-400" :
                                                    txn.leadStatus === "completed" ? "bg-blue-500/20 text-blue-400" :
                                                        "bg-zinc-700 text-zinc-300"
                                            }>
                                                {txn.leadStatus || "Unknown"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-white">
                                            {formatCurrency(txn.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => setReleaseDialog(txn)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Unlock className="w-4 h-4 mr-1" />
                                                Release
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pending Withdrawal Requests */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-500" />
                        Pending Withdrawal Requests
                    </CardTitle>
                    <CardDescription>
                        Vendors requesting payout from their wallet balance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingWithdrawals === undefined ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-#D4AF37" />
                        </div>
                    ) : pendingWithdrawals.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                            <p>No pending withdrawal requests.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800">
                                    <TableHead className="text-zinc-400">Date</TableHead>
                                    <TableHead className="text-zinc-400">Vendor</TableHead>
                                    <TableHead className="text-zinc-400">Method</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Amount</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingWithdrawals.map((w) => (
                                    <TableRow key={w._id} className="border-zinc-800">
                                        <TableCell className="text-zinc-300">
                                            {formatDate(w.requestedAt)}
                                        </TableCell>
                                        <TableCell className="text-white font-medium">
                                            {w.supplierName}
                                        </TableCell>
                                        <TableCell className="text-zinc-300 capitalize">
                                            {w.paymentMethod?.replace("_", " ")}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-white">
                                            {formatCurrency(w.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleApproveWithdrawal(w._id)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                Approve
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Release Escrow Dialog */}
            <Dialog open={!!releaseDialog} onOpenChange={() => setReleaseDialog(null)}>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-white">Release Escrow Funds</DialogTitle>
                        <DialogDescription>
                            This will credit the vendor's wallet balance (after 10% commission).
                        </DialogDescription>
                    </DialogHeader>

                    {releaseDialog && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-zinc-500">Vendor</p>
                                    <p className="text-white font-medium">{releaseDialog.supplierName}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500">Total Amount</p>
                                    <p className="text-white font-bold">{formatCurrency(releaseDialog.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500">Commission (10%)</p>
                                    <p className="text-#F7E08B font-medium">
                                        {formatCurrency(Math.round(releaseDialog.amount * 0.10))}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-zinc-500">Vendor Receives</p>
                                    <p className="text-green-400 font-bold">
                                        {formatCurrency(releaseDialog.amount - Math.round(releaseDialog.amount * 0.10))}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label>Admin Note (Optional)</Label>
                                <Textarea
                                    placeholder="Add a note for this release..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800 mt-1"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReleaseDialog(null)}>Cancel</Button>
                        <Button
                            onClick={handleReleaseEscrow}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isReleasing}
                        >
                            {isReleasing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Unlock className="w-4 h-4 mr-2" />
                            )}
                            Release Funds
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

