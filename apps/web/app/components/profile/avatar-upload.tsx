"use client";

import { useState, useRef, useEffect } from "react";
import { User, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
    currentUrl?: string | null;
    onFileSelect: (file: File) => void;
    className?: string;
}

export function AvatarUpload({
    currentUrl,
    onFileSelect,
    className
}: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup Object URL on unmount or change
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        // 1. Size (3MB)
        if (file.size > 3 * 1024 * 1024) {
            setError("File size must be less than 3MB");
            return;
        }

        // 2. Type (JPEG, PNG, GIF)
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
            setError("Only JPEG, PNG, or GIF files are allowed");
            return;
        }

        // Success
        setError(null);
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onFileSelect(file);
    };

    const triggerSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>
            <div className="relative group cursor-pointer" onClick={triggerSelect}>
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Avatar Preview"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <User className="h-16 w-16 text-slate-300" />
                    )}
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                </div>
            </div>

            <div className="text-center space-y-2">
                <Button variant="outline" size="sm" onClick={triggerSelect}>
                    Change Photo
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                <p className="text-xs text-slate-500">
                    Max 3MB. PNG, JPEG, GIF.
                </p>
            </div>
        </div>
    );
}
