"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Settings,
    Bell,
    Shield,
    CreditCard,
    Mail,
    LogOut,
    ChevronRight,
    Loader2,
    Sparkles
} from "lucide-react";

export default function SupplierSettingsPage() {
    const { token, user } = useAuthStore();
    const supplier = useQuery(api.suppliers.getMyProfile, token ? { token } : "skip");

    const [notifications, setNotifications] = useState({
        newLeads: true,
        messages: true,
        marketing: false,
    });

    if (supplier === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Manage your account preferences and notifications.
                </p>
            </div>

            <div className="space-y-6">
                {/* Account Section */}
                <Card className="bg-zinc-900/50 border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-zinc-800/50">
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-500" />
                            Account & Security
                        </CardTitle>
                        <CardDescription>
                            Your primary account information and login details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-white">Email Address</Label>
                                <p className="text-sm text-zinc-400">{user?.email || "Loading..."}</p>
                            </div>
                            <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800/50 hover:text-white rounded-xl">
                                Change Email
                            </Button>
                        </div>

                        <Separator className="bg-zinc-800/50" />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-white">Password</Label>
                                <p className="text-sm text-zinc-400">Successfully updated 2 months ago</p>
                            </div>
                            <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800/50 hover:text-white rounded-xl">
                                Update Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Section */}
                <Card className="bg-zinc-900/50 border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-zinc-800/50">
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Control how you receive alerts and updates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-white">New Lead Alerts</Label>
                                <p className="text-xs text-zinc-500">Get notified immediately when a client sends an inquiry.</p>
                            </div>
                            <Switch
                                checked={notifications.newLeads}
                                onCheckedChange={(val) => setNotifications({ ...notifications, newLeads: val })}
                                className="data-[state=checked]:bg-amber-500"
                            />
                        </div>

                        <Separator className="bg-zinc-800/50" />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-white">Message Notifications</Label>
                                <p className="text-xs text-zinc-500">Receive alerts for new chat messages from clients.</p>
                            </div>
                            <Switch
                                checked={notifications.messages}
                                onCheckedChange={(val) => setNotifications({ ...notifications, messages: val })}
                                className="data-[state=checked]:bg-amber-500"
                            />
                        </div>

                        <Separator className="bg-zinc-800/50" />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-white">Marketing Emails</Label>
                                <p className="text-xs text-zinc-500">Stay updated with the latest platform features and tips.</p>
                            </div>
                            <Switch
                                checked={notifications.marketing}
                                onCheckedChange={(val) => setNotifications({ ...notifications, marketing: val })}
                                className="data-[state=checked]:bg-amber-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Section (Placeholder) */}
                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-500">
                            <CreditCard className="w-5 h-5" />
                            Premium Subscription
                        </CardTitle>
                        <CardDescription>
                            Upgrade to unlock premium features and higher visibility.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg">Standard Vendor Plan</p>
                                <p className="text-sm text-amber-500/70 font-medium">Free for up to 3 Active Leads</p>
                            </div>
                        </div>
                        <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 px-8 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95">
                            Upgrade Now
                        </Button>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <div className="pt-8">
                    <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-0 gap-2">
                        Deactivate Account
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
