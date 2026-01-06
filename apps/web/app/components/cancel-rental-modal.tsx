"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";

interface CancelRentalModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string;
    listingTitle: string;
    onSuccess: () => void;
}

export function CancelRentalModal({
    isOpen,
    onClose,
    rentalId,
    listingTitle,
    onSuccess
}: CancelRentalModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCancel = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            const { error: rpcError } = await supabase.rpc('cancel_rental_request', {
                p_rental_id: rentalId
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
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Cancel Booking
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel your booking for <strong>{listingTitle}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-3 mb-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Keep Booking
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 font-bold text-white"
                    >
                        {isSubmitting ? 'Canceling...' : 'Yes, Cancel Booking'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
