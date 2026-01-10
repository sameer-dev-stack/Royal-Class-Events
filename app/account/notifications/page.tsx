"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function NotificationsSettingsPage() {
    return (
        <div className="max-w-3xl space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-black italic tracking-tight">Notifications.</h2>
                <p className="text-muted-foreground font-light">Control how we communicate with you.</p>
            </div>

            <div className="grid gap-4">
                {[
                    { icon: Mail, title: "Email Notifications", desc: "Product updates, events you follow, and more.", checked: true },
                    { icon: Bell, title: "Push Notifications", desc: "Real-time alerts for ticket sales and reminders.", checked: false },
                    { icon: Globe, title: "Marketplace Alerts", desc: "Updates from suppliers you've inquired with.", checked: true },
                    { icon: MessageSquare, title: "Direct Messages", desc: "Notifications for new chat messages.", checked: true }
                ].map((item, i) => (
                    <Card key={i} className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-amber-500 transition-colors">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight">{item.title}</h3>
                                <p className="text-xs text-muted-foreground max-w-xs">{item.desc}</p>
                            </div>
                        </div>
                        <Switch checked={item.checked} className="data-[state=checked]:bg-amber-500" />
                    </Card>
                ))}
            </div>
        </div>
    );
}
