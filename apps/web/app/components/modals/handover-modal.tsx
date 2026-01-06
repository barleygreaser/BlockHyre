"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Camera, CheckCircle, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { uploadHandoverPhotos, completeHandover } from "@/lib/handover-service";
import Image from "next/image";

interface HandoverModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string;
    listingTitle: string;
    onSuccess: () => void;
}

export function HandoverModal({
    isOpen,
    onClose,
    rentalId,
    listingTitle,
    onSuccess
}: HandoverModalProps) {
    const [step, setStep] = useState(1);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [conditionConfirmed, setConditionConfirmed] = useState(false);
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
        if (selectedFiles.length < 3) {
            setError("Please upload at least 3 photos");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const urls = await uploadHandoverPhotos(rentalId, selectedFiles);
            setUploadedUrls(urls);
            setStep(2);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload photos');
        } finally {
            setUploading(false);
        }
    };

    const handleComplete = async () => {
        if (!conditionConfirmed) {
            setError("Please confirm the tool condition");
            return;
        }

        setCompleting(true);
        setError(null);

        try {
            const result = await completeHandover(rentalId, uploadedUrls);

            if (!result.success) {
                setError(result.error || 'Failed to complete handover');
                return;
            }

            // Success!
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
        setConditionConfirmed(false);
        setError(null);

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-safety-orange" />
                        Receive Tool - {listingTitle}
                    </DialogTitle>
                    <DialogDescription>
                        Upload verification photos to confirm tool condition and complete handover
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 py-4">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-safety-orange' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-safety-orange text-white' : 'bg-slate-200'}`}>
                            {step > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
                        </div>
                        <span className="text-sm font-medium">Upload Photos</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-slate-200" />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-safety-orange' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-safety-orange text-white' : 'bg-slate-200'}`}>
                            2
                        </div>
                        <span className="text-sm font-medium">Confirm</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Step 1: Upload Photos */}
                    {step === 1 && (
                        <>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-safety-orange transition-colors">
                                <input
                                    type="file"
                                    id="photo-upload"
                                    multiple
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <label htmlFor="photo-upload" className="cursor-pointer">
                                    <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                                    <p className="text-sm font-medium text-slate-900 mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Minimum 3 photos required (Front, Back, Serial Number)
                                    </p>
                                </label>
                            </div>

                            {/* Preview Grid */}
                            {previewUrls.length > 0 && (
                                <div className="grid grid-cols-3 gap-4">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <Image
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                width={150}
                                                height={150}
                                                className="w-full h-32 object-cover rounded-lg border border-slate-200"
                                            />
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-sm text-slate-600">
                                {selectedFiles.length}/6 photos selected (minimum 3 required)
                            </p>
                        </>
                    )}

                    {/* Step 2: Confirm Condition */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-green-900">Photos uploaded successfully!</p>
                                        <p className="text-sm text-green-700">{uploadedUrls.length} verification photos saved</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={conditionConfirmed}
                                        onChange={(e) => setConditionConfirmed(e.target.checked)}
                                        className="mt-1 h-4 w-4 text-safety-orange focus:ring-safety-orange border-slate-300 rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">I confirm the tool condition</p>
                                        <p className="text-sm text-slate-600 mt-1">
                                            I have inspected the tool and confirm that it is in the condition shown in the uploaded photos.
                                            I understand that these photos serve as baseline documentation for the Peace Fund.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleClose} disabled={uploading || completing}>
                        Cancel
                    </Button>

                    {step === 1 && (
                        <Button
                            onClick={handleUpload}
                            disabled={selectedFiles.length < 3 || uploading}
                            className="bg-safety-orange hover:bg-safety-orange/90"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Photos
                                </>
                            )}
                        </Button>
                    )}

                    {step === 2 && (
                        <Button
                            onClick={handleComplete}
                            disabled={!conditionConfirmed || completing}
                            className="bg-safety-orange hover:bg-safety-orange/90 font-bold"
                        >
                            {completing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Completing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Receive Tool
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
