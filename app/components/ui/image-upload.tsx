"use client";

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/context/auth-context';
import { Upload, X, Loader2, Crop as CropIcon } from 'lucide-react';
import Image from 'next/image';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

interface ImageUploadProps {
    bucket: 'avatars' | 'tool_images';
    onUpload: (url: string) => void;
    initialValue?: string;
    folder?: string;
    className?: string;
    label?: string;
    aspectRatio?: number; // Optional prop to enforce aspect ratio
    children?: React.ReactNode;
}

export function ImageUpload({
    bucket,
    onUpload,
    initialValue,
    folder,
    className = "",
    label = "Upload Image",
    aspectRatio = 4 / 3, // Default aspect ratio for tools
    children
}: ImageUploadProps) {
    const { user } = useAuth();
    const [preview, setPreview] = useState<string | null>(initialValue || null);
    const [uploading, setUploading] = useState(false);

    // Crop state
    const [imgSrc, setImgSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (initialValue) {
            setPreview(initialValue);
        }
    }, [initialValue]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Reset crop
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || ''),
            );
            reader.readAsDataURL(e.target.files[0]);
            setIsCropDialogOpen(true);
        }
        // Reset input so same file selection triggers change again if needed
        e.target.value = '';
    };

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspectRatio) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspectRatio));
        }
    }

    const performUpload = async (blob: Blob) => {
        if (!user) {
            alert("You must be logged in to upload images.");
            return;
        }

        setUploading(true);
        try {
            const fileExt = "jpg"; // We are converting to jpeg in canvas
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = folder
                ? `${user.id}/${folder}/${fileName}`
                : `${user.id}/${fileName}`;

            const fileToUpload = new File([blob], fileName, { type: 'image/jpeg' });

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, fileToUpload, {
                    upsert: true,
                    contentType: 'image/jpeg'
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onUpload(publicUrl);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Error uploading image: ${error.message}`);
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleCropConfirm = async () => {
        if (completedCrop && imgRef.current) {
            setIsCropDialogOpen(false);
            const blob = await getCroppedImg(imgRef.current, completedCrop);
            if (blob) {
                await performUpload(blob);
            }
        }
    };

    const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return Promise.resolve(null);
        }

        const pixelRatio = window.devicePixelRatio;
        canvas.width = Math.floor(crop.width * pixelRatio * scaleX);
        canvas.height = Math.floor(crop.height * pixelRatio * scaleY);

        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = 'high';

        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;
        const cropWidth = crop.width * scaleX;
        const cropHeight = crop.height * scaleY;

        const centerX = image.naturalWidth / 2;
        const centerY = image.naturalHeight / 2;

        ctx.save();
        ctx.translate(-cropX, -cropY);

        ctx.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
        )

        ctx.restore();

        // As a blob
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/jpeg',
                0.9 // Quality
            );
        });
    };

    const clearImage = (e: React.MouseEvent) => {
        e.preventDefault();
        setPreview(null);
        onUpload('');
    };

    const triggerSelect = (e: React.MouseEvent) => {
        e.preventDefault();
        fileInputRef.current?.click();
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

            <div className="flex items-center gap-4 h-full w-full">
                <div
                    onClick={triggerSelect}
                    className={children ? `
                        relative w-full h-full cursor-pointer overflow-hidden
                    ` : `
                        relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 
                        flex flex-col items-center justify-center cursor-pointer 
                        hover:border-gray-400 transition-colors overflow-hidden bg-gray-50
                        ${preview ? 'border-solid border-gray-200' : ''}
                    `}
                >
                    {children ? (
                        <>
                            {children}
                            {/* Hidden preview overlay if needed, or we rely on parent to handle preview */}
                            {preview && !initialValue && (
                                <div className="absolute inset-0 z-[-1] invisible">
                                    {/* We don't show preview if children are provided, assuming custom UI or parent handles it. 
                                         But we might want to still show loading state? 
                                     */}
                                </div>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {preview ? (
                                <div className="relative w-full h-full group">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        sizes="128px"
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 index-10">
                                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">Change</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-400 text-center p-2">
                                    <Upload className="h-8 w-8 mx-auto mb-1" />
                                    <span className="text-xs">Click to upload</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {preview && !uploading && (
                    <button
                        onClick={clearImage}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove image"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center p-4 bg-slate-100 rounded-md overflow-hidden max-h-[60vh]">
                        {!!imgSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspectRatio}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    style={{ transform: `scale(1)` }}
                                    onLoad={onImageLoad}
                                    className="max-w-full object-contain"
                                />
                            </ReactCrop>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCropDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCropConfirm} className="bg-safety-orange hover:bg-safety-orange/90 text-white">
                            Upload Photo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
