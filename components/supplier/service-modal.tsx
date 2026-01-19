"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";

/**
 * Zod Schema for Service Validation
 */
const serviceSchema = z.object({
    name: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    active: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: ServiceFormValues & { features: string[] }) => Promise<void>;
    initialData?: (ServiceFormValues & { features: string[] }) | null;
}

export function ServiceModal({ isOpen, onClose, onSubmit, initialData }: ServiceModalProps) {
    const [features, setFeatures] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ServiceFormValues>({
        // @ts-ignore
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            active: true,
        },
    });

    // Reset form when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset({
                    name: initialData.name,
                    description: initialData.description,
                    price: initialData.price,
                    active: initialData.active ?? true,
                });
                setFeatures(initialData.features || []);
            } else {
                form.reset({
                    name: "",
                    description: "",
                    price: 0,
                    active: true,
                });
                setFeatures([]);
            }
        }
    }, [initialData, form, isOpen]);

    const addFeature = () => {
        if (newFeature.trim() && !features.includes(newFeature.trim())) {
            setFeatures([...features, newFeature.trim()]);
            setNewFeature("");
        }
    };

    const removeFeature = (feat: string) => {
        setFeatures(features.filter((f) => f !== feat));
    };

    const onFormSubmit = async (values: ServiceFormValues) => {
        setIsSubmitting(true);
        try {
            await (onSubmit as any)({ ...values, features });
            onClose();
        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg rounded-3xl overflow-hidden p-0 gap-0 shadow-2xl">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-2xl font-black text-white tracking-tight">
                        {initialData ? "Edit Package" : "New Service Package"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-base mt-2">
                        Define the specifics of your service offering.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onFormSubmit as any)} className="p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Service Title</Label>
                            <Input
                                id="name"
                                type="text"
                                {...form.register("name")}
                                className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:border-#D4AF37 transition-colors"
                                placeholder="e.g. Premium Wedding Package"
                            />
                            {form.formState.errors.name && (
                                <p className="text-red-500 text-xs font-medium">{(form.formState.errors.name as any).message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Base Price (BDT)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    {...form.register("price")}
                                    className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:border-#D4AF37"
                                    placeholder="0"
                                />
                                {form.formState.errors.price && (
                                    <p className="text-red-500 text-xs font-medium">{(form.formState.errors.price as any).message}</p>
                                )}
                            </div>
                            <div className="flex flex-col justify-center gap-3">
                                <Label htmlFor="active" className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Visibility</Label>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        // @ts-ignore
                                        id="active"
                                        checked={form.watch("active")}
                                        onCheckedChange={(val) => form.setValue("active", val)}
                                        className="data-[state=checked]:bg-#D4AF37"
                                    />
                                    <span className="text-sm font-medium text-zinc-300">
                                        {form.watch("active") ? "Public" : "Private"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Description</Label>
                            <Textarea
                                id="description"
                                {...form.register("description")}
                                className="bg-zinc-900 border-zinc-800 min-h-[120px] rounded-xl focus:border-#D4AF37 leading-relaxed"
                                placeholder="What's included in this package? Be descriptive..."
                            />
                            {form.formState.errors.description && (
                                <p className="text-red-500 text-xs font-medium">{(form.formState.errors.description as any).message}</p>
                            )}
                        </div>
                    </div>

                    {/* Features System */}
                    <div className="space-y-4">
                        <Label className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Package Highlights</Label>
                        <div className="flex gap-2">
                            <Input
                                id="new-feature"
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:border-#D4AF37"
                                placeholder="Add a feature (e.g. 100 Edited Photos)"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addFeature();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="default"
                                size="default"
                                onClick={addFeature}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl h-12 w-12 p-0"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                            {features.map((feat) => (
                                <Badge
                                    key={feat}
                                    variant="outline"
                                    className="bg-zinc-800 text-zinc-300 border-zinc-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
                                >
                                    {feat}
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                                        onClick={() => removeFeature(feat)}
                                    />
                                </Badge>
                            ))}
                            {features.length === 0 && (
                                <p className="text-xs text-zinc-600 italic">No highlights added yet.</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-zinc-900 mt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            size="default"
                            onClick={onClose}
                            className="bg-transparent text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl px-6 h-12 font-bold"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            size="default"
                            disabled={isSubmitting}
                            className="bg-#D4AF37 hover:bg-#8C7326 text-black font-black px-10 rounded-xl h-12 shadow-xl shadow-#D4AF37/10 active:scale-95 transition-all"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {initialData ? "Apply Changes" : "Create Service"}
                        </Button>
                    </DialogFooter>
                </form>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #27272a;
                        border-radius: 10px;
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}

