"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Smartphone, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SecuritySettingsPage() {
    return (
        <div className="max-w-3xl space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-black italic tracking-tight text-foreground">Security & Privacy.</h2>
                <p className="text-muted-foreground font-light">Manage your passwords and two-factor authentication.</p>
            </div>

            <div className="grid gap-6">
                <Card className="p-8 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Password</h3>
                            <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto rounded-xl bg-background border-border hover:border-[#D4AF37]/50 hover:bg-muted text-foreground">
                            Change Password
                        </Button>
                    </div>
                </Card>

                <Card className="p-8 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Two-Factor Authentication</h3>
                            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Button variant="default" size="sm" className="ml-auto rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold">
                            Enable
                        </Button>
                    </div>
                </Card>

                <Card className="p-8 rounded-3xl bg-card border border-border space-y-6 opacity-50 grayscale pointer-events-none shadow-none">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                            <Fingerprint className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Biometric Login</h3>
                            <p className="text-xs text-muted-foreground">Coming soon for mobile devices</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

