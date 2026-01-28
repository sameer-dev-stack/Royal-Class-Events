"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Percent, DollarSign, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function FinanceSettingsPage() {
    const { token } = useAuth();

    // Fetch current settings
    const settings = useQuery(api.settings.getFinanceSettings, { token });
    const updateSettings = useMutation(api.settings.updateFinanceSettings);

    // Form state
    const [platformFee, setPlatformFee] = useState("");
    const [vatRate, setVatRate] = useState("");
    const [fixedFee, setFixedFee] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Sync form with fetched settings
    useEffect(() => {
        if (settings) {
            setPlatformFee(String(settings.platformFeePercent || 10));
            setVatRate(String(settings.vatPercent || 0));
            setFixedFee(String(settings.fixedFee || 0));
        }
    }, [settings]);

    // Example calculation for preview
    const exampleAmount = 1000;
    const calcPlatformFee = Math.round(exampleAmount * (parseFloat(platformFee || "0") / 100));
    const calcVatOnFee = Math.round(calcPlatformFee * (parseFloat(vatRate || "0") / 100));
    const calcFixedFee = Math.round(parseFloat(fixedFee || "0"));
    const calcTotalDeductions = calcPlatformFee + calcVatOnFee + calcFixedFee;
    const calcVendorReceives = exampleAmount - calcTotalDeductions;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings({
                token,
                platformFeePercent: parseFloat(platformFee) || 10,
                vatPercent: parseFloat(vatRate) || 0,
                fixedFee: parseFloat(fixedFee) || 0
            });
            toast.success("Finance settings updated successfully! 🎉");
        } catch (error) {
            toast.error(error.message || "Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (!settings) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-amber-500" />
                <div>
                    <h1 className="text-2xl font-bold text-white">Finance Configuration</h1>
                    <p className="text-zinc-400 text-sm">
                        Manage Platform Fees, VAT, and Fixed Charges
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Settings Form */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Percent className="h-5 w-5 text-amber-500" />
                            Fee Configuration
                        </CardTitle>
                        <CardDescription>
                            Set the platform fees that will be deducted from vendor payouts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Platform Fee */}
                        <div className="space-y-2">
                            <Label htmlFor="platformFee" className="text-zinc-300">
                                Platform Fee (%)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="platformFee"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={platformFee}
                                    onChange={(e) => setPlatformFee(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-white pr-10"
                                    placeholder="10"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    %
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Commission charged on each transaction (default: 10%)
                            </p>
                        </div>

                        {/* VAT on Fee */}
                        <div className="space-y-2">
                            <Label htmlFor="vatRate" className="text-zinc-300">
                                VAT on Service Fee (%)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="vatRate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={vatRate}
                                    onChange={(e) => setVatRate(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-white pr-10"
                                    placeholder="0"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    %
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500">
                                VAT calculated on the platform fee, not the total amount
                            </p>
                        </div>

                        {/* Fixed Fee */}
                        <div className="space-y-2">
                            <Label htmlFor="fixedFee" className="text-zinc-300">
                                Fixed Transaction Fee (৳)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    ৳
                                </span>
                                <Input
                                    id="fixedFee"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={fixedFee}
                                    onChange={(e) => setFixedFee(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-white pl-8"
                                    placeholder="0"
                                />
                            </div>
                            <p className="text-xs text-zinc-500">
                                Flat fee charged per transaction (e.g., payment gateway costs)
                            </p>
                        </div>

                        {/* Save Button */}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Configuration
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Live Preview */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            Live Calculation Preview
                        </CardTitle>
                        <CardDescription>
                            See how fees will be calculated for a ৳{exampleAmount} transaction
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Calculation Steps */}
                        <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3 font-mono text-sm">
                            <div className="flex justify-between text-zinc-300">
                                <span>Transaction Amount</span>
                                <span className="text-white font-semibold">৳{exampleAmount}</span>
                            </div>

                            <div className="border-t border-zinc-700 pt-3 space-y-2">
                                <div className="flex justify-between text-zinc-400">
                                    <span>Platform Fee ({platformFee || 0}%)</span>
                                    <span className="text-red-400">- ৳{calcPlatformFee}</span>
                                </div>
                                <div className="flex justify-between text-zinc-400">
                                    <span>VAT on Fee ({vatRate || 0}%)</span>
                                    <span className="text-red-400">- ৳{calcVatOnFee}</span>
                                </div>
                                <div className="flex justify-between text-zinc-400">
                                    <span>Fixed Fee</span>
                                    <span className="text-red-400">- ৳{calcFixedFee}</span>
                                </div>
                            </div>

                            <div className="border-t border-zinc-700 pt-3">
                                <div className="flex justify-between text-zinc-300">
                                    <span>Total Deductions</span>
                                    <span className="text-amber-500 font-semibold">৳{calcTotalDeductions}</span>
                                </div>
                            </div>

                            <div className="border-t-2 border-zinc-600 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-white font-semibold">Vendor Receives</span>
                                    <span className="text-green-400 font-bold text-lg">৳{calcVendorReceives}</span>
                                </div>
                            </div>
                        </div>

                        {/* Warning for high fees */}
                        {calcTotalDeductions / exampleAmount > 0.25 && (
                            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="text-amber-400 font-medium">High Fee Warning</p>
                                    <p className="text-zinc-400 text-xs">
                                        Total deductions exceed 25% of transaction value. This may discourage vendors.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Formula Reference */}
                        <div className="bg-zinc-800/30 rounded-lg p-4 text-xs text-zinc-500 space-y-1">
                            <p className="font-semibold text-zinc-400 mb-2">Formula Reference:</p>
                            <p>Platform Fee = Amount × (Fee% / 100)</p>
                            <p>VAT = Platform Fee × (VAT% / 100)</p>
                            <p>Total = Platform Fee + VAT + Fixed Fee</p>
                            <p>Vendor = Amount - Total Deductions</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
