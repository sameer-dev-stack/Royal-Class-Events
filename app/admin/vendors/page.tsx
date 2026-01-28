"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserRoles } from "@/hooks/use-user-roles";
import useAuthStore from "@/hooks/use-auth-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Search,
    ShieldCheck,
    ShieldAlert,
    FileText,
    Building2,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Clock,
    Eye,
    Landmark,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AdminVendorsPage() {
    const { token } = useAuthStore();
    const { isAdmin, isLoading: isRoleLoading } = useUserRoles();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // Convex queries and mutations
    const vendorsRaw = useQuery(
        api.admin.getAllSuppliers,
        isAdmin && token ? { token } : "skip"
    );
    const vendors = vendorsRaw || [];
    const updateVendorStatus = useMutation(api.admin.updateSupplierVerification);
    const isLoading = vendorsRaw === undefined;

    const handleVerification = async (vendorId: string, status: string) => {
        try {
            await updateVendorStatus({
                token: token || "",
                supplierId: vendorId,
                verificationStatus: status,
                isVerified: status === 'verified'
            });

            toast.success(`Vendor ${status === 'verified' ? 'approved' : 'rejected'}`);
            setIsReviewOpen(false);
        } catch (error: any) {
            toast.error("Action failed: " + error.message);
        }
    };

    const filteredVendors = useMemo(() => {
        return vendors.filter((v: any) =>
            v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.slug?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vendors, searchTerm]);

    const stats = {
        total: vendors.length,
        pending: vendors.filter((v: any) => v.verificationStatus === 'pending').length,
        verified: vendors.filter((v: any) => v.verificationStatus === 'verified').length
    };


    if (isRoleLoading) return null;
    if (!isAdmin) return <div className="p-20 text-center">Unauthorized Access</div>;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter italic">Vendor <span className="text-[#D4AF37]">Moderation</span></h1>
                <p className="text-zinc-500 mt-2">Verify business licenses and activate marketplace sellers.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Total Merchants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-amber-500/20 bg-amber-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-amber-500">Awaiting Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-500">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-500">Verified Elite</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-emerald-500">{stats.verified}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <Input
                    placeholder="Search by vendor name or handle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-14 bg-zinc-900/50 border-white/5 pl-12 rounded-2xl focus:border-[#D4AF37]/50"
                />
            </div>

            {/* Table */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-black/20">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-8 py-5">Merchant</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Documents</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Joined</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right pr-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVendors.map((vendor) => (
                            <TableRow key={vendor._id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                <TableCell className="pl-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-black text-[#D4AF37] shadow-lg">
                                            {vendor.name?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-[#D4AF37] transition-colors">{vendor.name}</p>
                                            <p className="text-xs text-zinc-500">@{vendor.slug}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "text-[9px] font-black uppercase tracking-tighter px-3 py-1 border-none",
                                        vendor.verificationStatus === 'pending' ? "bg-amber-500/10 text-amber-500" :
                                            vendor.verificationStatus === 'verified' ? "bg-emerald-500/10 text-emerald-500" :
                                                "bg-zinc-800 text-zinc-500"
                                    )}>
                                        {vendor.verificationStatus || 'Unverified'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {vendor.licenseUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-zinc-700" />}
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">License & ID</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-zinc-500 text-xs font-medium">
                                    {format(new Date(vendor._creationTime), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setSelectedVendor(vendor); setIsReviewOpen(true); }}
                                        className="bg-white/5 border-white/5 hover:bg-[#D4AF37] hover:text-black transition-all rounded-xl font-bold uppercase tracking-widest text-[9px] h-9"
                                    >
                                        Review Application
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {isLoading && (
                    <div className="p-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" />
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="max-w-2xl bg-zinc-950 border-[#D4AF37]/20 p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic tracking-tighter">Review Application</DialogTitle>
                        <DialogDescription>Validate documents for {selectedVendor?.name}</DialogDescription>
                    </DialogHeader>

                    {selectedVendor && (
                        <div className="space-y-6 mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href={selectedVendor.licenseUrl}
                                    target="_blank"
                                    className="p-6 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:border-amber-500/50 transition-colors group"
                                >
                                    <FileText className="w-10 h-10 text-amber-500 group-hover:scale-110 transition-transform" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Business License</p>
                                    <ExternalLink className="w-4 h-4 text-zinc-600" />
                                </a>
                                <a
                                    href={selectedVendor.idProofUrl}
                                    target="_blank"
                                    className="p-6 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:border-blue-500/50 transition-colors group"
                                >
                                    <Building2 className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">ID Proof (NID/Passport)</p>
                                    <ExternalLink className="w-4 h-4 text-zinc-600" />
                                </a>
                            </div>

                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center gap-2 text-[#D4AF37]">
                                    <Landmark className="w-4 h-4" />
                                    <h4 className="text-xs font-black uppercase tracking-widest">Settlement Account</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Bank Name</p>
                                        <p className="text-white font-medium">{selectedVendor.bankDetails?.bankName || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Account Holder</p>
                                        <p className="text-white font-medium">{selectedVendor.bankDetails?.accountHolder || 'Not provided'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Account Number</p>
                                        <p className="text-xl font-black text-white tracking-widest font-mono">{selectedVendor.bankDetails?.accountNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-3 pt-6">
                                <Button
                                    variant="ghost"
                                    onClick={() => handleVerification(selectedVendor._id, 'rejected')}
                                    className="text-red-500 hover:bg-red-500/10 rounded-xl uppercase font-black tracking-widest text-[10px]"
                                >
                                    Reject Application
                                </Button>
                                <Button
                                    onClick={() => handleVerification(selectedVendor._id, 'verified')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl uppercase font-black tracking-widest text-[10px] px-8 h-12 shadow-lg shadow-emerald-900/20"
                                >
                                    Approve & Verify Vendor
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
