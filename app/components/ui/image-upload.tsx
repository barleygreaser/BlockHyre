"use client";

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/context/auth-context';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    bucket: 'avatars' | 'tool_images';
    onUpload: (url: string) => void;
    initialValue?: string;
    folder?: string; // Optional subfolder inside user_id/
    className?: string;
    label?: string;
}

export function ImageUpload({
    bucket,
    onUpload,
    initialValue,
    folder,
    className = "",
    label = "Upload Image"
}: ImageUploadProps) {
    const { user } = useAuth();
    const [preview, setPreview] = useState<string | null>(initialValue || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialValue) {
            setPreview(initialValue);
        }
    }, [initialValue]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        const file = e.target.files[0];

        // Create local preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        if (!user) {
            alert("You must be logged in to upload images.");
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            // Path logic: userId/[folder/]fileName
            // RLS policy enforces (storage.foldername(name))[1] = auth.uid()
            // So path MUST start with userId
            const filePath = folder
                ? `${user.id}/${folder}/${fileName}`
                : `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath, {
                    transform: {
                        width: 1200,
                        quality: 80,
                    }
                });

            onUpload(publicUrl);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Error uploading image: ${error.message}`);
            setPreview(null); // Reset on error
        } finally {
            setUploading(false);
        }
    };

    const clearImage = (e: React.MouseEvent) => {
        e.preventDefault();
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onUpload('');
    };

    const triggerSelect = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission if inside a form
        fileInputRef.current?.click();
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

            <div className="flex items-center gap-4">
                <div
                    onClick={triggerSelect}
                    className={`
                    relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 
                    flex flex-col items-center justify-center cursor-pointer 
                    hover:border-gray-400 transition-colors overflow-hidden bg-gray-50
                    ${preview ? 'border-solid border-gray-200' : ''}
                `}
                >
                    {preview ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={preview}
                                alt="Preview"
                                fill
                                className="object-cover"
                                sizes="128px"
                            />
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center p-2">
                            <Upload className="h-8 w-8 mx-auto mb-1" />
                            <span className="text-xs">Click to upload</span>
                        </div>
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
        </div>
    );
}
