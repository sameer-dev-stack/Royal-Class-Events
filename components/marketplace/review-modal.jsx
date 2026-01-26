"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import useAuthStore from "@/hooks/use-auth-store";
import { Star, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ReviewModal({
    open,
    onOpenChange,
    supplierId,
    supplierName
}) {
    const { user } = useAuthStore();
    const { supabase } = useSupabase();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user) {
            toast.error("Please login to submit a review.");
            return;
        }

        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }

        if (comment.trim().length < 10) {
            toast.error("Please write at least 10 characters.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('supplier_reviews')
                .insert({
                    supplier_id: supplierId,
                    user_id: user.id,
                    rating,
                    comment: comment.trim(),
                });

            if (error) throw error;

            toast.success("Review submitted successfully!");
            onOpenChange(false);
            setRating(0);
            setComment("");
        } catch (err) {
            toast.error(err.message || "Failed to submit review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Review {supplierName}</DialogTitle>
                    <DialogDescription>
                        Share your experience to help others choose the right vendor.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Star Rating */}
                    <div className="text-center">
                        <p className="text-sm text-zinc-400 mb-3">Tap to rate</p>
                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                                            ? "fill-[#F7E08B] text-[#F7E08B]"
                                            : "text-zinc-600"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {(hoverRating || rating) > 0 && (
                            <p className="mt-2 text-[#F7E08B] font-medium">
                                {ratingLabels[hoverRating || rating]}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <Textarea
                            placeholder="How was your experience? Share details about the service quality, communication, and overall satisfaction..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="bg-zinc-950 border-zinc-800 min-h-[120px] resize-none"
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            {comment.length} / 500 characters
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                        className="bg-gradient-to-r from-[#D4AF37] to-orange-600 hover:from-[#8C7326] hover:to-orange-700"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 mr-2" />
                        )}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

