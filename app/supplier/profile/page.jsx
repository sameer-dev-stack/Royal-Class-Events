"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, User, Globe, MapPin, Mail, Phone, Instagram, Save, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    "Venue",
    "Catering",
    "Photography",
    "Cinematography",
    "Decor",
    "Planning",
    "Makeup",
    "Music",
    "Transportation",
    "Attire",
];

export default function SupplierProfilePage() {
    const { token } = useAuthStore();
    const supplier = useQuery(api.suppliers.getMyProfile, token ? { token } : "skip");
    const updateProfile = useMutation(api.suppliers.updateProfile);

    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        categories: [],
        email: "",
        phone: "",
        website: "",
        instagram: "",
        city: "",
        address: "",
    });

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || "",
                description: supplier.description || "",
                categories: supplier.categories || [],
                email: supplier.contact?.email || "",
                phone: supplier.contact?.phone || "",
                website: supplier.contact?.website || "",
                instagram: supplier.contact?.instagram || "",
                city: supplier.location?.city || "",
                address: supplier.location?.address || "",
            });
        }
    }, [supplier]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!token) return;

        setIsSaving(true);
        try {
            await updateProfile({
                token,
                name: formData.name,
                description: formData.description,
                categories: formData.categories,
                contact: {
                    email: formData.email,
                    phone: formData.phone,
                    website: formData.website,
                    instagram: formData.instagram,
                },
                location: {
                    city: formData.city,
                    country: "Bangladesh",
                    address: formData.address,
                }
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCategory = (cat) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    if (supplier === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Public Profile</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Customize how your business appears to potential clients.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {supplier.verified && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified Provider
                        </div>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#D4AF37] hover:bg-#8C7326 text-black font-bold px-6 rounded-xl shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-all"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="bg-muted/50 border border-border p-1 rounded-2xl h-14 w-full md:w-auto grid grid-cols-3 md:flex gap-2">
                    <TabsTrigger value="basic" className="rounded-xl data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold h-11 px-6 transition-all">
                        Business Details
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold h-11 px-6">
                        Contact Info
                    </TabsTrigger>
                    <TabsTrigger value="location" className="rounded-xl data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold h-11 px-6">
                        Office Location
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                    <Card className="bg-card/50 border-border rounded-3xl overflow-hidden shadow-xl backdrop-blur-sm">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-[#D4AF37]" />
                                Brand Identity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-bold">Business Display Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-background border-border h-12 rounded-xl focus:ring-#D4AF37"
                                    placeholder="e.g. Royal Cinematic Productions"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-bold">About the Business</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-background border-border min-h-[150px] rounded-xl focus:ring-#D4AF37"
                                    placeholder="Describe your services, experience, and what makes you unique..."
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-muted-foreground font-bold block">Service Categories</Label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => toggleCategory(cat)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 active:scale-95",
                                                formData.categories.includes(cat)
                                                    ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                                                    : "bg-muted/50 text-muted-foreground border-border hover:border-[#D4AF37]/30 hover:text-foreground"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contact">
                    <Card className="bg-card/50 border-border rounded-3xl overflow-hidden shadow-xl backdrop-blur-sm">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-[#D4AF37]" />
                                Channels
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground flex items-center gap-2 font-bold">
                                        <Mail className="w-4 h-4" />
                                        Public Email
                                    </Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-background border-border h-12 rounded-xl"
                                        placeholder="business@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Phone Number
                                    </Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800 h-12 rounded-xl"
                                        placeholder="+880 1..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Website Link
                                    </Label>
                                    <Input
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800 h-12 rounded-xl"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 flex items-center gap-2">
                                        <Instagram className="w-4 h-4" />
                                        Instagram Handle
                                    </Label>
                                    <Input
                                        value={formData.instagram}
                                        onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800 h-12 rounded-xl"
                                        placeholder="@yourhandle"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="location">
                    <Card className="bg-card/50 border-border rounded-3xl overflow-hidden shadow-xl backdrop-blur-sm">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                                Physical Presence
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-bold">Primary City</Label>
                                    <Input
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="bg-background border-border h-12 rounded-xl"
                                        placeholder="e.g. Dhaka"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-bold">Country</Label>
                                    <Input
                                        disabled
                                        value="Bangladesh"
                                        className="bg-background border-border h-12 rounded-xl text-muted-foreground/60"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-bold">Full Business Address</Label>
                                <Textarea
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="bg-background border-border min-h-[100px] rounded-xl focus:ring-#D4AF37"
                                    placeholder="Street address, building, floor..."
                                />
                                <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest mt-2">
                                    Tip: Providing a precise address builds trust with premium clients.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

