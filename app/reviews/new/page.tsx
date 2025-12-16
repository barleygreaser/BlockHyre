'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Star, Loader2 } from "lucide-react";

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

    const supabase = createClientComponentClient();

    useEffect(() => {
        async function fetchRentalInfo() {
            if (!rentalId) {
                router.push('/my-rentals');
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
            alert('Please select a rating');
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
            router.push('/my-rentals');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="container mx-auto px-4 py-20 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
                </div>
                <Footer />
            </main>
        );
    }

    if (!rentalInfo) {
        return (
            <main className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Rental Not Found</h2>
                    <p className="text-slate-600 mb-4">The rental you're trying to review doesn't exist.</p>
                    <Button onClick={() => router.push('/my-rentals')}>
                        Back to My Rentals
                    </Button>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-serif">Leave a Review</CardTitle>
                        <p className="text-sm text-slate-600 mt-2">
                            Share your experience renting <strong>{rentalInfo.listings.title}</strong> from{' '}
                            <strong>{rentalInfo.listings.users.full_name}</strong>
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Rating *
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
                                    <p className="text-sm text-slate-600 mt-2">
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
                                <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
                                    Your Review (Optional)
                                </label>
                                <textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-safety-orange focus:border-transparent resize-none"
                                    placeholder="Tell us about your experience..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={submitting || rating === 0}
                                    className="flex-1 bg-safety-orange hover:bg-orange-600 text-white"
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
                                    onClick={() => router.push('/my-rentals')}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </main>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="container mx-auto px-4 py-20 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
                </div>
                <Footer />
            </main>
        }>
            <ReviewFormContent />
        </Suspense>
    );
}
