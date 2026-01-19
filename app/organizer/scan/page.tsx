"use client";

import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ScannerPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventId = searchParams.get("eventId");

    const { token } = useAuthStore();
    const validateEntry = useMutation(api.tickets.validateEntry);

    const [scanResult, setScanResult] = useState(null);
    const [manualId, setManualId] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Hydration fix for camera
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleScan = async (detectedCodes) => {
        // Prevent multiple scans
        if (isPaused || loading || !detectedCodes || detectedCodes.length === 0) return;

        if (!eventId) {
            toast.error("No Event Selected. Please launch from an Event.");
            return;
        }

        const rawValue = detectedCodes[0].rawValue;
        if (!rawValue) return;

        console.log("🔥 Scanned:", rawValue);
        setIsPaused(true); // Freeze scanner immediately
        setLoading(true);

        try {
            // Logic to clean URL if needed (optional)
            // const cleanId = rawValue.replace("https://your-domain.com/tickets/", "");

            const result = await validateEntry({ ticketId: rawValue, eventId, token });

            setScanResult(result);
            if (result.valid) {
                toast.success("VALID TICKET! ✅");
                new Audio("/sounds/success.mp3").play().catch(() => { });
            } else {
                toast.error("INVALID / USED ❌");
                new Audio("/sounds/error.mp3").play().catch(() => { });
            }
        } catch (error) {
            console.error(error);
            setScanResult({ valid: false, reason: "Invalid QR Code" });
            toast.error("Scan Failed");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setScanResult(null);
        setIsPaused(false); // Resume Scanning
    };

    if (!isMounted) return <div className="bg-black h-screen w-screen" />;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/20 rounded-full">
                    <ArrowLeft />
                </Button>
                <h1 className="text-lg font-bold text-[#D4AF37] tracking-wider">GATEKEEPER LIVE</h1>
                <div className="w-10" />
            </div>

            {/* FULL SCREEN CAMERA */}
            <div className="relative w-full h-[60vh] bg-black overflow-hidden mt-16 rounded-b-3xl shadow-2xl shadow-[#D4AF37]/10">
                {!scanResult && (
                    <Scanner
                        onScan={handleScan}
                        paused={isPaused}
                        scanDelay={500} // Scan every 500ms
                        allowMultiple={true}
                        components={{
                            audio: false,
                            finder: false, // We use custom overlay
                        }}
                        styles={{
                            container: { height: "100%", width: "100%" },
                            video: { objectFit: "cover", height: "100%" }
                        }}
                    />
                )}

                {/* Custom Overlay / Viewfinder */}
                {!scanResult && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-2 border-[#D4AF37]/80 rounded-3xl relative shadow-[0_0_100px_rgba(245,158,11,0.3)]">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#D4AF37] -mt-1 -ml-1 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#D4AF37] -mt-1 -mr-1 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#D4AF37] -mb-1 -ml-1 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#D4AF37] -mb-1 -mr-1 rounded-br-lg" />

                            {/* Scanning Laser */}
                            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_15px_red] animate-scan" />
                        </div>
                        <p className="absolute bottom-10 text-white/70 text-sm font-medium animate-pulse">
                            Align QR Code within frame
                        </p>
                    </div>
                )}

                {/* Result Overlay */}
                {scanResult && (
                    <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 ${scanResult.valid ? 'bg-green-600/95' : 'bg-red-600/95'} backdrop-blur-sm transition-all duration-300`}>
                        {scanResult.valid ? <CheckCircle2 className="w-24 h-24 mb-4 text-white" /> : <XCircle className="w-24 h-24 mb-4 text-white" />}
                        <h2 className="text-3xl font-black text-white uppercase tracking-widest">
                            {scanResult.valid ? "ACCESS GRANTED" : "ACCESS DENIED"}
                        </h2>
                        <div className="mt-6 bg-black/20 p-4 rounded-xl w-full text-center">
                            <p className="text-xl font-bold text-white">{scanResult.attendee || "Unknown User"}</p>
                            <p className="text-white/80 mt-1">{scanResult.seat || scanResult.reason}</p>
                        </div>
                        <Button onClick={reset} className="mt-8 bg-white text-black hover:scale-105 transition-transform font-bold px-10 py-6 rounded-full shadow-xl">
                            Scan Next Ticket
                        </Button>
                    </div>
                )}
            </div>

            {/* Manual Fallback (Bottom) */}
            <div className="flex-1 w-full p-6 flex flex-col justify-start items-center gap-4 bg-zinc-950">
                <div className="w-full max-w-sm space-y-2">
                    <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider text-center">Manual Check-in</p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter Ticket ID (e.g. REG-123)"
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 h-12 text-center font-mono uppercase tracking-widest text-lg focus:ring-[#D4AF37]"
                        />
                    </div>
                    <Button
                        onClick={() => handleScan([{ rawValue: manualId }])}
                        disabled={loading}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white h-12 font-bold border border-zinc-700"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Verify ID Manually"}
                    </Button>
                </div>
            </div>

            {/* Animation CSS */}
            <style jsx global>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
}
