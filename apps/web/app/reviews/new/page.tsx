'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

function ReviewFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rentalId = searchParams.get('rental');

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [rentalInfo, setRentalInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRentalInfo() {
            if (!rentalId) {
                router.push('/dashboard/renter/rentals');
                return;
            }

            try {
                // Fetch rental details to show context
                const { data, error } = await supabase
                    .from('rentals')
                    .select(`
            id,
            end_date,
            listings:listing_id (
              id,
              title,
              owner_id,
              users:owner_id (
                id,
                full_name
              )
            )
          `)
                    .eq('id', rentalId)
                    .single();

                if (error) throw error;
                setRentalInfo(data);
            } catch (error) {
                console.error('Error fetching rental:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRentalInfo();
    }, [rentalId, router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!rentalInfo) return;

        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            // Insert review
            const { error } = await supabase
                .from('reviews')
                .insert({
                    reviewer_id: user.id,
                    reviewee_id: rentalInfo.listings.users.id,
                    rental_id: rentalId,
                    rating,
                    comment: comment.trim() || null
                });

            if (error) throw error;

            // Redirect back to my rentals
            router.push('/dashboard/renter/rentals');
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-20 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
                </div>
                <Footer />
            </main>
        );
    }

    if (!rentalInfo) {
        return (
            <main className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-20">
                    <div className="max-w-md mx-auto text-center bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Rental Not Found</h2>
                        <p className="text-slate-600 mb-6 font-mono text-sm">The rental you're trying to review doesn't exist.</p>
                        <Button
                            onClick={() => router.push('/dashboard/renter/rentals')}
                            className="w-full bg-safety-orange hover:bg-safety-orange/90 text-white font-bold text-xs uppercase tracking-wider rounded-full h-10 shadow-lg shadow-safety-orange/20"
                        >
                            Back to My Rentals
                        </Button>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900 tracking-tight">Leave a Review</h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            Share your experience renting <strong>{rentalInfo.listings.title}</strong> from{' '}
                            <strong>{rentalInfo.listings.users.full_name}</strong>
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Rating */}
                        <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-3">
                                Rating <span className="text-safety-orange">*</span>
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`h-10 w-10 ${star <= (hoverRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-slate-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p className="text-xs font-mono font-bold text-slate-600 mt-3 bg-slate-100 inline-block px-3 py-1 rounded-full uppercase tracking-wider">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent'}
                                </p>
                            )}
                        </div>

                        {/* Comment */}
                        <div>
                            <label htmlFor="comment" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-3">
                                Your Review <span className="text-slate-400 normal-case tracking-normal font-sans font-normal">(Optional)</span>
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-safety-orange/50 focus:border-safety-orange focus:bg-white transition-all resize-none font-mono text-sm shadow-inner"
                                placeholder="Tell us about your experience..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={submitting || rating === 0}
                                className="flex-1 bg-safety-orange hover:bg-safety-orange/90 text-white font-bold text-xs uppercase tracking-wider rounded-full h-12 shadow-lg shadow-safety-orange/20 transition-all active:scale-[0.98]"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/dashboard/renter/rentals')}
                                disabled={submitting}
                                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-full h-12"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </main>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-20 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
                </div>
                <Footer />
            </main>
        }>
            <ReviewFormContent />
        </Suspense>
    );
}
