"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { toast } from "sonner";
import { Loader2, Save, CreditCard, User, Building, Phone, Mail, Globe, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendorSettingsPage() {
    const { token } = useAuthStore();
    const supplier = useQuery(api.suppliers.getMyProfile, token ? { token } : "skip");
    const updateSettingsMutation = useMutation(api.suppliers.updateSettings);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        coverUrl: "",
        contact: {
            email: "",
            phone: "",
            website: "",
            instagram: "",
        },
        paymentInfo: {
            method: "Bank",
            accountNumber: "",
            accountHolder: "",
            bankName: "",
            branchName: "",
        },
    });

    // Populate form when data is loaded
    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || "",
                description: supplier.description || "",
                coverUrl: supplier.coverUrl || "",
                contact: {
                    email: supplier.contact?.email || "",
                    phone: supplier.contact?.phone || "",
                    website: supplier.contact?.website || "",
                    instagram: supplier.contact?.instagram || "",
                },
                paymentInfo: {
                    method: supplier.paymentInfo?.method || "Bank",
                    accountNumber: supplier.paymentInfo?.accountNumber || "",
                    accountHolder: supplier.paymentInfo?.accountHolder || "",
                    bankName: supplier.paymentInfo?.bankName || "",
                    branchName: supplier.paymentInfo?.branchName || "",
                },
            });
        }
    }, [supplier]);

    const handleInputChange = (section, field, value) => {
        if (section === "root") {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateSettingsMutation({
                token,
                name: formData.name,
                description: formData.description,
                coverUrl: formData.coverUrl,
                contact: formData.contact,
                paymentInfo: formData.paymentInfo,
            });
            toast.success("Settings updated successfully!");
        } catch (error) {
            console.error("Failed to update settings:", error);
            toast.error(error.message || "Failed to update settings");
        } finally {
            setIsLoading(false);
        }
    };

    if (supplier === undefined) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!supplier) {
        return <div className="text-center py-20 text-red-500">Access Denied: You are not a registered vendor.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Vendor Settings</h1>
                    <p className="text-zinc-400">Manage your public profile and payout details</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                        <User className="w-4 h-4 mr-2" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                        <CreditCard className="w-4 h-4 mr-2" /> Payments
                    </TabsTrigger>
                </TabsList>

                {/* ============ PROFILE TAB ============ */}
                <TabsContent value="profile">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white">Public Profile</CardTitle>
                            <CardDescription className="text-zinc-400">
                                This information will be displayed on your vendor details page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Business Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Business Name</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("root", "name", e.target.value)}
                                            className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                                            placeholder="e.g. Elite Catering"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Cover Image URL</Label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                        <Input
                                            value={formData.coverUrl}
                                            onChange={(e) => handleInputChange("root", "coverUrl", e.target.value)}
                                            className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("root", "description", e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
                                    placeholder="Tell potential clients about your services..."
                                />
                            </div>

                            <div className="border-t border-zinc-800 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                            <Input
                                                value={formData.contact.email}
                                                onChange={(e) => handleInputChange("contact", "email", e.target.value)}
                                                className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                                                placeholder="contact@business.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                            <Input
                                                value={formData.contact.phone}
                                                onChange={(e) => handleInputChange("contact", "phone", e.target.value)}
                                                className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                                                placeholder="+880 1..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Website</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                            <Input
                                                value={formData.contact.website}
                                                onChange={(e) => handleInputChange("contact", "website", e.target.value)}
                                                className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                                                placeholder="www.yoursite.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ============ PAYMENTS TAB ============ */}
                <TabsContent value="payments">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white">Payout Details</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Securely save your bank or mobile wallet details for payouts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-2 max-w-sm">
                                <Label className="text-zinc-300">Payment Method</Label>
                                <Select
                                    value={formData.paymentInfo.method}
                                    onValueChange={(val) => handleInputChange("paymentInfo", "method", val)}
                                >
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectItem value="Bank">Bank Transfer</SelectItem>
                                        <SelectItem value="bKash">bKash</SelectItem>
                                        <SelectItem value="Nagad">Nagad</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Account Holder Name</Label>
                                    <Input
                                        value={formData.paymentInfo.accountHolder}
                                        onChange={(e) => handleInputChange("paymentInfo", "accountHolder", e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                        placeholder="Name as on account"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Account / Wallet Number</Label>
                                    <Input
                                        value={formData.paymentInfo.accountNumber}
                                        onChange={(e) => handleInputChange("paymentInfo", "accountNumber", e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                        placeholder="017..."
                                    />
                                </div>

                                {formData.paymentInfo.method === "Bank" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300">Bank Name</Label>
                                            <Input
                                                value={formData.paymentInfo.bankName}
                                                onChange={(e) => handleInputChange("paymentInfo", "bankName", e.target.value)}
                                                className="bg-zinc-800 border-zinc-700 text-white"
                                                placeholder="e.g. BRAC Bank"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300">Branch Name</Label>
                                            <Input
                                                value={formData.paymentInfo.branchName}
                                                onChange={(e) => handleInputChange("paymentInfo", "branchName", e.target.value)}
                                                className="bg-zinc-800 border-zinc-700 text-white"
                                                placeholder="e.g. Gulshan Branch"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                                <p className="text-sm text-amber-400">
                                    <strong>Note:</strong> Payouts are processed every Wednesday for balances above ৳5,000.
                                </p>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
