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
                <h2 className="text-3xl font-black italic tracking-tight">Security & Privacy.</h2>
                <p className="text-muted-foreground font-light">Manage your passwords and two-factor authentication.</p>
            </div>

            <div className="grid gap-6">
                <Card className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">Password</h3>
                            <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                        </div>
                        <Button variant="outline" className="ml-auto rounded-xl bg-zinc-950 border-white/5 hover:border-amber-500/50">
                            Change Password
                        </Button>
                    </div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">Two-Factor Authentication</h3>
                            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Button className="ml-auto rounded-xl bg-blue-500 hover:bg-blue-600 text-black font-bold">
                            Enable
                        </Button>
                    </div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 space-y-6 opacity-50 grayscale pointer-events-none">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center text-zinc-400">
                            <Fingerprint className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">Biometric Login</h3>
                            <p className="text-xs text-muted-foreground">Coming soon for mobile devices</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
