"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, DollarSign, Clock } from "lucide-react";

const offerSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    price: z.coerce.number().min(1, "Price must be at least 1"),
    validForDays: z.coerce.number().min(1).max(30).default(7),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface CreateOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: OfferFormValues) => Promise<void>;
    clientName?: string;
}

export function CreateOfferModal({
    isOpen,
    onClose,
    onSubmit,
    clientName = "Client",
}: CreateOfferModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<OfferFormValues>({
        resolver: zodResolver(offerSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            validForDays: 7,
        },
    });

    const handleFormSubmit = async (values: OfferFormValues) => {
        setIsSubmitting(true);
        try {
            await onSubmit(values);
            form.reset();
            onClose();
        } catch (error) {
            console.error("Failed to send offer:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-background border-border text-foreground max-w-lg rounded-3xl overflow-hidden p-0 gap-0 shadow-2xl">
                {/* Header */}
                <DialogHeader className="p-8 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#8C7326]/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
                                Create Official Offer
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm">
                                Send a formal proposal to {clientName}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(handleFormSubmit)}
                    className="p-8 space-y-6"
                >
                    {/* Title */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="title"
                            className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest"
                        >
                            Offer Title *
                        </Label>
                        <Input
                            id="title"
                            type="text"
                            {...form.register("title")}
                            className="bg-muted/50 border-input h-12 rounded-xl focus:border-[#D4AF37] transition-colors"
                            placeholder="e.g. Premium Wedding Photography Package"
                        />
                        {form.formState.errors.title && (
                            <p className="text-red-500 text-xs font-medium">
                                {form.formState.errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Price & Validity Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="price"
                                className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"
                            >
                                <DollarSign className="w-3 h-3" />
                                Price (BDT) *
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                {...form.register("price")}
                                className="bg-muted/50 border-input h-12 rounded-xl focus:border-[#D4AF37]"
                                placeholder="50000"
                            />
                            {form.formState.errors.price && (
                                <p className="text-red-500 text-xs font-medium">
                                    {form.formState.errors.price.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="validForDays"
                                className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"
                            >
                                <Clock className="w-3 h-3" />
                                Valid For (Days)
                            </Label>
                            <Input
                                id="validForDays"
                                type="number"
                                {...form.register("validForDays")}
                                className="bg-muted/50 border-input h-12 rounded-xl focus:border-[#D4AF37]"
                                placeholder="7"
                                min={1}
                                max={30}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="description"
                            className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest"
                        >
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            {...form.register("description")}
                            className="bg-muted/50 border-input min-h-[100px] rounded-xl focus:border-[#D4AF37] leading-relaxed"
                            placeholder="Include details about what's covered in this offer..."
                        />
                    </div>

                    {/* Info Note */}
                    <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="text-[#D4AF37] font-bold">Note:</span> Once sent,
                            the client can accept or decline this offer. Accepting will mark
                            the deal as booked and prepare for payment.
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <DialogFooter className="pt-4 border-t border-border flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="default"
                            onClick={onClose}
                            className="flex-1 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl h-12 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            size="default"
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#8C7326] hover:from-[#8C7326] hover:to-[#8C7326] text-black font-black rounded-xl h-12 shadow-xl shadow-[#D4AF37]/20 active:scale-95 transition-all"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Send Offer
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

