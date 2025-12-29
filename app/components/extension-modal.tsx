"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { CalendarClock, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { addDays, format, differenceInDays } from "date-fns";

interface ExtensionModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string;
    listingTitle: string;
    currentEndDate: string;
    dailyPrice: number;
    riskFee: number;
    onSuccess: () => void;
}

export function ExtensionModal({
    isOpen,
    onClose,
    rentalId,
    listingTitle,
    currentEndDate,
    dailyPrice,
    riskFee,
    onSuccess
}: ExtensionModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentEnd = new Date(currentEndDate);
    const minDate = addDays(currentEnd, 1); // At least 1 day extension

    // Calculate pricing preview
    const extraDays = selectedDate ? differenceInDays(selectedDate, currentEnd) : 0;
    const additionalRentalFee = dailyPrice * extraDays;
    const additionalPeaceFund = dailyPrice * riskFee * extraDays;
    const totalCost = additionalRentalFee + additionalPeaceFund;

    const handleSubmit = async () => {
        if (!selectedDate) {
            setError("Please select a new end date");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const { data, error: rpcError } = await supabase.rpc('request_rental_extension', {
                p_rental_id: rentalId,
                p_new_end_date: selectedDate.toISOString()
            });

            if (rpcError) {
                setError(rpcError.message);
                return;
            }

            if (!data.success) {
                setError(data.error || 'Failed to submit extension request');
                return;
            }

            // Success!
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedDate(undefined);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-safety-orange" />
                        Request Extension - {listingTitle}
                    </DialogTitle>
                    <DialogDescription>
                        Extend your rental period. The owner will need to approve this request.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current End Date Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-sm text-slate-600">Current end date:</p>
                        <p className="font-semibold text-slate-900">{format(currentEnd, 'MMMM d, yyyy')}</p>
                    </div>

                    {/* Date Picker */}
                    <div>
                        <label className="text-sm font-medium text-slate-900 mb-2 block">
                            Select new end date:
                        </label>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < minDate}
                            className="rounded-md border"
                        />
                    </div>

                    {/* Pricing Preview */}
                    {selectedDate && extraDays > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                                <CalendarClock className="h-4 w-4" />
                                Extension Summary
                            </h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Extra days:</span>
                                    <span className="font-semibold text-blue-900">{extraDays}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Rental fee:</span>
                                    <span className="text-blue-900">${additionalRentalFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Peace Fund fee:</span>
                                    <span className="text-blue-900">${additionalPeaceFund.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-blue-300">
                                    <span className="font-semibold text-blue-900">Total cost:</span>
                                    <span className="font-bold text-blue-900">${totalCost.toFixed(2)}</span>
                                </div>
                            </div>
                            <p className="text-xs text-blue-600 mt-2">
                                💳 You will be charged only after the owner approves this request.
                            </p>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedDate || submitting}
                        className="bg-safety-orange hover:bg-safety-orange/90"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CalendarClock className="mr-2 h-4 w-4" />
                                Request Extension
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
