"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import {
    Settings,
    Megaphone,
    Save,
    ShieldCheck,
    AlertTriangle,
    Percent,
    Power,
    Users,
    UserCheck,
    Briefcase,
    Globe,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
    const { token } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    // 1. Wait for Hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 2. Query only if Mounted and Token exists
    const settings = useQuery(api.admin.getSettings,
        isMounted && token ? { token } : "skip"
    );
    const updateSetting = useMutation(api.admin.updateSetting);
    const broadcast = useMutation(api.admin.broadcastMessage);

    const [commission, setCommission] = useState("10");
    const [maintenance, setMaintenance] = useState(false);

    const [broadcastTitle, setBroadcastTitle] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [broadcastTarget, setBroadcastTarget] = useState("all");

    const [isSaving, setIsSaving] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    useEffect(() => {
        if (settings) {
            setCommission(String(settings.commission_rate || "10"));
            setMaintenance(!!settings.maintenance_mode);
        }
    }, [settings]);

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            await updateSetting({
                key: "commission_rate",
                value: Number(commission),
                token: token || undefined
            });
            await updateSetting({
                key: "maintenance_mode",
                value: maintenance,
                token: token || undefined
            });
            toast.success("Platform configuration updated successfully.");
        } catch (err) {
            toast.error("Failed to update settings.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcastTitle || !broadcastMessage) {
            toast.error("Please fill in both title and message.");
            return;
        }

        setIsBroadcasting(true);
        try {
            const result = await broadcast({
                title: broadcastTitle,
                message: broadcastMessage,
                targetRole: broadcastTarget,
                token: token || undefined
            });
            toast.success(`Broadcast signal sent to ${result.count} users.`);
            setBroadcastTitle("");
            setBroadcastMessage("");
        } catch (err) {
            toast.error("Broadcast failed.");
            console.error(err);
        } finally {
            setIsBroadcasting(false);
        }
    };

    if (!isMounted) return null;

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] text-zinc-400 gap-4">
                <AlertTriangle className="w-16 h-16 text-zinc-700" />
                <h2 className="text-xl font-medium">Access Denied</h2>
                <p className="text-zinc-500">Please log in as an administrator to view this page.</p>
                <Link href="/admin/login">
                    <Button variant="default" className="bg-[#D4AF37] text-black hover:bg-[#8C7326]">
                        Go to Login
                    </Button>
                </Link>
            </div>
        );
    }

    if (!settings) {
        return <div className="p-10 text-zinc-400 animate-pulse">Initializing system interface...</div>;
    }

    return (
        <div className="space-y-8 text-white max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-black tracking-tighter mb-2 italic flex items-center gap-3">
                    <Settings className="w-10 h-10 text-zinc-700" />
                    System Core
                </h2>
                <p className="text-zinc-500 font-medium tracking-tight">Manage platform parameters and administrative telepathic signals.</p>
            </div>

            <Tabs defaultValue="config" className="w-full">
                <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-12 rounded-2xl mb-8">
                    <TabsTrigger value="config" className="rounded-xl px-8 data-[state=active]:bg-zinc-800 data-[state=active]:text-[#D4AF37] gap-2 font-bold uppercase text-[10px] tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> Platform Config
                    </TabsTrigger>
                    <TabsTrigger value="broadcast" className="rounded-xl px-8 data-[state=active]:bg-zinc-800 data-[state=active]:text-[#D4AF37] gap-2 font-bold uppercase text-[10px] tracking-widest">
                        <Megaphone className="w-4 h-4" /> Global Broadcast
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Percent className="w-32 h-32 text-[#D4AF37] -mr-10 -mt-10 rotate-12" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Badge variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37] uppercase text-[10px] px-2 py-0">Finance</Badge>
                                    Revenue Stream
                                </CardTitle>
                                <CardDescription className="text-zinc-500">Define the platform commission for every ticket sold.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Commission Rate (%)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={commission}
                                            onChange={(e) => setCommission(e.target.value)}
                                            className="bg-zinc-950 border-zinc-800 text-white h-12 text-xl font-bold pr-12 focus:ring-[#D4AF37]"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">%</div>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 mt-2 font-medium italic">Applied across marketplace and internal booking engine.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Power className="w-32 h-32 text-red-500 -mr-10 -mt-10" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Badge variant="outline" className="border-red-500/30 text-red-500 uppercase text-[10px] px-2 py-0">Control</Badge>
                                    Service Status
                                </CardTitle>
                                <CardDescription className="text-zinc-500">Toggle public access to the platform during maintenance.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                                    <div className="space-y-0.5">
                                        <Label className="text-white font-bold tracking-tight">Maintenance Mode</Label>
                                        <p className="text-[10px] text-zinc-600 font-medium">Blocks non-admin access to the portal.</p>
                                    </div>
                                    <Switch
                                        checked={maintenance}
                                        onCheckedChange={setMaintenance}
                                        className="data-[state=checked]:bg-red-500"
                                    />
                                </div>
                                {maintenance && (
                                    <div className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        <span className="text-[10px] font-black uppercase tracking-tight text-red-400">Warning: Global lockdown active</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveConfig}
                            disabled={isSaving}
                            className="bg-[#D4AF37] hover:bg-[#8C7326] text-black font-black px-10 h-12 rounded-2xl gap-2 shadow-xl shadow-[#D4AF37]/20"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Synchronize Core
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="broadcast">
                    <Card className="bg-zinc-900 border-zinc-800 shadow-2xl border-t-2 border-t-[#D4AF37]">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 uppercase tracking-tighter italic">Telepathic Dispatcher</CardTitle>
                            <CardDescription className="text-zinc-500">Send an urgent real-time notification to specific user segments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="md:col-span-2 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest pl-1">Signal Title</Label>
                                        <Input
                                            placeholder="System Maintenance, New Feature, etc."
                                            value={broadcastTitle}
                                            onChange={(e) => setBroadcastTitle(e.target.value)}
                                            className="bg-zinc-950 border-zinc-800 text-white h-11 focus:ring-[#D4AF37]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest pl-1">Message Payload</Label>
                                        <textarea
                                            rows={4}
                                            placeholder="Detailed instructions for the audience..."
                                            value={broadcastMessage}
                                            onChange={(e) => setBroadcastMessage(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white resize-none h-32 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6 bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest pl-1">Target Audience</Label>
                                        <Select value={broadcastTarget} onValueChange={setBroadcastTarget}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white h-11">
                                                <SelectValue placeholder="Select target" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                <SelectItem value="all">
                                                    <div className="flex items-center gap-2"><Globe className="w-3 h-3 text-emerald-500" /> All Entities</div>
                                                </SelectItem>
                                                <SelectItem value="organizer">
                                                    <div className="flex items-center gap-2"><Briefcase className="w-3 h-3 text-blue-500" /> Organizers</div>
                                                </SelectItem>
                                                <SelectItem value="attendee">
                                                    <div className="flex items-center gap-2"><UserCheck className="w-3 h-3 text-[#D4AF37]" /> Attendees</div>
                                                </SelectItem>
                                                <SelectItem value="admin">
                                                    <div className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-red-500" /> Admin Staff</div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-3">
                                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase">
                                            <Users className="w-3 h-3" /> Broadcast Estimate
                                        </div>
                                        <p className="text-2xl font-black text-white italic">Active Line</p>
                                        <p className="text-[10px] text-zinc-600 leading-tight">Your signal will be delivered instantly to the notification bell of the selected segment.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-zinc-950/20 py-6 border-t border-zinc-900 flex justify-between items-center">
                            <div className="flex items-center gap-2 opacity-30 grayscale group-hover:grayscale-0 transition-all">
                                <Megaphone className="w-4 h-4 text-[#D4AF37]" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Signal Ready</span>
                            </div>
                            <Button
                                onClick={handleSendBroadcast}
                                disabled={isBroadcasting}
                                className="bg-white hover:bg-zinc-200 text-black font-black px-12 h-12 rounded-2xl gap-3 shadow-xl"
                            >
                                {isBroadcasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                                Initiate Broadcast
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

