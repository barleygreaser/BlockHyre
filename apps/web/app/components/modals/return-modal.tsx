"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Camera, CheckCircle, Upload, X, Loader2, AlertCircle, ArrowLeftRight } from "lucide-react";
import { uploadReturnPhotos, initiateReturn } from "@/lib/handover-service";
import Image from "next/image";

interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string;
    listingTitle: string;
    onSuccess: () => void;
}

export function ReturnModal({
    isOpen,
    onClose,
    rentalId,
    listingTitle,
    onSuccess
}: ReturnModalProps) {
    const [step, setStep] = useState(1);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [returnConfirmed, setReturnConfirmed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length + selectedFiles.length > 6) {
            setError("Maximum 6 photos allowed");
            return;
        }

        const newFiles = files.filter(file => file.type.startsWith('image/'));

        // Create preview URLs
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));

        setSelectedFiles(prev => [...prev, ...newFiles]);
        setPreviewUrls(prev => [...prev, ...newPreviews]);
        setError(null);
    }, [selectedFiles.length]);

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length < 2) {
            setError("Please upload at least 2 photos (Front, Back, and specific areas)");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const urls = await uploadReturnPhotos(rentalId, selectedFiles);
            setUploadedUrls(urls);
            setStep(2);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload return photos');
        } finally {
            setUploading(false);
        }
    };

    const handleComplete = async () => {
        if (!returnConfirmed) {
            setError("Please confirm the tool return status");
            return;
        }

        setCompleting(true);
        setError(null);

        try {
            const result = await initiateReturn(rentalId, uploadedUrls);

            if (!result.success) {
                setError(result.error || 'Failed to initiate return');
                return;
            }

            // Success!
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred during return');
        } finally {
            setCompleting(false);
        }
    };

    const handleClose = () => {
        // Cleanup preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));

        // Reset state
        setStep(1);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setUploadedUrls([]);
        setReturnConfirmed(false);
        setError(null);

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-slate-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-display text-2xl uppercase tracking-tighter text-slate-900">
                        <ArrowLeftRight className="h-6 w-6 text-safety-orange" />
                        RETURN TOOL // {listingTitle}
                    </DialogTitle>
                    <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-[#333333] font-bold">
                        UPLOAD RETURN PHOTOS TO DOCUMENT COMPLETION AND REQUEST DEPOSIT RELEASE
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps — Telemetry Styling */}
                <div className="flex items-center justify-between py-4 border-b border-slate-100 mb-4">
                    <div className={`flex items-center gap-3 transition-colors ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                        <div className="relative flex items-center justify-center">
                            {step === 1 && (
                                <span className="absolute w-2 h-2 rounded-full bg-safety-orange animate-pulse" />
                            )}
                            {step > 1 && (
                                <CheckCircle className="h-4 w-4 text-safety-orange" />
                            )}
                            {step < 1 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            )}
                        </div>
                        <span className="font-mono text-[10px] font-bold tracking-widest">DOCUMENT</span>
                    </div>

                    <div className={`flex items-center gap-3 transition-colors ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                        <div className="relative flex items-center justify-center">
                            {step === 2 && (
                                <span className="absolute w-2 h-2 rounded-full bg-safety-orange animate-pulse" />
                            )}
                            {step < 2 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            )}
                        </div>
                        <span className="font-mono text-[10px] font-bold tracking-widest">CONFIRM</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Step 1: Upload Photos */}
                    {step === 1 && (
                        <>
                            {/* Upload Zone with Workshop Gray borders, heavy corner brackets, and scanner sweep */}
                            <div className="relative border border-[#333333] bg-slate-50/30 p-10 text-center transition-colors group overflow-hidden">
                                {/* Corner Brackets */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#333333]" />
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#333333]" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#333333]" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#333333]" />

                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    @keyframes scanSweep {
                                        0% { left: 0%; }
                                        50% { left: calc(100% - 4px); }
                                        100% { left: 0%; }
                                    }
                                    .animate-scan-sweep {
                                        animation: scanSweep 4s ease-in-out infinite;
                                    }
                                `}} />
                                {/* Scanner Sweep Animation Element */}
                                <div className="absolute top-0 bottom-0 w-1 bg-safety-orange/50 shadow-[0_0_8px_2px_rgba(255,107,0,0.5)] opacity-0 group-hover:opacity-100 animate-scan-sweep z-0 pointer-events-none" />

                                <input
                                    type="file"
                                    id="return-photo-upload"
                                    multiple
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <label htmlFor="return-photo-upload" className="cursor-pointer relative z-10 block">
                                    <div className="h-14 w-14 rounded-none bg-[#333333] flex items-center justify-center mx-auto mb-4 group-hover:bg-safety-orange transition-colors">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 mb-1 font-serif">
                                        Capture the condition
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                        MINIMUM 2 PHOTOS REQUIRED (FRONT & BACK)
                                    </p>
                                </label>
                            </div>

                            {/* Preview Grid */}
                            {previewUrls.length > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <Image
                                                src={url}
                                                alt={`Return Preview ${index + 1}`}
                                                fill
                                                className="object-cover rounded-xl border border-slate-100"
                                            />
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-center">
                                {selectedFiles.length}/6 photos selected (minimum 2 required)
                            </p>
                        </>
                    )}

                    {/* Step 2: Confirm Return */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-emerald-900 font-serif lowercase">Photos documented successfully</p>
                                        <p className="text-xs text-emerald-700 mt-0.5">{uploadedUrls.length} return verification images encrypted and saved.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-[#333333] bg-white p-6 relative">
                                {/* Corner Brackets */}
                                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#333333]" />
                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#333333]" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#333333]" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#333333]" />

                                <label className="flex items-start gap-4 cursor-pointer">
                                    <div className="relative flex items-center h-5 mt-1 border-2 border-[#333333]">
                                        <input
                                            type="checkbox"
                                            checked={returnConfirmed}
                                            onChange={(e) => setReturnConfirmed(e.target.checked)}
                                            className="h-4 w-4 appearance-none checked:bg-safety-orange cursor-pointer"
                                        />
                                        {returnConfirmed && <CheckCircle className="absolute h-3 w-3 text-white pointer-events-none left-0.5 top-0.5" strokeWidth={3} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 font-serif">Confirm tool return condition</p>
                                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                            I confirm I have returned the tool in the condition shown in these photos.
                                            I understand that the owner has 24 hours to inspect the tool before the Peace Fund coverage finalized the status.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <p className="text-xs text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 pt-6 border-t border-slate-100 mt-4 sm:space-x-0">
                    <div className="flex items-center gap-2 mr-auto">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-800 tracking-widest">INSURED BY PEACE FUND</span>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={handleClose}
                            disabled={uploading || completing}
                            className="group font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors font-bold disabled:opacity-50"
                        >
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">[</span>
                            BACK TO DASHBOARD
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">]</span>
                        </button>

                        {step === 1 && (
                            <Button
                                onClick={handleUpload}
                                disabled={selectedFiles.length < 2 || uploading}
                                className="bg-safety-orange hover:bg-[#e66000] text-white font-bold h-10 px-6 rounded-none transition-all duration-200 shadow-[0_4px_0_0_#b34b00] hover:shadow-[0_6px_0_0_#b34b00] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ENCRYPTING...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        SUBMIT DOCUMENTATION
                                    </>
                                )}
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                onClick={handleComplete}
                                disabled={!returnConfirmed || completing}
                                className="bg-safety-orange hover:bg-[#e66000] text-white font-bold h-10 px-6 rounded-none transition-all duration-200 shadow-[0_4px_0_0_#b34b00] hover:shadow-[0_6px_0_0_#b34b00] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                            >
                                {completing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        PROCESSING...
                                    </>
                                ) : (
                                    <>
                                        <ArrowLeftRight className="mr-2 h-4 w-4" />
                                        COMPLETE RETURN
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
