"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { toast } from "sonner";

export default function NotificationsSettingsPage() {
    const updateProfile = useMutation(api.users.updateProfile);
    const { user, updateUser, token } = useAuthStore();
    const [settings, setSettings] = React.useState({
        email: true,
        push: false,
        marketplace: true,
        messages: true
    });
    const [loadingKey, setLoadingKey] = React.useState<string | null>(null);

    // Load initial settings from metadata
    React.useEffect(() => {
        if (user?.metadata?.notifications) {
            setSettings(prev => ({ ...prev, ...user.metadata.notifications }));
        }
    }, [user]);

    const handleToggle = async (key: string) => {
        if (!user) return;
        const newValue = !settings[key as keyof typeof settings];
        setSettings(prev => ({ ...prev, [key]: newValue })); // Optimistic update
        setLoadingKey(key);

        try {
            const updatedNotifications = {
                ...settings,
                [key]: newValue
            };

            await updateProfile({
                token: token || "",
                notifications: updatedNotifications,
            });

            updateUser({
                metadata: {
                    ...user.metadata,
                    notifications: updatedNotifications
                }
            });
            toast.success("Settings saved");
        } catch (error) {
            console.error("Failed to save setting:", error);
            toast.error("Failed to save changes");
            setSettings(prev => ({ ...prev, [key]: !newValue })); // Revert on error
        } finally {
            setLoadingKey(null);
        }

    };

    return (
        <div className="max-w-3xl space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-black italic tracking-tight text-foreground">Notifications.</h2>
                <p className="text-muted-foreground font-light">Control how we communicate with you.</p>
            </div>

            <div className="grid gap-4">
                {[
                    { key: "email", icon: Mail, title: "Email Notifications", desc: "Product updates, events you follow, and more." },
                    { key: "push", icon: Bell, title: "Push Notifications", desc: "Real-time alerts for ticket sales and reminders." },
                    { key: "marketplace", icon: Globe, title: "Marketplace Alerts", desc: "Updates from suppliers you've inquired with." },
                    { key: "messages", icon: MessageSquare, title: "Direct Messages", desc: "Notifications for new chat messages." }
                ].map((item) => (
                    <Card key={item.key} className="p-6 rounded-3xl bg-card border border-border flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-[#D4AF37] transition-colors">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight text-foreground">{item.title}</h3>
                                <p className="text-xs text-muted-foreground max-w-xs">{item.desc}</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings[item.key]}
                            onCheckedChange={() => handleToggle(item.key)}
                            disabled={loadingKey === item.key}
                            className="data-[state=checked]:bg-[#D4AF37]"
                        />
                    </Card>
                ))}
            </div>
        </div>
    );
}

