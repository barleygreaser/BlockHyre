'use client';

import { Button } from "@/components/ui/button";
import { Star, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
                <div className="relative w-12 h-12 rounded-interactive overflow-hidden flex-shrink-0 bg-slate-200">
                    <Image
                        src={listingImageUrl}
                        alt={listingTitle}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                </div>
            ) : (
                <div className="w-12 h-12 rounded-interactive bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-slate-400" />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h5 className="font-serif font-medium text-sm text-midnight-navy truncate">
                    {listingTitle}
                </h5>
                <p className="text-xs font-mono text-slate-500">
                    Completed {format(end, 'MMM d, yyyy')}
                </p>
            </div>

            {/* Action */}
            {hasReview ? (
                <div className="flex items-center gap-1 text-2xs font-mono uppercase tracking-industrial font-bold text-emerald-600 shrink-0">
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
