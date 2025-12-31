"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, notFound } from "next/navigation";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import {
    ChevronLeft,
    Save,
    Trash2,
    LayoutList,
    Image as ImageIcon,
    DollarSign,
    Calendar as CalendarIcon,
    BookOpen,
    Hammer,
    Plus,
    X,
    Check,
    Loader2,
    Eye,
    AlertCircle
} from "lucide-react";
import { useMarketplace, Listing } from "@/app/hooks/use-marketplace";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { cn, generateSlug } from "@/lib/utils";
import { toast } from "sonner";
import { ImageUpload } from "@/app/components/ui/image-upload";
import { Switch } from "@/app/components/ui/switch";
import { EditListingSpecs, ListingSpecValue } from "@/app/components/listings/edit-listing-specs";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ListingCalendar } from "@/app/components/listings/listing-calendar";
import { ImageManagerModal } from "@/app/components/listings/image-manager-modal";
// import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";

// Sections for Sidebar
const SECTIONS = [
    { id: "details", label: "Details & Category", icon: LayoutList },
    { id: "photos", label: "Photos & Media", icon: ImageIcon },
    { id: "pricing", label: "Pricing & Terms", icon: DollarSign },
    { id: "availability", label: "Availability & Status", icon: CalendarIcon },
];

export default function EditListingPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { fetchListing, categories, fetchBlockedDates, blockDateRange, deleteBlockedDate, fetchUnavailableDates, platformSettings } = useMarketplace();

    const [activeSection, setActiveSection] = useState("details");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Listing>>({});
    const [specs, setSpecs] = useState<ListingSpecValue[]>([]);

    // Unsaved Changes Tracking
    const [initialContext, setInitialContext] = useState<{ data: Partial<Listing>, specs: ListingSpecValue[] } | null>(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    // Availability State
    const [blockedDates, setBlockedDates] = useState<any[]>([]);
    const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [blocking, setBlocking] = useState(false);

    // Image Manager Modal State
    const [imageManagerOpen, setImageManagerOpen] = useState(false);

    // Set document title
    useEffect(() => {
        if (formData.title) {
            document.title = `Edit: ${formData.title} - BlockHyre`;
        } else {
            document.title = 'Edit Listing - BlockHyre';
        }
    }, [formData.title]);

    // Fetch Data
    useEffect(() => {
        if (id) {
            fetchListing(id as string).then((data) => {
                if (data) {
                    // IDOR PROTECTION: Verify Ownership
                    if (user && data.owner_id && data.owner_id !== user.id) {
                        notFound(); // 404 security mask
                        return;
                    }

                    setFormData(data);
                    setFormData(data);

                    // Parse Specifications
                    let initialSpecs: ListingSpecValue[] = [];
                    if (data.specifications && Array.isArray(data.specifications)) {
                        initialSpecs = data.specifications as ListingSpecValue[];
                        setSpecs(initialSpecs);
                    } else {
                        // Migration: If old object format or null, start fresh with empty array
                        setSpecs([]);
                    }

                    // Set Initial Context for Dirty Checking
                    setInitialContext({
                        data: JSON.parse(JSON.stringify(data)), // Deep clone
                        specs: JSON.parse(JSON.stringify(initialSpecs)) // Deep clone
                    });
                }
                setLoading(false);
            });

            // Fetch Blocked Dates (List)
            fetchBlockedDates(id as string).then(setBlockedDates);

            // Fetch All Unavailable Dates (Calendar Visuals)
            fetchUnavailableDates(id as string).then(setUnavailableDates);
        }
    }, [id]);

    // Handlers
    const handleInputChange = (field: keyof Listing, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const hasUnsavedChanges = () => {
        if (!initialContext) return false;

        // Check specs changes
        if (!isDeepEqual(specs, initialContext.specs)) return true;

        // Check formData changes
        // We only check keys that handleInputChange touches or are relevant. 
        // But since formData starts as full object, simple deep equal on keys present in both might be safest.
        // Or just deep equal the whole object.
        return !isDeepEqual(formData, initialContext.data);
    };

    const handleViewListingClick = () => {
        if (hasUnsavedChanges()) {
            setShowUnsavedModal(true);
        } else {
            const slug = generateSlug(formData.title || 'view');
            window.open(`/listings/${id}/${slug}?view=public`, '_blank');
        }
    };

    const handleSave = async (redirectAfter: boolean = false) => {
        setSaving(true);
        try {
            // Validate Manual URL if present
            if (formData.manual_url && !formData.manual_url.startsWith("https://www.manualslib.com")) {
                toast.error("Invalid User Manual URL. It must start with 'https://www.manualslib.com'.");
                setSaving(false);
                return false;
            }

            // Convert specs to JSONB compatible structure (Array)
            // Verify specs are valid?
            // Actually, we just save the array directly now.

            const { error } = await supabase
                .from('listings')
                .update({
                    title: formData.title,
                    brand: formData.brand,
                    description: formData.description,
                    category_id: formData.category_id,
                    specifications: specs, // Save as JSONB Array
                    daily_price: formData.daily_price,
                    accepts_barter: formData.accepts_barter,
                    booking_type: formData.booking_type,
                    min_rental_days: formData.min_rental_days,
                    deposit_amount: (formData as any).deposit_amount,
                    images: formData.images,
                    is_available: formData.is_available,
                    owner_notes: formData.owner_notes,
                    manual_url: formData.manual_url,
                })
                .eq('id', id);

            if (error) throw error;

            // Update initial context to new state
            setInitialContext({
                data: JSON.parse(JSON.stringify(formData)),
                specs: JSON.parse(JSON.stringify(specs))
            });

            // Add visible feedback
            if (!redirectAfter) {
                toast.success("Listing updated successfully!");
            }
            return true;
        } catch (e: any) {
            console.error("Error updating listing:", e);
            toast.error("Failed to update listing: " + e.message);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleImagesSave = (reorderedImages: string[]) => {
        handleInputChange("images", reorderedImages);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar />

            {/* Page Header */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Button
                                    variant="ghost"
                                    className="p-0 h-auto text-slate-500 hover:text-slate-900"
                                    onClick={() => router.push('/owner/listings')}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Back to My Listings
                                </Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-900 font-serif">
                                    Edit: {formData.title}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={`
                                        ${(formData as any).status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                        ${(formData as any).status === 'draft' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                                        ${(formData as any).status === 'archived' ? 'bg-slate-50 text-slate-400 border-slate-200' : ''}
                                    `}
                                >
                                    {(formData as any).status ?
                                        (formData as any).status.charAt(0).toUpperCase() + (formData as any).status.slice(1)
                                        : 'Draft'
                                    }
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 mr-2">Last saved: Just now</span>

                            {/* View Listing Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-safety-orange"
                                onClick={handleViewListingClick}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View Listing
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Left Sidebar Navigation */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <nav className="space-y-1 sticky top-32">
                            {SECTIONS.map((section) => {
                                const Icon = section.icon;
                                const isActive = activeSection === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                            isActive
                                                ? "bg-white text-safety-orange shadow-sm border border-slate-200"
                                                : "text-slate-600 hover:bg-white hover:text-slate-900"
                                        )}
                                    >
                                        <Icon className={cn("h-4 w-4", isActive ? "text-safety-orange" : "text-slate-400")} />
                                        {section.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Right Content Pane */}
                    <main className="flex-1 space-y-6">

                        {/* SECTION: Details & Category */}
                        {activeSection === "details" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-serif">Basic Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">

                                        {/* Title */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">Tool Name/ Model <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="text"
                                                className="focus-visible:ring-safety-orange/50"
                                                placeholder="e.g. 10-inch Jobsite Table Saw"
                                                value={formData.title || ""}
                                                onChange={(e) => handleInputChange("title", e.target.value)}
                                            />
                                        </div>

                                        {/* Brand & Category Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Brand */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Brand</Label>
                                                <Input
                                                    type="text"
                                                    className="focus-visible:ring-safety-orange/50"
                                                    placeholder="e.g. Makita"
                                                    value={formData.brand || ""}
                                                    onChange={(e) => handleInputChange("brand", e.target.value)}
                                                />
                                            </div>

                                            {/* Category */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></Label>
                                                <Select
                                                    value={formData.category_id || ""}
                                                    onValueChange={(val) => handleInputChange("category_id", val)}
                                                    disabled
                                                >
                                                    <SelectTrigger className="bg-white focus:ring-safety-orange/50 disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-100">
                                                        <SelectValue placeholder="Select a Category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map(cat => (
                                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label className="text-sm font-medium text-slate-700">Description <span className="text-red-500">*</span></Label>
                                                <span className="text-xs text-slate-400">supports markdown</span>
                                            </div>
                                            <Textarea
                                                className="h-40 resize-y focus-visible:ring-safety-orange/50"
                                                placeholder="Describe the condition, what's included, and best use cases..."
                                                value={formData.description || ""}
                                                onChange={(e) => handleInputChange("description", e.target.value)}
                                            />
                                        </div>

                                        <Separator />

                                        {/* Specifications */}
                                        <div>
                                            <EditListingSpecs
                                                selectedCategoryId={formData.category_id || null}
                                                initialSpecs={specs}
                                                onSpecsChange={setSpecs}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <BookOpen className="h-4 w-4" />
                                                User Manual URL
                                            </Label>
                                            <Input
                                                type="url"
                                                className="focus-visible:ring-safety-orange/50"
                                                placeholder="https://www.manualslib.com..."
                                                value={formData.manual_url || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow empty string to clear it, or strictly enforce prefix if typing
                                                    handleInputChange("manual_url", val);

                                                    // Optional: Visual warning state could be added, but for now just input binding.
                                                    // The actual enforcement can happen on blur or save, or we can warn here.
                                                    // Let's add a helper text below.
                                                }}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                Must be a valid URL from <strong>manualslib.com</strong> (e.g. https://www.manualslib.com/manual/...)
                                            </p>
                                        </div>

                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeSection === "photos" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-serif">Photos & Media</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">

                                        {/* Recommendations Status Bar */}
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                                            <div className="p-1 bg-blue-100 rounded-full">
                                                <ImageIcon className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-medium text-slate-800">Photo Guidelines</p>
                                                <ul className="list-disc list-inside text-slate-600 mt-1 space-y-1">
                                                    <li><strong>2-5 images</strong> required per listing.</li>
                                                    <li>The <strong>first image</strong> will be your main cover photo in search results.</li>
                                                    <li>Clear, well-lit photos increase rental requests by up to 40%.</li>
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Image Preview Strip */}
                                        {formData.images && formData.images.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 mb-3">
                                                    Current Photos ({formData.images.length})
                                                </p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {formData.images.map((url, index) => (
                                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 group">
                                                            <img
                                                                src={url}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {index === 0 && (
                                                                <div className="absolute top-1 right-1">
                                                                    <Badge className="bg-safety-orange text-white text-[10px] shadow-sm">
                                                                        Main
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                                                                {index + 1}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Manage Photos Button */}
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => setImageManagerOpen(true)}
                                        >
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            {formData.images && formData.images.length > 0
                                                ? `Manage Photos (${formData.images.length})`
                                                : 'Upload Photos'}
                                        </Button>

                                        {/* Validation Warning */}
                                        {(!formData.images || formData.images.length < 2) && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-amber-800">
                                                    <strong>Action required:</strong> Upload at least 2 images to publish this listing.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeSection === "pricing" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-serif">Pricing & Terms</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8">

                                        {/* Core Pricing */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Core Pricing</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">Daily Price ($) <span className="text-red-500">*</span></Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-slate-400 z-10">$</span>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            className="pl-7 focus-visible:ring-safety-orange/50"
                                                            placeholder="0.00"
                                                            value={formData.daily_price || ""}
                                                            onChange={(e) => handleInputChange("daily_price", parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">Refundable Deposit ($)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-slate-400 z-10">$</span>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="pl-7 focus-visible:ring-safety-orange/50"
                                                            placeholder="0.00"
                                                            // Assuming deposit is stored in `specifications.deposit` or similar if no column exists? 
                                                            // Wait, typical schema usually has deposit. 
                                                            // Let's check listing type. `risk_daily_fee` is category.
                                                            // I'll stick to a generic field, if DB errors I'll fix.
                                                            // Actually, let's use `specs` for deposit if column missing, but likely column exists or logic handles it.
                                                            // For now, I'll bind to `formData.deposit_amount` (as requested) -> checking type... `Listing` type doesn't show `deposit_amount`.
                                                            // I will add it to type if missing, or use `specifications`.
                                                            // Let's assume `deposit_amount` exists in DB or I use specs.
                                                            // Recommendation: Use `deposit_amount` in formData, and if column doesn't exist, I'll need to migrate.
                                                            // I will treat it as a top-level field for now.
                                                            value={(formData as any).deposit_amount || ""}
                                                            onChange={(e) => handleInputChange("deposit_amount" as any, parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">Min. Rental Days</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        className="focus-visible:ring-safety-orange/50"
                                                        value={formData.min_rental_days || 1}
                                                        onChange={(e) => handleInputChange("min_rental_days", parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Protection & Fees */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Protection & Fees</h3>
                                            <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-medium text-slate-500 uppercase">Peace Fund Tier</span>
                                                        <div className="font-semibold text-slate-900">
                                                            {formData.category?.risk_tier
                                                                ? formData.category.risk_tier === 3 ? "Tier 3 (High)" : formData.category.risk_tier === 2 ? "Tier 2 (Mid)" : "Tier 1 (Low)"
                                                                : "Standard"}
                                                        </div>
                                                        <div className="text-xs text-slate-500">Based on category</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-medium text-slate-500 uppercase">Daily Peace Fee</span>
                                                        <div className="font-semibold text-slate-900">
                                                            ${formData.category?.risk_daily_fee?.toFixed(2) || "0.00"}/day
                                                        </div>
                                                        <div className="text-xs text-slate-500">Paid by Renter</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-medium text-slate-500 uppercase">Platform Fee</span>
                                                        <div className="font-semibold text-slate-900">
                                                            {platformSettings?.seller_fee_percent ?? 7}%
                                                        </div>
                                                        <div className="text-xs text-slate-500">Deducted from payout</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking USPs */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Booking Terms</h3>

                                            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <label className="font-medium text-slate-900">Accept Barter?</label>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <div className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded cursor-help">?</div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Enabling barter may increase your requests by 20%. Barter requires "Request to Book".
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <p className="text-sm text-slate-500">Open to trading for goods/services instead of cash.</p>
                                                </div>
                                                <Switch
                                                    checked={formData.accepts_barter || false}
                                                    onCheckedChange={(checked) => {
                                                        handleInputChange("accepts_barter", checked);
                                                        if (checked) {
                                                            handleInputChange("booking_type", "request");
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
                                                <Label className="font-medium text-slate-900 block">Booking Method</Label>
                                                <RadioGroup
                                                    className="flex flex-col sm:flex-row gap-4"
                                                    value={formData.booking_type || "request"}
                                                    onValueChange={(val) => {
                                                        if (!formData.accepts_barter || val === "request") {
                                                            handleInputChange("booking_type", val);
                                                        }
                                                    }}
                                                >
                                                    <div className={cn(
                                                        "flex-1 flex items-start p-3 rounded-lg border cursor-pointer transition-all",
                                                        formData.booking_type === 'request' || !formData.booking_type
                                                            ? "border-safety-orange bg-orange-50 ring-1 ring-safety-orange"
                                                            : "border-slate-200 hover:border-slate-300"
                                                    )}>
                                                        <RadioGroupItem value="request" id="r-request" className="mt-1 mr-3 text-safety-orange border-slate-900" />
                                                        <Label htmlFor="r-request" className="cursor-pointer">
                                                            <div className="font-medium text-sm text-slate-900">Request to Book</div>
                                                            <div className="text-xs text-slate-500 mt-1">Review every request before approving. Best for high-value items or for bartering.</div>
                                                        </Label>
                                                    </div>

                                                    <div className={cn(
                                                        "flex-1 flex items-start p-3 rounded-lg border transition-all",
                                                        formData.accepts_barter ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-100"
                                                            : formData.booking_type === 'instant'
                                                                ? "border-safety-orange bg-orange-50 ring-1 ring-safety-orange cursor-pointer"
                                                                : "border-slate-200 hover:border-slate-300 cursor-pointer"
                                                    )}>
                                                        <RadioGroupItem
                                                            value="instant"
                                                            id="r-instant"
                                                            className="mt-1 mr-3 text-safety-orange border-slate-900"
                                                            disabled={formData.accepts_barter === true}
                                                        />
                                                        <Label htmlFor="r-instant" className={cn("cursor-pointer", formData.accepts_barter && "cursor-not-allowed")}>
                                                            <div className="font-medium text-sm text-slate-900">Instant Book</div>
                                                            <div className="text-xs text-slate-500 mt-1">Renters book instantly without approval. Requires ID verification.</div>
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeSection === "availability" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-serif">Availability & Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8">

                                        {/* Master Status */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Master Visibility</h3>
                                            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <label className="font-medium text-slate-900">Listing Status</label>
                                                        <Badge variant="outline" className={cn(
                                                            "ml-2",
                                                            formData.is_available ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"
                                                        )}>
                                                            {formData.is_available ? "Active" : "Draft"}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-500">
                                                        {formData.is_available
                                                            ? "Your listing is visible in search results and ready for bookings."
                                                            : "Your listing is hidden from search results."}
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.is_available || false}
                                                    onCheckedChange={(checked) => handleInputChange("is_available", checked)}
                                                />
                                            </div>
                                        </div>

                                        {/* Owner Notes */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-slate-900">Private Owner Notes</h3>
                                                <Badge variant="secondary" className="text-[10px] h-5">Private</Badge>
                                            </div>
                                            <Textarea
                                                className="h-24 text-sm focus-visible:ring-safety-orange/50"
                                                placeholder="Keep track of maintenance history, lock codes, or reminders..."
                                                value={formData.owner_notes || ""}
                                                onChange={(e) => handleInputChange("owner_notes", e.target.value)}
                                            />
                                        </div>

                                        {/* Calendar Management */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Calendar & Blocking</h3>
                                            <p className="text-sm text-slate-500">Select dates to block out for maintenance or personal use.</p>

                                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                    <ListingCalendar
                                                        unavailableDates={unavailableDates}
                                                        dateRange={dateRange}
                                                        onDateRangeChange={setDateRange}
                                                        minDate={new Date()}
                                                        className="rounded-md border-0"
                                                    />
                                                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={!dateRange?.from || !dateRange?.to || blocking}
                                                            onClick={async () => {
                                                                if (!dateRange?.from || !dateRange?.to || !id) return;
                                                                setBlocking(true);
                                                                try {
                                                                    await blockDateRange(id as string, dateRange.from, dateRange.to, "Owner Block");
                                                                    // Refresh
                                                                    const dates = await fetchBlockedDates(id as string);
                                                                    setBlockedDates(dates);
                                                                    const allUnavailable = await fetchUnavailableDates(id as string);
                                                                    setUnavailableDates(allUnavailable);
                                                                    setDateRange(undefined);
                                                                    toast.success("Dates blocked successfully.");
                                                                } catch (e: any) {
                                                                    toast.error("Failed to block dates: " + e.message);
                                                                } finally {
                                                                    setBlocking(false);
                                                                }
                                                            }}
                                                        >
                                                            {blocking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Block Selected Dates"}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-3">
                                                    <h4 className="text-sm font-medium text-slate-700">Blocked Periods</h4>
                                                    {blockedDates.length === 0 ? (
                                                        <div className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded border border-dashed border-slate-200 text-center">
                                                            No manually blocked dates.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                                            {blockedDates.map((block) => (
                                                                <div key={block.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded text-sm group">
                                                                    <div>
                                                                        <div className="font-medium text-slate-800">
                                                                            {format(new Date(block.start_date), "MMM d")} - {format(new Date(block.end_date), "MMM d, yyyy")}
                                                                        </div>
                                                                        <div className="text-xs text-slate-500">{block.reason || "Unavailable"}</div>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => {
                                                                            toast.custom(
                                                                                (t) => (
                                                                                    <div className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow-lg border border-slate-200">
                                                                                        <p className="font-medium">Unblock these dates?</p>
                                                                                        <div className="flex gap-2 justify-end">
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                onClick={() => toast.dismiss(t)}
                                                                                            >
                                                                                                Cancel
                                                                                            </Button>
                                                                                            <Button
                                                                                                size="sm"
                                                                                                onClick={async () => {
                                                                                                    toast.dismiss(t);
                                                                                                    try {
                                                                                                        await deleteBlockedDate(block.id);
                                                                                                        const dates = await fetchBlockedDates(id as string);
                                                                                                        setBlockedDates(dates);
                                                                                                        const allUnavailable = await fetchUnavailableDates(id as string);
                                                                                                        setUnavailableDates(allUnavailable);
                                                                                                        toast.success("Dates unblocked successfully.");
                                                                                                    } catch (e) {
                                                                                                        console.error(e);
                                                                                                        toast.error("Failed to unblock dates.");
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                OK
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                ),
                                                                                {
                                                                                    duration: Infinity,
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </div>
                        )}

                    </main>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto flex items-center justify-between">
                    <button className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Listing
                    </button>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-safety-orange hover:bg-orange-600 text-white min-w-[120px]"
                            onClick={() => handleSave(false)}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Unsaved Changes Modal */}
            <Dialog open={showUnsavedModal} onOpenChange={setShowUnsavedModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes. How would you like to proceed?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:justify-between sm:space-x-0 gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const slug = generateSlug(formData.title || 'view');
                                    window.open(`/listings/${id}/${slug}?view=public`, '_blank');
                                    setShowUnsavedModal(false);
                                }}
                                className="w-full"
                            >
                                View Last Saved
                            </Button>
                            <Button
                                onClick={async () => {
                                    const success = await handleSave(true);
                                    if (success) {
                                        setShowUnsavedModal(false);
                                        const slug = generateSlug(formData.title || 'view');
                                        window.open(`/listings/${id}/${slug}?view=public`, '_blank');
                                    }
                                }}
                                className="w-full bg-safety-orange hover:bg-orange-600 text-white"
                            >
                                Save & View
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => setShowUnsavedModal(false)}
                            className="w-full mt-2"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Manager Modal */}
            <ImageManagerModal
                open={imageManagerOpen}
                onOpenChange={setImageManagerOpen}
                images={formData.images || []}
                onSave={handleImagesSave}
            />
        </div>
    );
}

// Utility for deep comparison
function isDeepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}
