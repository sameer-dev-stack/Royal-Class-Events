"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    QrCode,
    Search,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowLeft,
    Camera,
    CameraOff,
    Maximize2
} from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useUserRoles } from "@/hooks/use-user-roles";
import { toast } from "sonner";
import useAuthStore from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import Link from "next/link";

export default function ScannerPage() {
    const router = useRouter();
    const { isOrganizer, isAdmin, isLoading: isRoleLoading, user } = useUserRoles();
    const [manualId, setManualId] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { token } = useAuthStore();
    const { mutate: checkIn } = useConvexMutation(api.registrations.checkInAttendee);

    const scannerRef = useRef(null);

    // Auth Guard
    useEffect(() => {
        if (!isRoleLoading && !user) {
            router.push("/sign-in?redirect=/scanner");
        } else if (!isRoleLoading && user && !isOrganizer && !isAdmin) {
            toast.error("Unauthorized. Organizer access only.");
            router.push("/dashboard");
        }
    }, [isRoleLoading, user, isOrganizer, isAdmin, router]);

    const handleCheckIn = async (code) => {
        if (!code) return;
        setIsProcessing(true);
        setScanResult(null);
        try {
            const result = await checkIn({ qrCode: code, token });
            setScanResult({
                success: result.success,
                message: result.message,
                code: code
            });
            if (result.success) {
                toast.success(result.message);
                // Beep or sound if possible? Browser might block.
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            setScanResult({
                success: false,
                message: error.message || "Failed to check in",
                code: code
            });
            toast.error(error.message || "Failed to check in");
        } finally {
            setIsProcessing(false);
            setManualId("");
        }
    };

    const startScanner = () => {
        setIsScanning(true);
        // Delay to ensure container is rendered
        setTimeout(() => {
            const html5QrcodeScanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            html5QrcodeScanner.render((decodedText) => {
                html5QrcodeScanner.clear();
                setIsScanning(false);
                handleCheckIn(decodedText);
            }, (error) => {
                // Ignore errors
            });

            scannerRef.current = html5QrcodeScanner;
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            try {
                scannerRef.current.clear();
            } catch (e) {
                console.warn("Scanner clear failed:", e);
            }
        }
        setIsScanning(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.warn("Cleanup error:", e));
            }
        };
    }, []);

    if (isRoleLoading || !user) {
        return null; // Auth guard handles redirect
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl py-12 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Gate Scanner</h1>
                    <p className="text-muted-foreground">Verify tickets and check-in attendees</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Scanner Interface */}
                <Card className="border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-[#D4AF37]/10 border-b border-[#D4AF37]/20">
                        <CardTitle className="flex items-center gap-2 text-[#D4AF37]">
                            <Camera className="w-5 h-5" />
                            Live Verification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {!isScanning ? (
                            <div
                                onClick={startScanner}
                                className="aspect-square w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <QrCode className="w-8 h-8 text-[#D4AF37]" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-lg">Launch Camera Scanner</p>
                                    <p className="text-sm text-muted-foreground">Scan attendee QR codes for instant entry</p>
                                </div>
                                <Button variant="secondary" className="mt-2">Start Scanning</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div id="reader" className="overflow-hidden rounded-2xl border-2 border-[#D4AF37]/50"></div>
                                <Button variant="outline" onClick={stopScanner} className="w-full gap-2">
                                    <CameraOff className="w-4 h-4" /> Stop Scanner
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Manual Input */}
                <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Manual ID Entry</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="e.g. REG-123456-789"
                                        className="pl-10 h-12 bg-background border-white/5"
                                        value={manualId}
                                        onChange={(e) => setManualId(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCheckIn(manualId)}
                                    />
                                </div>
                                <Button
                                    disabled={!manualId || isProcessing}
                                    onClick={() => handleCheckIn(manualId)}
                                    className="bg-[#D4AF37] hover:bg-[#8C7326] text-black font-bold h-12 px-6"
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Last Result */}
                {scanResult && (
                    <Card className={cn(
                        "border-none animate-in fade-in slide-in-from-top-4 duration-300",
                        scanResult.success ? "bg-green-500/10" : "bg-red-500/10"
                    )}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                                scanResult.success ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                            )}>
                                {scanResult.success ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <h3 className={cn("font-bold text-lg", scanResult.success ? "text-green-500" : "text-red-500")}>
                                    {scanResult.success ? "Access Granted" : "Access Denied"}
                                </h3>
                                <p className="text-sm text-muted-foreground">{scanResult.message}</p>
                                <p className="text-xs font-mono mt-1 opacity-50">Ticket: {scanResult.code}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setScanResult(null)}>Close</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function cn(...inputs) {
    return inputs.filter(Boolean).join(" ");
}

