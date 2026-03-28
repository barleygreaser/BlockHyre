"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { X, CheckCircle, AlertTriangle, MessageSquare, Loader2, Camera, Calendar } from "lucide-react";
import confetti from "canvas-confetti";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReturnInspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string;
    listingTitle: string;
    renterName: string;
    pickupPhotos: string[];
    returnPhotos: string[];
    pickupDate: string;
    returnDate: string;
    onSuccess: () => void;
}

export function ReturnInspectionModal({
    isOpen,
    onClose,
    rentalId,
    listingTitle,
    renterName,
    pickupPhotos,
    returnPhotos,
    pickupDate,
    returnDate,
    onSuccess
}: ReturnInspectionModalProps) {
    const [isDisputing, setIsDisputing] = useState(false);
    const [disputeReason, setDisputeReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [selectedPickupIndex, setSelectedPickupIndex] = useState(0);
    const [selectedReturnIndex, setSelectedReturnIndex] = useState(0);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Unauthorized");

            const res = await fetch("/api/rentals/finalize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ rentalId })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to finalize rental");

            // Trigger confetti
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FF6B00', '#1A1A1A', '#FAFAF8']
            });

            toast.success("Rental finalized and deposit released!");
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Completion failed:", err);
            toast.error("Failed to finalize rental. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDispute = async () => {
        if (!disputeReason.trim()) {
            toast.error("Please provide a reason for the dispute.");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('rentals')
                .update({
                    status: 'disputed',
                    disputed_at: new Date().toISOString(),
                    dispute_reason: disputeReason
                })
                .eq('id', rentalId);

            if (error) throw error;

            toast.warning("Dispute raised. The Peace Fund tribunal has been notified.");
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Dispute failed:", err);
            toast.error("Failed to create dispute.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Unknown';
        return format(new Date(dateStr), 'MMM d, h:mm a');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-6xl bg-signal-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh] border border-workshop-gray/20">

                {/* Industrial Header */}
                <div className="bg-charcoal p-8 flex justify-between items-center shrink-0 border-b-4 border-safety-orange">
                    <div className="flex gap-4 items-center">
                        <div className="h-14 w-14 rounded-2xl bg-safety-orange/10 border border-safety-orange/30 flex items-center justify-center">
                            <Camera className="h-7 w-7 text-safety-orange" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-signal-white font-display uppercase tracking-tighter">RETURN INSPECTION // {listingTitle}</h2>
                            <p className="text-concrete/60 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">OPERATIONAL PROTOCOL 442-B // RENTER: {renterName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full border border-concrete/10 flex items-center justify-center text-concrete/40 hover:text-signal-white hover:border-concrete/30 transition-all active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Pickup Evidence Column */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-workshop-gray/10 pb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <h3 className="font-bold text-charcoal font-serif">Original Condition</h3>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{formatDate(pickupDate)}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="aspect-[4/3] bg-[#1a1a1a] border-2 border-[#333333] relative group p-2">
                                    {/* Corner Brackets */}
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-safety-orange/50 z-10" />
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-safety-orange/50 z-10" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-safety-orange/50 z-10" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-safety-orange/50 z-10" />
                                    
                                    <div className="relative w-full h-full overflow-hidden">
                                        {pickupPhotos.length > 0 ? (
                                            <Image
                                                src={pickupPhotos[selectedPickupIndex]}
                                                alt="Pickup Evidence"
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-[10px]">No photos found</div>
                                        )}
                                    </div>
                                    <div className="absolute top-4 left-4 bg-charcoal/80 backdrop-blur-md text-signal-white text-[9px] font-mono px-3 py-1.5 uppercase tracking-widest border border-[#333333] z-20 shadow-md">
                                        BASE DOCUMENT
                                    </div>
                                </div>

                                {/* Thumbnails */}
                                <div className="flex gap-2 pb-2 overflow-x-auto">
                                    {pickupPhotos.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedPickupIndex(i)}
                                            className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedPickupIndex === i ? 'border-safety-orange scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <Image src={url} alt={`Pickup thumb ${i}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Return Evidence Column */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-workshop-gray/10 pb-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-safety-orange" />
                                    <h3 className="font-bold text-charcoal font-serif">Returned Condition</h3>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-safety-orange uppercase tracking-widest">{formatDate(returnDate)}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="aspect-[4/3] bg-[#1a1a1a] border-2 border-[#333333] relative group p-2">
                                    {/* Corner Brackets */}
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-safety-orange z-10" />
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-safety-orange z-10" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-safety-orange z-10" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-safety-orange z-10" />

                                    <div className="relative w-full h-full overflow-hidden">
                                        {returnPhotos.length > 0 ? (
                                            <Image
                                                src={returnPhotos[selectedReturnIndex]}
                                                alt="Return Evidence"
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-[10px]">No photos found</div>
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-safety-orange text-signal-white text-[9px] font-mono px-3 py-1.5 uppercase tracking-widest shadow-md z-20">
                                        VERIFICATION PROTOCOL
                                    </div>
                                </div>

                                {/* Thumbnails */}
                                <div className="flex gap-2 pb-2 overflow-x-auto">
                                    {returnPhotos.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedReturnIndex(i)}
                                            className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedReturnIndex === i ? 'border-safety-orange scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <Image src={url} alt={`Return thumb ${i}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Damage Module */}
                    <div className="mt-6">
                        {!isDisputing ? (
                            <button
                                onClick={() => setIsDisputing(true)}
                                className="group flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full border-2 border-red-100 flex items-center justify-center group-hover:bg-red-50 transition-all">
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">[ FLAG DAMAGE OR MISSING PARTS ]</span>
                            </button>
                        ) : (
                            <div className="p-8 bg-red-50 border-2 border-red-200 rounded-[2rem] animate-in slide-in-from-top-4 duration-300">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="h-10 w-10 rounded-2xl bg-red-100 flex items-center justify-center">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-900 font-serif">Initiate Peace Fund Claim</h4>
                                        <p className="text-xs text-red-700/70 mt-1">This will lock the security deposit and transition the rental into 'Disputed' status for manual review.</p>
                                    </div>
                                </div>
                                <textarea
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    className="w-full h-32 p-5 rounded-2xl border-2 border-red-200 focus:outline-none focus:ring-4 focus:ring-red-500/10 text-sm font-sans placeholder:text-red-300 bg-white"
                                    placeholder="Precisely describe the issue. Reference the return photos above."
                                ></textarea>
                                <div className="flex justify-end gap-3 mt-4">
                                    <Button variant="ghost" onClick={() => setIsDisputing(false)} className="group font-mono text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700 font-bold transition-colors">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">[</span> 
                                        CANCEL 
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">]</span>
                                    </Button>
                                    <Button
                                        onClick={handleDispute}
                                        disabled={submitting}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-none px-8 transition-all duration-200 shadow-[0_4px_0_0_#991b1b] hover:shadow-[0_6px_0_0_#991b1b] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                                    >
                                        SUBMIT TO TRIBUNAL
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* High-Performance Footer */}
                <div className="p-10 bg-workshop-gray/5 border-t border-workshop-gray/10 flex flex-col sm:flex-row justify-between items-center gap-8 shrink-0">
                    <div className="flex items-center gap-2 mr-auto">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-800 tracking-widest uppercase">
                            FINAL VERIFICATION LAYER // INSURED BY PEACE FUND
                        </span>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button
                            onClick={handleConfirm}
                            disabled={submitting || isDisputing}
                            className="flex-1 sm:flex-none bg-safety-orange hover:bg-[#e66000] text-white font-bold h-14 rounded-none px-12 transition-all duration-200 shadow-[0_4px_0_0_#b34b00] hover:shadow-[0_6px_0_0_#b34b00] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    FINALIZING...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    CONDITION CONFIRMED: FINALIZE
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
