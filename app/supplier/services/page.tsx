"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Briefcase,
    Package,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Star
} from "lucide-react";
import { ServiceModal } from "@/components/supplier/service-modal";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function SupplierServicesPage() {
    const { token } = useAuthStore();
    const services = useQuery(api.suppliers.listServices, token ? { token } : "skip");

    const createService = useMutation(api.suppliers.createService);
    const updateService = useMutation(api.suppliers.updateService);
    const deleteService = useMutation(api.suppliers.deleteService);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);

    const handleAdd = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (service: any) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (serviceId: any) => {
        if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) return;

        try {
            await deleteService({ token, serviceId });
            toast.success("Service deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete service.");
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingService) {
                await updateService({
                    token,
                    serviceId: editingService._id,
                    ...values
                });
                toast.success("Service package updated!");
            } else {
                await createService({
                    token,
                    ...values
                });
                toast.success("New service created!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save service.");
            throw error;
        }
    };

    if (services === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Package className="w-10 h-10 text-amber-500" />
                        Offerings & Packages
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        Craft and manage your premium service tiers.
                    </p>
                </div>
                <Button
                    onClick={handleAdd}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-black h-14 px-8 rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 group"
                >
                    <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                    New Service
                </Button>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {services.map((service) => (
                        <motion.div
                            key={service._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                            layout
                        >
                            <Card className="bg-zinc-900/40 border-zinc-800/60 rounded-[2.5rem] overflow-hidden hover:border-amber-500/30 transition-all group h-full flex flex-col backdrop-blur-md shadow-2xl relative">
                                <CardContent className="p-8 flex flex-col h-full z-10">
                                    {/* Card Header Actions */}
                                    <div className="flex justify-between items-start mb-6">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-2",
                                                service.active
                                                    ? "border-amber-500/20 text-amber-500 bg-amber-500/5"
                                                    : "border-zinc-800 text-zinc-500 bg-zinc-950/50"
                                            )}
                                        >
                                            {service.active ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    Active on Profile
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                                    Hidden Package
                                                </span>
                                            )}
                                        </Badge>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-zinc-800/50 text-zinc-500 hover:text-white">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-white rounded-2xl p-2 min-w-[160px] shadow-2xl">
                                                <DropdownMenuItem onClick={() => handleEdit(service)} className="hover:bg-zinc-900 cursor-pointer rounded-xl h-12 gap-3 focus:bg-zinc-900">
                                                    <Pencil className="w-4 h-4 text-amber-500" />
                                                    <span className="font-bold">Edit Details</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(service._id)} className="text-red-500 hover:bg-red-500/10 cursor-pointer rounded-xl h-12 gap-3 focus:bg-red-500/10">
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="font-bold">Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Main Content */}
                                    <div className="space-y-4 mb-8">
                                        <h3 className="text-2xl font-black text-white group-hover:text-amber-500 transition-colors leading-tight">
                                            {service.name}
                                        </h3>
                                        <p className="text-zinc-500 text-sm line-clamp-3 leading-relaxed font-medium">
                                            {service.description}
                                        </p>
                                    </div>

                                    {/* Features List (Preview) */}
                                    {service.features && service.features.length > 0 && (
                                        <div className="space-y-3 mb-8">
                                            {service.features.slice(0, 3).map((feat: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                                                    {feat}
                                                </div>
                                            ))}
                                            {service.features.length > 3 && (
                                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest pl-6">
                                                    + {service.features.length - 3} more features
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Pricing Footer */}
                                    <div className="mt-auto pt-6 flex items-end justify-between border-t border-zinc-800/30">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.2em] mb-1">Starting Investment</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xs font-bold text-amber-500/60 uppercase">{service.currency}</span>
                                                <span className="text-3xl font-black text-white">
                                                    {service.price.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleEdit(service)}
                                            className="h-12 w-12 rounded-2xl bg-zinc-800/30 hover:bg-amber-500 hover:text-black transition-all"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardContent>

                                {/* Background Aesthetic Glow */}
                                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/5 blur-[80px] rounded-full group-hover:bg-amber-500/10 transition-all" />
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty State */}
                {services.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-24 text-center"
                    >
                        <div className="w-24 h-24 bg-zinc-900/50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-zinc-800 group hover:border-amber-500/50 transition-all">
                            <Briefcase className="w-10 h-10 text-zinc-700 group-hover:text-amber-500/50" />
                        </div>
                        <h3 className="text-2xl font-black text-white">No Services Defined</h3>
                        <p className="text-zinc-500 mt-3 max-w-sm mx-auto font-medium">
                            Your marketplace storefront is currently empty. Add your packages to start receiving high-quality leads.
                        </p>
                        <Button
                            onClick={handleAdd}
                            variant="outline"
                            className="mt-10 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 rounded-2xl h-14 px-8 font-bold text-zinc-400 hover:text-amber-500"
                        >
                            <Plus className="w-5 h-5 mr-3" /> Publish Your First Service
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Modal */}
            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingService}
            />
        </div>
    );
}
