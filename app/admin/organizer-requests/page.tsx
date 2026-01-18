"use client";

import React, { useState, useEffect } from "react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Check, X, User, Clock, Mail, Info } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminOrganizerRequestsPage() {
    const { token } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);
    const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    // 1. Wait for Hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 2. Query only if Mounted and Token exists
    const { data: requests, isLoading } = useConvexQuery(
        api.users.getPendingUpgradeRequests,
        isMounted && token ? { token } : "skip"
    );

    const { mutate: resolveRequest } = useConvexMutation(api.users.resolveOrganizerUpgrade);

    const handleResolve = async (requestId: any, decision: "approved" | "rejected") => {
        setResolvingId(requestId);
        try {
            const res = await resolveRequest({
                requestId,
                decision,
                rejectionReason: decision === "rejected" ? rejectionReasons[requestId] : undefined,
                token
            });

            if (res.success) {
                toast.success(`Request ${decision} successfully`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to resolve request");
        } finally {
            setResolvingId(null);
        }
    };

    if (!isMounted) return null;

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] text-zinc-400 gap-4">
                <Info className="w-16 h-16 text-zinc-700" />
                <h2 className="text-xl font-medium">Access Denied</h2>
                <p className="text-zinc-500">Please log in as an administrator to view this page.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                    Organizer <span className="text-amber-500">Requests.</span>
                </h1>
                <p className="text-zinc-500">Review and approve applications for organizer status.</p>
            </div>

            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {requests && requests.length > 0 ? (
                        requests.map((req: any) => (
                            <motion.div
                                key={req._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden group">
                                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                                        {/* User Info Section */}
                                        <div className="p-6 md:w-80 bg-zinc-900/80 flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xl uppercase">
                                                    {req.user?.name?.[0] || <User className="w-6 h-6" />}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="font-bold text-white truncate">{req.user?.name}</h3>
                                                    <p className="text-xs text-zinc-500 flex items-center gap-1 truncate">
                                                        <Mail className="w-3 h-3" />
                                                        {req.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pt-2 flex flex-col gap-1 text-[10px] uppercase font-black tracking-widest text-zinc-600">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-zinc-400" />
                                                    {format(req.requestedAt, "MMM dd, yyyy HH:mm")}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Info className="w-3 h-3 text-zinc-400" />
                                                    ID: {req._id.slice(-8)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Request Body */}
                                        <div className="flex-1 p-6 space-y-4">
                                            <div className="space-y-2">
                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-amber-500/80">Application Reason</h4>
                                                <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 italic text-zinc-300 leading-relaxed">
                                                    "{req.reason || "No reason provided"}"
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4 items-end pt-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Rejection Feedback (Optional)</label>
                                                    <Input
                                                        placeholder="Explain why the request is rejected..."
                                                        className="bg-zinc-950 border-zinc-800 h-10 rounded-lg text-sm"
                                                        value={rejectionReasons[req._id] || ""}
                                                        onChange={(e) => setRejectionReasons(prev => ({ ...prev, [req._id]: e.target.value }))}
                                                        disabled={resolvingId === req._id}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleResolve(req._id, "rejected")}
                                                        variant="outline"
                                                        className="flex-1 h-10 rounded-lg border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                                        disabled={resolvingId === req._id}
                                                    >
                                                        {resolvingId === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleResolve(req._id, "approved")}
                                                        className="flex-2 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6"
                                                        disabled={resolvingId === req._id}
                                                    >
                                                        {resolvingId === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-zinc-800 rounded-3xl">
                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-400">No Pending Requests</h3>
                            <p className="text-sm text-zinc-600 max-w-xs">There are currently no organizer upgrade applications awaiting review.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
