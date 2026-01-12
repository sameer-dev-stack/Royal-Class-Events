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
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg rounded-3xl overflow-hidden p-0 gap-0 shadow-2xl">
                {/* Header */}
                <DialogHeader className="p-8 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-white tracking-tight">
                                Create Official Offer
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500 text-sm">
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
                            className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest"
                        >
                            Offer Title *
                        </Label>
                        <Input
                            id="title"
                            type="text"
                            {...form.register("title")}
                            className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:border-amber-500 transition-colors"
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
                                className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"
                            >
                                <DollarSign className="w-3 h-3" />
                                Price (BDT) *
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                {...form.register("price")}
                                className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:border-amber-500"
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
                                className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"
                            >
                                <Clock className="w-3 h-3" />
                                Valid For (Days)
                            </Label>
                            <Input
                                id="validForDays"
                                type="number"
                                {...form.register("validForDays")}
                                className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:border-amber-500"
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
                            className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest"
                        >
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            {...form.register("description")}
                            className="bg-zinc-900 border-zinc-800 min-h-[100px] rounded-xl focus:border-amber-500 leading-relaxed"
                            placeholder="Include details about what's covered in this offer..."
                        />
                    </div>

                    {/* Info Note */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            <span className="text-amber-500 font-bold">Note:</span> Once sent,
                            the client can accept or decline this offer. Accepting will mark
                            the deal as booked and prepare for payment.
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <DialogFooter className="pt-4 border-t border-zinc-900 flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="default"
                            onClick={onClose}
                            className="flex-1 bg-transparent text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl h-12 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            size="default"
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black rounded-xl h-12 shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
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
