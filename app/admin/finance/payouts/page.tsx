"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DollarSign,
    User,
    Calendar,
    CheckCircle,
    Clock,
    History,
    Wallet,
    ExternalLink,
    Search,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PayoutsPage() {
    const { token } = useAuthStore();
    const pendingPayouts = useQuery(api.finance.getPayouts, { status: "pending", token: token || undefined });
    const historyPayouts = useQuery(api.finance.getPayouts, { status: "completed", token: token || undefined });
    const process = useMutation(api.finance.processPayout);

    const [processingId, setProcessingId] = useState<string | null>(null);
    const [txRef, setTxRef] = useState("");
    const [notes, setNotes] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcess = async (id: any) => {
        setIsProcessing(true);
        try {
            await process({
                payoutId: id,
                transactionRef: txRef,
                notes: notes,
                token: token || undefined
            });
            toast.success("Payout marked as completed and record updated");
            setProcessingId(null);
            setTxRef("");
            setNotes("");
        } catch (err: any) {
            toast.error(err.message || "Failed to process payout");
        } finally {
            setIsProcessing(false);
        }
    };

    if (pendingPayouts === undefined || historyPayouts === undefined) {
        return <div className="text-zinc-400 p-10 animate-pulse">Initializing payout data...</div>;
    }

    const totalPending = pendingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="space-y-8 text-white max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tight mb-2 italic">Vendor Withdrawals</h2>
                    <p className="text-zinc-500">Secure pipeline for transferring earnings to platform partners.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-zinc-900/50 border-zinc-800 border-l-4 border-l-[#D4AF37] shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Queue Volume</CardTitle>
                        <Clock className="w-4 h-4 text-[#D4AF37]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white italic">৳{totalPending.toLocaleString()}</div>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-tighter">
                            {pendingPayouts.length} pending requests awaiting action
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 border-l-4 border-l-emerald-500 shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Processed Volume</CardTitle>
                        <History className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white italic">
                            ৳{historyPayouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-tighter">
                            {historyPayouts.length} total payouts completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 gap-1">
                    <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 font-bold px-6 py-2"
                    >
                        Pending Actions ({pendingPayouts.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 font-bold px-6 py-2"
                    >
                        Payout Legacy
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden shadow-2xl">
                        <Table>
                            <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-zinc-400 font-black uppercase text-[10px] tracking-widest pl-6">Vendor Detail</TableHead>
                                    <TableHead className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Amount & Method</TableHead>
                                    <TableHead className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Requested</TableHead>
                                    <TableHead className="text-right text-zinc-400 font-black uppercase text-[10px] tracking-widest pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingPayouts.map((p) => (
                                    <TableRow key={p._id} className="border-zinc-800/50 hover:bg-zinc-800/20 transition-all">
                                        <TableCell className="py-5 pl-6 font-bold">
                                            <div className="flex flex-col">
                                                <span className="text-base text-white">{p.vendorName}</span>
                                                <span className="text-[10px] text-zinc-600 font-medium lowercase tracking-tighter">{p.vendorEmail}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-lg font-black text-[#D4AF37] tracking-tighter italic">৳{p.amount.toLocaleString()}</span>
                                                <div className="flex items-center gap-2">
                                                    <Wallet className="w-3 h-3 text-zinc-700" />
                                                    <Badge variant="outline" className="text-[9px] uppercase font-black border-zinc-800 bg-zinc-900/50 text-zinc-400">
                                                        {p.method}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-500 text-xs font-bold">
                                            {format(new Date(p.requestedAt), "MMM d, yyyy • HH:mm")}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Dialog open={processingId === p._id} onOpenChange={(open) => !open && setProcessingId(null)}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        onClick={() => setProcessingId(p._id)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest px-6 h-10 shadow-lg shadow-emerald-900/20 rounded-xl"
                                                    >
                                                        Mark Managed
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-3xl scale-95 md:scale-100">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-black italic uppercase text-emerald-500 flex items-center gap-3">
                                                            <CheckCircle className="w-8 h-8" /> Finalize Payout
                                                        </DialogTitle>
                                                        <DialogDescription className="text-zinc-400 text-base">
                                                            Are you sure you have transferred <strong className="text-white">৳{p.amount.toLocaleString()}</strong> via <strong className="text-white uppercase">{p.method}</strong> to {p.vendorName}?
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="space-y-6 py-6 border-t border-b border-zinc-800/50 my-2">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Transaction ID (Reference)</Label>
                                                            <Input
                                                                placeholder="e.g. BBX28102391"
                                                                className="bg-zinc-900 border-zinc-800 h-12 focus:ring-emerald-500"
                                                                value={txRef}
                                                                onChange={(e) => setTxRef(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Internal Audit Note</Label>
                                                            <Input
                                                                placeholder="Optional memo..."
                                                                className="bg-zinc-900 border-zinc-800 h-12"
                                                                value={notes}
                                                                onChange={(e) => setNotes(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <DialogFooter className="gap-2">
                                                        <Button variant="ghost" onClick={() => setProcessingId(null)} className="h-12 px-6 font-bold text-zinc-500 hover:text-white">Cancel</Button>
                                                        <Button
                                                            disabled={isProcessing}
                                                            onClick={() => handleProcess(p._id)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-10 font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 rounded-2xl"
                                                        >
                                                            {isProcessing ? "Recording..." : "Verify & Complete"}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {pendingPayouts.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-20 text-center">
                                <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-4 border border-zinc-800/50">
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Queue is Clear</h3>
                                <p className="text-zinc-500 text-sm">All vendor withdrawal requests have been processed.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden shadow-2xl">
                        <Table>
                            <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-zinc-400 font-black uppercase text-[10px] tracking-widest pl-6">Vendor</TableHead>
                                    <TableHead className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Amount</TableHead>
                                    <TableHead className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Processed On</TableHead>
                                    <TableHead className="text-right text-zinc-400 font-black uppercase text-[10px] tracking-widest pr-6">Reference</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyPayouts.map((p) => (
                                    <TableRow key={p._id} className="border-zinc-800/50 hover:bg-zinc-800/10 opacity-75 grayscale hover:grayscale-0 transition-all">
                                        <TableCell className="py-5 pl-6">
                                            <span className="font-bold text-zinc-300">{p.vendorName}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-black text-emerald-500 italic">৳{p.amount.toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell className="text-zinc-500 text-xs font-medium italic">
                                            {p.processedAt ? format(new Date(p.processedAt), "MMM d, yyyy") : "N/A"}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Badge variant="outline" className="text-[10px] font-mono border-zinc-800 bg-zinc-900/50 text-zinc-500 px-3 py-1">
                                                {p.transactionRef || "N/A"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

