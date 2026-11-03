'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

interface UpcomingBookingCardProps {
    rentalId: string;
    listingId: string;
    listingTitle: string;
    listingImageUrl?: string | null;
    startDate: string;
    endDate: string;
    totalDays: number;
    daysUntilStart: number;
}

export function UpcomingBookingCard({
    rentalId,
    listingId,
    listingTitle,
    listingImageUrl,
    startDate,
    endDate,
    totalDays,
    daysUntilStart
}: UpcomingBookingCardProps) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return (
        <Card className="border-slate-200/80 rounded-card shadow-xs hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    {/* Image */}
                    {listingImageUrl ? (
                        <div className="relative w-16 h-16 rounded-interactive overflow-hidden flex-shrink-0 bg-slate-200">
                            <Image
                                src={listingImageUrl}
                                alt={listingTitle}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-interactive bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-6 w-6 text-slate-400" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-midnight-navy truncate mb-1">
                            {listingTitle}
                        </h4>
                        <div className="text-xs font-mono text-slate-600 space-y-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>{format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium text-safety-orange">
                                    Starts in {daysUntilStart} {daysUntilStart === 1 ? 'day' : 'days'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <Link href={`/my-rentals/${rentalId}`}>
                        <Button variant="outline" size="sm" className="rounded-interactive active:translate-y-0.5 text-xs font-semibold">
                            View
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
