"use client";

import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { ImageUpload } from "@/app/components/ui/image-upload";
import { Badge } from "@/app/components/ui/badge";
import { Trash2, GripVertical, Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageManagerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    images: string[];
    onSave: (reorderedImages: string[]) => void;
}

interface SortableImageProps {
    id: string;
    url: string;
    index: number;
    isPrimary: boolean;
    onDelete: () => void;
}

function SortableImage({ id, url, index, isPrimary, onDelete }: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "relative group rounded-lg border-2 bg-white overflow-hidden transition-all cursor-grab active:cursor-grabbing",
                isDragging ? "opacity-50 scale-105 shadow-2xl z-50" : "shadow-sm hover:shadow-md"
            )}
        >
            {/* Drag Handle Icon (visual indicator only) */}
            <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none">
                <GripVertical className="h-4 w-4 text-slate-600" />
            </div>

            {/* Primary Badge */}
            {isPrimary && (
                <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-safety-orange text-white shadow-sm pointer-events-none">
                        Main Cover
                    </Badge>
                </div>
            )}

            {/* Image */}
            <div className="aspect-square">
                <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                />
            </div>

            {/* Delete Button */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 shadow-md"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Position Indicator */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md">
                {index + 1}
            </div>
        </div>
    );
}

export function ImageManagerModal({ open, onOpenChange, images, onSave }: ImageManagerModalProps) {
    const [localImages, setLocalImages] = useState<string[]>(images);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Sync local state when modal opens or images prop changes
    useState(() => {
        if (open) {
            setLocalImages(images);
        }
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLocalImages((items) => {
                const oldIndex = items.findIndex((_, i) => i.toString() === active.id);
                const newIndex = items.findIndex((_, i) => i.toString() === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleDelete = (index: number) => {
        setDeleteIndex(index);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            const newImages = localImages.filter((_, i) => i !== deleteIndex);
            setLocalImages(newImages);
            setDeleteIndex(null);
            setShowDeleteConfirm(false);
        }
    };

    const handleUpload = async (url: string) => {
        if (localImages.length >= 5) {
            toast.error("Maximum 5 images allowed");
            return;
        }
        setLocalImages([...localImages, url]);
        toast.success("Image uploaded successfully");
    };

    const handleSave = () => {
        if (localImages.length < 2) {
            toast.error("Minimum 2 images required for a listing");
            return;
        }
        onSave(localImages);
        onOpenChange(false);
        toast.success("Images updated successfully");
    };

    const handleCancel = () => {
        setLocalImages(images); // Reset to original
        onOpenChange(false);
    };

    const canUpload = localImages.length < 5;
    const canSave = localImages.length >= 2 && localImages.length <= 5;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif">Manage Photos</DialogTitle>
                        <DialogDescription>
                            Drag and drop to reorder. The first image will be your main cover photo.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Guidelines */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm space-y-1">
                            <p className="font-medium text-slate-800">Photo Requirements</p>
                            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                                <li><strong>2-5 images</strong> required per listing</li>
                                <li>First image becomes your <strong>main cover photo</strong></li>
                                <li>Drag images to reorder them</li>
                            </ul>
                        </div>
                    </div>

                    {/* Image Count */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">
                            {localImages.length} of 5 images
                        </p>
                        {localImages.length < 2 && (
                            <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Need {2 - localImages.length} more
                            </Badge>
                        )}
                        {localImages.length >= 2 && localImages.length <= 5 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                ✓ Ready to save
                            </Badge>
                        )}
                    </div>

                    {/* Images Grid with Upload Slot */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={localImages.map((_, i) => i.toString())}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {localImages.map((url, index) => (
                                    <SortableImage
                                        key={index}
                                        id={index.toString()}
                                        url={url}
                                        index={index}
                                        isPrimary={index === 0}
                                        onDelete={() => handleDelete(index)}
                                    />
                                ))}

                                {/* Upload Slot */}
                                {canUpload && (
                                    <div className="relative aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 transition-all group">
                                        <ImageUpload
                                            key={localImages.length} // Force reset after upload to clear internal preview
                                            bucket="tool_images"
                                            folder="listings"
                                            onUpload={handleUpload}
                                            label=""
                                            className="w-full h-full"
                                        >
                                            <div className="flex flex-col items-center justify-center w-full h-full">
                                                <Upload className="h-8 w-8 text-slate-400 group-hover:text-slate-600 mb-2 transition-colors" />
                                                <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Add Image</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{localImages.length + 1} of 5</p>
                                            </div>
                                        </ImageUpload>
                                    </div>
                                )}

                                {!canUpload && (
                                    <div className="relative aspect-square rounded-lg border-2 border-slate-200 bg-slate-100 flex flex-col items-center justify-center opacity-50">
                                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                        <p className="text-xs font-medium text-slate-500">Maximum</p>
                                        <p className="text-xs text-slate-500">5 images</p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {localImages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Upload className="h-12 w-12 text-slate-400 mb-3" />
                            <p className="text-sm font-medium text-slate-600 mb-1">No images yet</p>
                            <p className="text-xs text-slate-500">Click the upload box above to add your first image</p>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!canSave}
                            className="bg-safety-orange hover:bg-orange-600"
                        >
                            {!canSave && localImages.length < 2
                                ? `Need ${2 - localImages.length} more image${2 - localImages.length === 1 ? '' : 's'}`
                                : 'Save Changes'
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Image?</DialogTitle>
                        <DialogDescription>
                            This will remove the image from your listing. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            variant="destructive"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
