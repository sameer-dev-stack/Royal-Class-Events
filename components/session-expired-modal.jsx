"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SessionExpiredModal({ isOpen, onClose, eventId }) {
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            // Prevent background scrolling when modal is open
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleRetry = () => {
        router.refresh();
        window.location.reload();
    };

    const handleGoHome = () => {
        router.push("/");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-destructive/50">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-red-500/10 rounded-full">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <DialogTitle className="text-2xl text-foreground">
                            Session Expired
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground text-base">
                        Your ticket reservation has expired. We hold tickets for 10 minutes
                        to give everyone a fair chance.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">What happened?</strong>
                            <br />
                            To ensure tickets are available for all customers, we automatically
                            release tickets after 10 minutes. Don't worry - you can restart your
                            purchase now!
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleRetry}
                            className="w-full bg-[#FBB03B] hover:bg-[#FBB03B]/90 text-black font-bold"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>

                        <Button
                            onClick={handleGoHome}
                            variant="outline"
                            className="w-full border-border text-muted-foreground hover:text-foreground"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go to Homepage
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground mt-2">
                        💡 <strong>Pro Tip:</strong> Have your payment details ready to
                        complete checkout faster!
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
