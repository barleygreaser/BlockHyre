"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { X, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";
import confetti from "canvas-confetti";

interface ReturnInspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReturnInspectionModal({ isOpen, onClose }: ReturnInspectionModalProps) {
    const [isDisputing, setIsDisputing] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = () => {
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF6700', '#0f172a', '#ffffff']
        });

        // Close modal after a delay
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-serif">Return Inspection</h2>
                        <p className="text-slate-400 text-sm">Compare condition photos to release the deposit.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Pickup Condition */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Condition at Pickup</h3>
                                <span className="text-xs text-slate-500">Oct 12, 9:00 AM</span>
                            </div>
                            <div className="aspect-video bg-slate-100 rounded-lg border-2 border-slate-200 overflow-hidden relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://placehold.co/600x400/e2e8f0/1e293b?text=Pickup+Condition"
                                    alt="Pickup Condition"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    Verified by Renter
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 italic">
                                "No visible damage. Blade guard intact."
                            </p>
                        </div>

                        {/* Right: Return Condition */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Condition at Return</h3>
                                <span className="text-xs text-slate-500">Today, 4:30 PM</span>
                            </div>
                            <div className="aspect-video bg-slate-100 rounded-lg border-2 border-safety-orange overflow-hidden relative shadow-md">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://placehold.co/600x400/e2e8f0/1e293b?text=Return+Condition"
                                    alt="Return Condition"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-safety-orange text-white text-xs px-2 py-1 rounded font-bold animate-pulse">
                                    New Upload
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 italic">
                                "Cleaned and oiled. Ready for next use."
                            </p>
                        </div>
                    </div>

                    {isDisputing && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg animate-in slide-in-from-top-2">
                            <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Report an Issue
                            </h4>
                            <textarea
                                className="w-full h-24 p-3 rounded-md border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                                placeholder="Describe the damage or issue..."
                            ></textarea>
                            <div className="flex justify-end gap-2 mt-3">
                                <Button variant="ghost" size="sm" onClick={() => setIsDisputing(false)} className="text-red-600 hover:text-red-700 hover:bg-red-100">Cancel</Button>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">Submit to Tribunal</Button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="text-sm text-slate-500">
                        Releasing the deposit is final and cannot be undone.
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="flex-1 sm:flex-none border-slate-300 text-slate-700 hover:bg-slate-100"
                            onClick={() => setIsDisputing(true)}
                        >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Report Issue
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleConfirm}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Good Condition
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
