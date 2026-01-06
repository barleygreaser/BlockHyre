'use client';

import { Button } from "@/app/components/ui/button";
import { Star, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface RentalHistoryItemProps {
    rentalId: string;
    listingId: string;
    listingTitle: string;
    listingImageUrl?: string | null;
    endDate: string;
    hasReview: boolean;
}

export function RentalHistoryItem({
    rentalId,
    listingId,
    listingTitle,
    listingImageUrl,
    endDate,
    hasReview
}: RentalHistoryItemProps) {
    const end = new Date(endDate);

    return (
        <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
            {/* Image */}
            {listingImageUrl ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                    <img
                        src={listingImageUrl}
                        alt={listingTitle}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-slate-400" />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h5 className="font-medium text-sm text-slate-900 truncate">
                    {listingTitle}
                </h5>
                <p className="text-xs text-slate-500">
                    Completed {format(end, 'MMM d, yyyy')}
                </p>
            </div>

            {/* Action */}
            {hasReview ? (
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium shrink-0">
                    <CheckCircle className="h-4 w-4" />
                    <span>Reviewed</span>
                </div>
            ) : (
                <Link href={`/reviews/new?rental=${rentalId}`}>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-safety-orange text-white border-safety-orange hover:bg-orange-600 hover:border-orange-600 shrink-0"
                    >
                        <Star className="h-3 w-3 mr-1" />
                        Review
                    </Button>
                </Link>
            )}
        </div>
    );
}
