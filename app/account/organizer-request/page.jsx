"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Crown, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function OrganizerRequestPage() {
    const { user, token } = useAuthStore();
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Convex query for existing request
    const request = useQuery(
        api.users.getOrganizerRequest,
        user && token ? { token } : "skip"
    );
    const submitRequest = useMutation(api.users.requestOrganizerRole);
    const isLoadingRequest = request === undefined;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error("Please provide a reason for your request");
            return;
        }

        setIsSubmitting(true);
        try {
            await submitRequest({
                token: token || "",
                reason: reason,
            });

            toast.success("Request submitted successfully!");
            setReason("");

        } catch (error) {
            console.error(error);
            toast.error("Failed to submit request");
        } finally {
            setIsSubmitting(false);
        }
    };


    if (isLoadingRequest) {
        return (
            <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
        );
    }

    if (user?.role === "organizer") {
        return (
            <Card className="bg-card/50 backdrop-blur-sm border-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/5">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mb-4">
                        <Crown className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <CardTitle className="text-2xl font-black italic tracking-tight">
                        You are an <span className="text-[#D4AF37]">ORGANIZER.</span>
                    </CardTitle>
                    <CardDescription>
                        Your account has full access to event organizer tools.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-6">
                    <p className="text-muted-foreground">
                        You can now create events, manage tickets, and access the venue builder from your dashboard.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-black italic tracking-tighter">
                    Become an <span className="text-gradient-gold">ORGANIZER.</span>
                </h2>
                <p className="text-muted-foreground">
                    Upgrade your account to start hosting world-class events.
                </p>
            </div>

            {request ? (
                <Card className="bg-card/50 backdrop-blur-sm border-border shadow-xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                                Current Request Status
                            </CardTitle>
                            <div className={
                                `px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 
                                ${request.status === 'pending' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' :
                                    request.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                        'bg-red-500/10 text-red-500 border border-red-500/20'}`
                            }>
                                {request.status === 'pending' && <Clock className="w-3 h-3" />}
                                {request.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                {request.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                {request.status}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Original Reason</p>
                            <p className="text-sm italic">"{request.reason || "No reason provided"}"</p>
                        </div>

                        {request.status === 'pending' && (
                            <div className="p-4 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/20">
                                <p className="text-sm text-muted-foreground">
                                    Our team is currently reviewing your profile. We usually resolve requests within 24-48 hours.
                                </p>
                            </div>
                        )}

                        {request.status === 'rejected' && request.rejection_reason && (
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                                <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">Feedback from Admin</p>
                                <p className="text-sm">{request.rejection_reason}</p>
                            </div>
                        )}
                    </CardContent>
                    {request.status === 'rejected' && (
                        <CardFooter>
                            <Button
                                variant="outline"
                                className="w-full rounded-2xl"
                                onClick={() => setReason("") || setRequest(null)} // Allow reset
                            >
                                Try Again later or Contact Support
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="bg-card/50 backdrop-blur-sm border-border shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Crown className="w-32 h-32 text-[#D4AF37]" />
                        </div>

                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Submit Upgrade Request</CardTitle>
                            <CardDescription>
                                Tell us about your background and what kind of events you plan to host.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form id="upgrade-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Why do you want to be an organizer?
                                    </label>
                                    <Textarea
                                        placeholder="e.g. I am a professional luxury wedding planner with 5 years of experience..."
                                        className="min-h-[150px] rounded-2xl bg-muted/50 focus:ring-[#D4AF37]/20 border-border"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </form>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                form="upgrade-form"
                                disabled={isSubmitting || !reason.trim()}
                                className="w-full h-12 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#D4AF37]/10"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>Submit Application</>
                                )}
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground italic uppercase tracking-widest">
                                Your application will be reviewed manually by the Royal Class administration team.
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}

