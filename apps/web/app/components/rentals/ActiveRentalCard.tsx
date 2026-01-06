'use client';

import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { MessageSquare, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ActiveRentalCardProps {
    rentalId: string;
    listingId: string;
    listingTitle: string;
    listingImageUrl?: string | null;
    ownerName: string;
    ownerId: string;
    endDate: string;
    dashboardStatus: 'overdue' | 'due_today' | 'active';
}

export function ActiveRentalCard({
    rentalId,
    listingId,
    listingTitle,
    listingImageUrl,
    ownerName,
    ownerId,
    endDate,
    dashboardStatus
}: ActiveRentalCardProps) {
    const statusConfig = {
        overdue: {
            bgColor: 'bg-red-50 border-red-200',
            badgeColor: 'bg-red-100 text-red-700 border-red-200',
            label: 'OVERDUE',
            emoji: '🚨'
        },
        due_today: {
            bgColor: 'bg-yellow-50 border-yellow-200',
            badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            label: 'DUE TODAY',
            emoji: '⚡'
        },
        active: {
            bgColor: 'bg-blue-50 border-blue-200',
            badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
            label: 'ACTIVE',
            emoji: '✓'
        }
    };

    const config = statusConfig[dashboardStatus];
    const dueDate = new Date(endDate);
    const timeUntilDue = formatDistanceToNow(dueDate, { addSuffix: true });

    return (
        <Card className={`${config.bgColor} border shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    {/* Image */}
                    {listingImageUrl ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                            <img
                                src={listingImageUrl}
                                alt={listingTitle}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-4xl">{config.emoji}</span>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-lg text-slate-900 truncate">
                                {listingTitle}
                            </h3>
                            <Badge className={`${config.badgeColor} px-3 py-1 text-xs font-bold shrink-0`}>
                                {config.label}
                            </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Due {timeUntilDue}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>Owner: {ownerName}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                            <Link href={`/my-rentals/${rentalId}`} className="flex-1">
                                <Button variant="outline" className="w-full" size="sm">
                                    View Details
                                </Button>
                            </Link>
                            <Link href={`/messages?listing=${listingId}&owner=${ownerId}`}>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    Message
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
