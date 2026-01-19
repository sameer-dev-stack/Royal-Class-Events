"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { useState, useEffect } from "react";
import {
    Wallet, TrendingUp, Clock, ArrowUpRight, Download,
    Loader2, AlertCircle, CheckCircle2, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function VendorFinancePage() {
    const { token, isAuthenticated } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("bkash");
    const [accountDetails, setAccountDetails] = useState({
        accountName: "",
        accountNumber: "",
        bankName: "",
        mobileNumber: "",
    });

    // 1. Wait for Hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 2. Skip query until mounted and authenticated
    const financeStats = useQuery(
        api.finance.getVendorFinanceStats,
        isMounted && token ? { token } : "skip"
    );

    const requestWithdrawal = useMutation(api.finance.requestWithdrawal);

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        try {
            const result = await requestWithdrawal({
                token,
                amount,
                paymentMethod,
                paymentDetails: accountDetails,
            });

            toast.success(result.message);
            setWithdrawOpen(false);
            setWithdrawAmount("");
        } catch (err) {
            toast.error(err.message || "Withdrawal request failed.");
        }
    };

    // 3. Hydration Loading State
    if (!isMounted) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-#D4AF37" />
            </div>
        );
    }

    // 4. Auth Check (after hydration)
    if (!isAuthenticated || !token) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Building2 className="w-16 h-16 text-zinc-600" />
                <p className="text-zinc-400">Please log in to view your finance dashboard.</p>
                <Button asChild className="mt-4 bg-#D4AF37 hover:bg-#8C7326">
                    <a href="/auth/signin">Sign In</a>
                </Button>
            </div>
        );
    }

    // 5. Data Loading State
    if (financeStats === undefined) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-#D4AF37" />
            </div>
        );
    }

    // 6. Not a Supplier
    if (!financeStats.isSupplier) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Building2 className="w-16 h-16 text-zinc-600" />
                <p className="text-zinc-400">{financeStats.message}</p>
            </div>
        );
    }

    const formatDate = (ts) => new Date(ts).toLocaleDateString("en-BD", {
        day: "numeric", month: "short", year: "numeric"
    });

    const formatCurrency = (amount) => `৳ ${amount?.toLocaleString() || 0}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-#D4AF37" />
                        Finance Dashboard
                    </h1>
                    <p className="text-zinc-400 mt-1">Track your earnings and request payouts</p>
                </div>

                <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-gradient-to-r from-#D4AF37 to-orange-600 hover:from-#8C7326 hover:to-orange-700"
                            disabled={!financeStats.canWithdraw}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Request Withdrawal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800">
                        <DialogHeader>
                            <DialogTitle className="text-white">Request Withdrawal</DialogTitle>
                            <DialogDescription>
                                Available balance: {formatCurrency(financeStats.walletBalance)}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Amount (BDT)</Label>
                                <Input
                                    type="number"
                                    placeholder={`Min ${financeStats.minWithdrawal}`}
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>Payment Method</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bkash">bKash</SelectItem>
                                        <SelectItem value="nagad">Nagad</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {paymentMethod === "bank_transfer" ? (
                                <>
                                    <div>
                                        <Label>Account Holder Name</Label>
                                        <Input
                                            placeholder="John Doe"
                                            value={accountDetails.accountName}
                                            onChange={(e) => setAccountDetails({ ...accountDetails, accountName: e.target.value })}
                                            className="bg-zinc-950 border-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <Label>Bank Name</Label>
                                        <Input
                                            placeholder="BRAC Bank"
                                            value={accountDetails.bankName}
                                            onChange={(e) => setAccountDetails({ ...accountDetails, bankName: e.target.value })}
                                            className="bg-zinc-950 border-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <Label>Account Number</Label>
                                        <Input
                                            placeholder="1234567890"
                                            value={accountDetails.accountNumber}
                                            onChange={(e) => setAccountDetails({ ...accountDetails, accountNumber: e.target.value })}
                                            className="bg-zinc-950 border-zinc-800"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <Label>Mobile Number</Label>
                                    <Input
                                        placeholder="01712345678"
                                        value={accountDetails.mobileNumber}
                                        onChange={(e) => setAccountDetails({ ...accountDetails, mobileNumber: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800"
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                            <Button onClick={handleWithdraw} className="bg-#D4AF37 hover:bg-#8C7326">
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-900/50 to-green-950 border-green-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-green-300">Available Balance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {formatCurrency(financeStats.walletBalance)}
                        </div>
                        <p className="text-sm text-green-400 mt-1">Ready to withdraw</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-900/50 to-amber-950 border-amber-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-amber-300">Pending Withdrawal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {formatCurrency(financeStats.pendingBalance)}
                        </div>
                        <p className="text-sm text-#F7E08B mt-1">Processing</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-900/50 to-blue-950 border-blue-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-300">Total Earnings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {formatCurrency(financeStats.totalEarnings)}
                        </div>
                        <p className="text-sm text-blue-400 mt-1">After {financeStats.commissionRate}% platform fee</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-#D4AF37" />
                        Recent Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {financeStats.transactions?.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            No transactions yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800">
                                    <TableHead className="text-zinc-400">Date</TableHead>
                                    <TableHead className="text-zinc-400">Type</TableHead>
                                    <TableHead className="text-zinc-400">Status</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {financeStats.transactions?.map((txn) => (
                                    <TableRow key={txn._id} className="border-zinc-800">
                                        <TableCell className="text-zinc-300">{formatDate(txn.timestamp)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                txn.type === "vendor_credit" ? "border-green-600 text-green-400" :
                                                    txn.type === "payout" ? "border-blue-600 text-blue-400" :
                                                        txn.type === "withdrawal_request" ? "border-#8C7326 text-#F7E08B" :
                                                            "border-zinc-600 text-zinc-300"
                                            }>
                                                {txn.type.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {txn.status === "completed" ? (
                                                <span className="flex items-center gap-1 text-green-400">
                                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                                </span>
                                            ) : txn.status === "pending" ? (
                                                <span className="flex items-center gap-1 text-#F7E08B">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            ) : (
                                                <span className="text-zinc-400">{txn.status}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${txn.type === "vendor_credit" ? "text-green-400" :
                                                txn.type === "payout" || txn.type === "withdrawal_request" ? "text-red-400" :
                                                    "text-white"
                                            }`}>
                                            {txn.type === "payout" || txn.type === "withdrawal_request" ? "-" : "+"}{formatCurrency(txn.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Withdrawal History */}
            {financeStats.withdrawals?.length > 0 && (
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5 text-#D4AF37" />
                            Withdrawal Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800">
                                    <TableHead className="text-zinc-400">Requested</TableHead>
                                    <TableHead className="text-zinc-400">Method</TableHead>
                                    <TableHead className="text-zinc-400">Status</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {financeStats.withdrawals?.map((w) => (
                                    <TableRow key={w._id} className="border-zinc-800">
                                        <TableCell className="text-zinc-300">{formatDate(w.requestedAt)}</TableCell>
                                        <TableCell className="text-zinc-300 capitalize">{w.paymentMethod?.replace("_", " ")}</TableCell>
                                        <TableCell>
                                            <Badge className={
                                                w.status === "completed" ? "bg-green-500/20 text-green-400" :
                                                    w.status === "pending" ? "bg-#D4AF37/20 text-#F7E08B" :
                                                        w.status === "rejected" ? "bg-red-500/20 text-red-400" :
                                                            "bg-zinc-700"
                                            }>
                                                {w.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-white">
                                            {formatCurrency(w.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

