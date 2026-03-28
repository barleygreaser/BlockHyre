"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Star, MessageSquare, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Image from "next/image";

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string;
    ownerId: string;
    listingTitle: string;
    listingImageUrl: string;
    onSuccess: () => void;
}

export function RatingModal({
    isOpen,
    onClose,
    rentalId,
    ownerId,
    listingTitle,
    listingImageUrl,
    onSuccess
}: RatingModalProps) {
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please provide a star rating before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('reviews')
                .insert({
                    reviewer_id: user.id,
                    reviewee_id: ownerId,
                    rental_id: rentalId,
                    rating: rating,
                    comment: comment.trim() || null
                });

            if (error) throw error;

            toast.success("Review submitted! Thank you for maintaining the network.");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to submit review:", error);
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-slate-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-display text-2xl uppercase tracking-tighter text-slate-900">
                        <Star className="h-6 w-6 text-safety-orange fill-safety-orange" />
                        RATE YOUR RENTAL // {listingTitle}
                    </DialogTitle>
                    <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-[#333333] font-bold">
                        LEAVE A REVIEW TO BUILD TRUST WITHIN THE PEACE FUND NETWORK
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-6">
                    {/* Tool Summary */}
                    <div className="flex gap-4 items-center bg-slate-50/50 p-4 border border-[#333333] relative">
                        {/* Corner Brackets */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#333333]" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#333333]" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#333333]" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#333333]" />
                        
                        <div className="h-16 w-16 relative rounded-none overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                            {listingImageUrl ? (
                                <Image src={listingImageUrl} alt={listingTitle} fill className="object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-[#333333]">
                                    <span className="font-mono text-[10px] text-white">NO IMG</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold font-serif text-slate-900">How was the {listingTitle}?</p>
                            <p className="text-xs text-slate-500 mt-1">Your rating helps verify this owner for future neighbors.</p>
                        </div>
                    </div>

                    {/* Star Selection */}
                    <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-safety-orange rounded-full"
                                >
                                    <Star 
                                        strokeWidth={1.5}
                                        className={`h-10 w-10 transition-colors ${
                                            (hoveredRating || rating) >= star 
                                                ? "text-safety-orange fill-safety-orange" 
                                                : "text-slate-300 fill-slate-50"
                                        }`} 
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="h-4">
                            <span className="font-mono text-[10px] font-bold text-safety-orange tracking-widest uppercase">
                                {rating === 1 && "1/5 - MAJOR ISSUES"}
                                {rating === 2 && "2/5 - BELOW EXPECTATIONS"}
                                {rating === 3 && "3/5 - ACCEPTABLE"}
                                {rating === 4 && "4/5 - GOOD EXPERIENCE"}
                                {rating === 5 && "5/5 - EXCELLENT TOOL & SERVICE"}
                            </span>
                        </div>
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-slate-700 tracking-widest">
                            <MessageSquare className="h-3 w-3" />
                            ADDITIONAL COMMENTS (OPTIONAL)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Condition of the tool? Owner communication? Describe your experience..."
                            className="w-full h-24 p-4 rounded-none border border-[#333333] focus:outline-none focus:ring-2 focus:ring-safety-orange/20 text-sm font-sans placeholder:text-slate-400 bg-white resize-none"
                            maxLength={500}
                        />
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] text-slate-400 font-mono">{comment.length}/500</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 pt-6 border-t border-slate-100 mt-4 sm:space-x-0">
                    <div className="flex items-center gap-2 mr-auto">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safety-orange opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-safety-orange"></span>
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-800 tracking-widest uppercase">
                            COMMUNITY VERIFICATION
                        </span>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button 
                            onClick={onClose} 
                            disabled={submitting} 
                            className="group font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors font-bold disabled:opacity-50"
                        >
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">[</span> 
                            SKIP FOR NOW 
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">]</span>
                        </button>

                        <Button
                            onClick={handleSubmit}
                            disabled={rating === 0 || submitting}
                            className="bg-safety-orange hover:bg-[#e66000] text-white font-bold h-10 px-6 rounded-none transition-all duration-200 shadow-[0_4px_0_0_#b34b00] hover:shadow-[0_6px_0_0_#b34b00] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    SUBMITTING...
                                </>
                            ) : (
                                <>
                                    SUBMIT RATING
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
