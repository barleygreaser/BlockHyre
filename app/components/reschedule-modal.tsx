"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Calendar } from "lucide-react";

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string;
    currentStartDate: string;
    currentEndDate: string;
    listingTitle: string;
    onSuccess: () => void;
}

export function RescheduleModal({
    isOpen,
    onClose,
    rentalId,
    currentStartDate,
    currentEndDate,
    listingTitle,
    onSuccess
}: RescheduleModalProps) {
    const [startDate, setStartDate] = useState(currentStartDate.split('T')[0]);
    const [endDate, setEndDate] = useState(currentEndDate.split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            // Convert to ISO timestamps
            const startTimestamp = new Date(startDate).toISOString();
            const endTimestamp = new Date(endDate).toISOString();

            const { error: rpcError } = await supabase.rpc('reschedule_rental_dates', {
                p_rental_id: rentalId,
                p_start_date: startTimestamp,
                p_end_date: endTimestamp
            });

            if (rpcError) {
                setError(rpcError.message);
                return;
            }

            // Success
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-safety-orange" />
                        Change Booking Dates
                    </DialogTitle>
                    <DialogDescription>
                        Update the dates for <strong>{listingTitle}</strong>. New dates must be available.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 border border-red-200 p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-safety-orange hover:bg-safety-orange/90"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Dates'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
