"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Badge } from "@/app/components/ui/badge";
import { ImageManagerModal } from "@/app/components/listings/image-manager-modal";
import { ArrowLeft, Shield, AlertTriangle, BookOpen, Upload, CheckCircle, Loader2, Hammer, Info, Sparkles, HelpCircle, Image as ImageIcon, MapPin } from "lucide-react";
import { cn, generateSlug } from "@/lib/utils";
import { useMarketplace } from "@/app/hooks/use-marketplace";
import { supabase } from "@/lib/supabase";
import { Switch } from "@/app/components/ui/switch";
import { TypeaheadInput } from "@/app/components/ui/typeahead-input";
import { useDebounce } from "@/app/hooks/use-debounce";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";

export default function AddToolPage() {
    const router = useRouter();
    const {
        categories,
        fetchCategories,
        platformSettings,
        // NEW: Hybrid System Exports
        overriddenTier,
        setOverriddenTier,
        selectedCategory,
        setSelectedCategory,
        financials,
        isAutoCategorized,
        setIsAutoCategorized,
        setAutoCategorizationTitle
    } = useMarketplace();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        brand: "",
        displayName: "",
        categoryId: "",
        dailyPrice: "",
        manualUrl: "",
        description: "",
        acceptsBarter: false,
        bookingType: "request" as "request" | "instant",
        images: [] as string[],
        locationAddress: "",
        preferredPickupTime: "",
        minRentalDays: 1,
        specs: {
            weight: "",
            dimensions: ""
        }
    });

    const [imageManagerOpen, setImageManagerOpen] = useState(false);

    // NEW: Track title for debounce
    const debouncedTitle = useDebounce(formData.title, 500);

    const [isAffirmationOpen, setIsAffirmationOpen] = useState(false);
    const [isAffirmed, setIsAffirmed] = useState(false);
    const [isTosAccepted, setIsTosAccepted] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    // NEW: Auto-suggest category when title changes (triggers hook's useEffect)
    useEffect(() => {
        setAutoCategorizationTitle(debouncedTitle);
    }, [debouncedTitle, setAutoCategorizationTitle]);

    // NEW: Sync selectedCategory from hook to formData
    useEffect(() => {
        if (selectedCategory && selectedCategory.id !== formData.categoryId) {
            setFormData(prev => ({ ...prev, categoryId: selectedCategory.id }));
        }
    }, [selectedCategory]);

    // Sort categories alphabetically
    const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

    // Auto-calculate Risk/Deposit based on Hybrid Tier (override > default)
    const currentTier = financials.currentTier;
    const deposit = financials.deductible;
    const riskTier = currentTier;
    const isHighRisk = currentTier === 3;
    const requiresManual = currentTier === 3;

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Validate manual URL for high-risk items
            if (field === 'manualUrl' && value && requiresManual) {
                if (!value.startsWith('https://www.manualslib.com')) {
                    // Silently prevent invalid URLs - user will see validation on submit
                    return prev;
                }
            }

            // Always auto-populate Display Name from Brand + Tool Name
            if (field === 'title' || field === 'brand') {
                const brand = field === 'brand' ? value : prev.brand;
                const title = field === 'title' ? value : prev.title;
                if (brand && title) {
                    newData.displayName = `${brand} ${title}`;
                } else if (title) {
                    newData.displayName = title;
                } else if (brand) {
                    newData.displayName = brand;
                }
            }
            return newData;
        });
    };

    const handleBrandSelect = (item: any) => {
        setFormData(prev => ({
            ...prev,
            brand: item.brand || "",
            displayName: `${item.brand} ${prev.title}`.trim()
        }));
    };

    const handleToolSelect = (item: any) => {
        setFormData(prev => ({
            ...prev,
            brand: item.brand || prev.brand,
            title: item.tool_name,
            displayName: `${item.brand || prev.brand} ${item.tool_name}`.trim()
        }));
    };

    const handleSpecChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            specs: { ...prev.specs, [field]: value }
        }));
    };

    const handleImagesSave = (reorderedImages: string[]) => {
        setFormData(prev => ({ ...prev, images: reorderedImages }));
    };

    // Helper to generate UUID
    const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleSubmit = async () => {
        // setLoading(true); // Handled by promise toast
        console.log("Submitting with categories available:", categories);

        const createListingPromise = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("You must be logged in to list a tool.");

            // Fetch user's neighborhood to get latitude/longitude
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select(`
                    neighborhood_id,
                    neighborhoods (
                        center_lat,
                        center_lon
                    )
                `)
                .eq('id', user.id)
                .single();

            if (userError) {
                console.error('Error fetching user neighborhood:', {
                    message: userError.message,
                    details: userError.details,
                    hint: userError.hint,
                    code: userError.code
                });
                throw new Error(`Could not fetch your location: ${userError.message || 'Unknown error'}`);
            }

            // Check image count (server-side safety)
            if (formData.images.length < 2) {
                throw new Error("You must upload at least 2 photos of your tool.");
            }

            // Check if user record exists
            if (!userData) {
                throw new Error("Your user profile could not be found. Please contact support.");
            }

            // Check if user has a neighborhood assigned
            if (!userData.neighborhood_id) {
                throw new Error("Your account doesn't have a neighborhood assigned. Please update your profile with your location.");
            }

            // Handle neighborhoods as either array or object
            const neighborhood = Array.isArray(userData.neighborhoods)
                ? userData.neighborhoods[0]
                : userData.neighborhoods;

            const latitude = neighborhood?.center_lat;
            const longitude = neighborhood?.center_lon;

            if (!latitude || !longitude) {
                console.error('Neighborhood data missing coordinates:', userData);
                throw new Error("Your neighborhood doesn't have valid coordinates. Please contact support or update your profile.");
            }

            const newId = generateUUID();

            const { error } = await supabase
                .from('listings')
                .insert({
                    id: newId,
                    title: formData.title,
                    brand: formData.brand,
                    display_name: formData.displayName,
                    description: formData.description,
                    daily_price: parseFloat(formData.dailyPrice),
                    category_id: formData.categoryId,
                    images: formData.images.filter(img => img.length > 0),
                    specifications: JSON.stringify(formData.specs),
                    manual_url: formData.manualUrl || null,
                    is_high_powered: isHighRisk,
                    accepts_barter: formData.acceptsBarter,
                    booking_type: formData.bookingType,
                    // NEW: Save the overridden tier (null if not overridden)
                    overridden_risk_tier: overriddenTier,
                    owner_id: user?.id,
                    // Automatically populate from user's neighborhood
                    latitude: latitude,
                    longitude: longitude,
                    // NEW: Save pickup details
                    location_address: formData.locationAddress,
                    preferred_pickup_time: formData.preferredPickupTime,
                    min_rental_days: formData.minRentalDays,
                    // Set listing as active and available by default
                    status: 'active',
                    is_available: true
                });

            if (error) throw error;
            return newId;
        };

        toast.promise(createListingPromise(), {
            loading: 'Creating your listing...',
            success: (newId) => {
                router.push(`/listings/${newId}/${generateSlug(formData.displayName)}`);
                return "Listing created successfully!";
            },
            error: (err) => `Failed to create listing: ${err.message || "Unknown error"}`,
        });

        // Close modal immediately, toast handles loading state UX
        setIsAffirmationOpen(false);
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-serif text-slate-900">List Your Tool</h1>
                    <p className="text-slate-600 mt-2">Turn your idle equipment into income. Safe, insured, and simple.</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 1 ? "bg-safety-orange" : "bg-slate-200")} />
                    <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 2 ? "bg-safety-orange" : "bg-slate-200")} />
                </div>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            {step === 1 ? (
                                <Hammer className="h-5 w-5 text-safety-orange" />
                            ) : (
                                <Shield className="h-5 w-5 text-safety-orange" />
                            )}
                            {step === 1 ? "Tool Details" : "Details & Images"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">

                        {step === 1 && (
                            <>
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <TypeaheadInput
                                            label="Brand"
                                            value={formData.brand}
                                            type="brand"
                                            onChange={(val) => handleInputChange("brand", val)}
                                            onSelect={handleBrandSelect}
                                            placeholder="e.g. DeWalt"
                                        />
                                        <TypeaheadInput
                                            label="Tool Name"
                                            value={formData.title}
                                            type="tool"
                                            brandFilter={formData.brand} // Filter tools by selected brand
                                            onChange={(val) => handleInputChange("title", val)}
                                            onSelect={handleToolSelect}
                                            placeholder="e.g. Table Saw"
                                        />
                                    </div>

                                    {/* Display Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900">Display Name</label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. DeWalt Table Saw"
                                            value={formData.displayName}
                                            readOnly
                                            className="bg-slate-100 cursor-not-allowed text-slate-600"
                                        />
                                        <p className="text-xs text-slate-500">Auto-generated from Brand + Tool Name</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-900">Category</label>

                                            <Select
                                                value={formData.categoryId}
                                                onValueChange={(val) => {
                                                    handleInputChange("categoryId", val);
                                                    const cat = categories.find(c => c.id === val);
                                                    if (cat) {
                                                        setSelectedCategory(cat);
                                                        setIsAutoCategorized(false); // Manual override
                                                        setOverriddenTier(null); // Reset tier override
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="bg-white focus:ring-safety-orange/50">
                                                    <SelectValue placeholder="Select a category..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sortedCategories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* Auto-Categorization Notification - Fixed height to prevent CLS */}
                                            <div className="min-h-[2.5rem]">
                                                {isAutoCategorized && selectedCategory && (
                                                    <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-md flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                                        <span>
                                                            Auto-selected <strong>{selectedCategory.name}</strong> based on your title
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-900">Daily Price ($)</label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.dailyPrice}
                                                onChange={(e) => handleInputChange("dailyPrice", e.target.value)}
                                                className="focus-visible:ring-safety-orange/50"
                                            />

                                            {/* Earnings Breakdown - Fixed height to prevent CLS */}
                                            <div className="min-h-[2.5rem]">
                                                {formData.dailyPrice && parseFloat(formData.dailyPrice) > 0 && platformSettings && (
                                                    <div className="bg-blue-50 border border-blue-200 p-2 rounded-md space-y-1 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                                                        <div className="flex items-center justify-between text-slate-700">
                                                            <span>Platform Fee ({platformSettings.seller_fee_percent}%):</span>
                                                            <span className="font-semibold text-slate-900">
                                                                -${((parseFloat(formData.dailyPrice) * platformSettings.seller_fee_percent) / 100).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-emerald-700 font-semibold pt-1 border-t border-blue-300">
                                                            <span>You'll Earn:</span>
                                                            <span className="text-emerald-900">
                                                                ${(parseFloat(formData.dailyPrice) - ((parseFloat(formData.dailyPrice) * platformSettings.seller_fee_percent) / 100)).toFixed(2)}/day
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Auto-Calculated Risk Info WITH TIER TOGGLE */}
                                {selectedCategory && (
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-900">Asset Protection Level</span>
                                            <span className={cn(
                                                "px-2 py-1 rounded text-xs font-bold",
                                                currentTier === 3 ? "bg-red-100 text-red-800" : currentTier === 2 ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                                            )}>
                                                Tier {currentTier} Active
                                            </span>
                                        </div>

                                        {/* Info Banner: Free Upgrade Benefit */}
                                        {selectedCategory && (selectedCategory.risk_tier || 1) < 3 && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                                                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <p className="font-semibold text-blue-900">High-value tool? Upgrade protection for free!</p>
                                                    <p className="text-blue-700 text-xs mt-1">
                                                        Higher tiers cost you <strong className="text-blue-900">$0</strong> — renters pay the Peace Fund fee difference.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* NEW: Tier Toggle Cards */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[1, 2, 3].map((tierLevel) => {
                                                const categoryDefaultTier = selectedCategory.risk_tier || 1;
                                                const isDisabled = tierLevel < categoryDefaultTier;
                                                const isActive = currentTier === tierLevel;

                                                return (
                                                    <div
                                                        key={tierLevel}
                                                        onClick={() => !isDisabled && setOverriddenTier(tierLevel)}
                                                        className={cn(
                                                            "p-3 border-2 rounded-xl transition-all",
                                                            isActive
                                                                ? "border-safety-orange bg-orange-50 cursor-pointer"
                                                                : isDisabled
                                                                    ? "border-slate-200 opacity-40 cursor-not-allowed"
                                                                    : "border-slate-200 opacity-60 cursor-pointer hover:opacity-100 hover:border-orange-200"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-lg font-bold text-slate-900">Tier {tierLevel}</span>
                                                            {isActive && <CheckCircle className="text-safety-orange w-4 h-4" />}
                                                        </div>

                                                        {/* Free Upgrade Badge */}
                                                        {!isDisabled && tierLevel > categoryDefaultTier && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                                                <span className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold">Free Upgrade</span>
                                                            </div>
                                                        )}

                                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">
                                                            {tierLevel === 3 ? "Pro Asset" : "Standard"}
                                                        </p>
                                                        <p className="text-xs mt-2 font-semibold text-slate-700">
                                                            ${tierLevel === 3 ? "3,000" : tierLevel === 2 ? "1,000" : "300"} Coverage
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Financial Breakdown */}
                                        <div className="border-t border-slate-200 pt-3 space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Renter Deductible:</span>
                                                <strong className="text-slate-900">${deposit}</strong>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-500">Peace Fund Fee</span>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs">
                                                                <p className="font-semibold mb-1">Paid by Renter</p>
                                                                <p className="text-xs">The Peace Fund fee is automatically added to the renter's total at checkout. This fee protects both you and the renter. <strong>You pay $0</strong> regardless of tier.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <span className="text-[10px] text-emerald-700 font-bold ml-1">(Paid by Renter)</span>
                                                </div>
                                                <strong className="text-slate-900">${financials.peaceFundFee.toFixed(2)}/day</strong>
                                            </div>
                                        </div>

                                        {currentTier === 3 && (
                                            <p className="text-xs text-slate-500">
                                                Tier 3 tools require a refundable deductible + Peace Fund fee (paid by renter).
                                            </p>
                                        )}
                                        {currentTier < 3 && (
                                            <p className="text-xs text-slate-500">
                                                Tier {currentTier} tools only require the Peace Fund fee (paid by renter). No deposit needed.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Manual Link (Conditional) */}
                                {requiresManual && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-slate-900">Manufacturer Manual URL</label>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                Required
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="url"
                                                placeholder="https://www.manualslib.com/..."
                                                value={formData.manualUrl}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (!val || val.startsWith('https://www.manualslib.com')) {
                                                        handleInputChange("manualUrl", val);
                                                    }
                                                }}
                                                className="pl-9 focus-visible:ring-safety-orange/50"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Must be a valid URL from{' '}
                                            <a
                                                href="https://www.manualslib.com/manual"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-safety-orange hover:underline font-medium"
                                            >
                                                manualslib.com
                                            </a>
                                        </p>
                                    </div>
                                )}

                                <div className="pt-6">
                                    <Button
                                        onClick={() => setStep(2)}
                                        disabled={!formData.title || !formData.categoryId || !formData.dailyPrice || (requiresManual && !formData.manualUrl)}
                                        className="w-full h-12 text-base bg-safety-orange hover:bg-safety-orange/90"
                                    >
                                        Next: Details & Images
                                    </Button>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Description</label>
                                    <Textarea
                                        placeholder="Describe the condition, included accessories, etc."
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        className="h-32 resize-none focus-visible:ring-safety-orange/50"
                                    />
                                </div>

                                {/* Toggles: Barter & Instant Book */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium text-slate-900">Accept Barter?</label>
                                            <p className="text-xs text-slate-500">Open to trading for services/goods. Forces "Request to Book".</p>
                                        </div>
                                        <Switch
                                            checked={formData.acceptsBarter}
                                            onCheckedChange={(checked) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    acceptsBarter: checked,
                                                    bookingType: checked ? 'request' : prev.bookingType
                                                }));
                                            }}
                                        />
                                    </div>
                                    <div className={cn("flex items-center justify-between transition-opacity", formData.acceptsBarter && "opacity-50 pointer-events-none")}>
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium text-slate-900">Instant Book</label>
                                            <p className="text-xs text-slate-500">Allow booking without approval.</p>
                                        </div>
                                        <Switch
                                            checked={formData.bookingType === 'instant'}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bookingType: checked ? 'instant' : 'request' }))}
                                            disabled={formData.acceptsBarter}
                                        />
                                    </div>
                                </div>

                                {/* Minimum Rental Period */}
                                <div className="space-y-2 pt-4 border-t border-slate-200">
                                    <label className="text-sm font-medium text-slate-900">Minimum Rental Period (Days)</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="1"
                                        value={formData.minRentalDays}
                                        onChange={(e) => handleInputChange("minRentalDays", parseInt(e.target.value) || 1)}
                                        className="focus-visible:ring-safety-orange/50"
                                    />
                                    <p className="text-xs text-slate-500">Minimum number of days a renter must book this tool for.</p>
                                </div>

                                {/* Pickup & Logistics */}
                                <div className="space-y-4 pt-4 border-t border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-safety-orange" />
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pickup & Logistics</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900">Exact Pickup Address</label>
                                        <Input
                                            placeholder="e.g. 123 Neighborhood Way, Apt 4"
                                            value={formData.locationAddress}
                                            onChange={(e) => handleInputChange("locationAddress", e.target.value)}
                                            className="focus-visible:ring-safety-orange/50"
                                        />
                                        <p className="text-xs text-slate-500">Only shared with the renter AFTER a booking is confirmed.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900">Preferred Pickup Window</label>
                                        <Input
                                            placeholder="e.g. Weekdays 5pm-8pm, Weekends after 10am"
                                            value={formData.preferredPickupTime}
                                            onChange={(e) => handleInputChange("preferredPickupTime", e.target.value)}
                                            className="focus-visible:ring-safety-orange/50"
                                        />
                                        <p className="text-xs text-slate-500">Helps renters plan their request. Flexible is always better!</p>
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="space-y-4 pt-4 border-t border-slate-200">
                                    <label className="text-sm font-medium text-slate-900">Photos</label>

                                    {/* Guidelines */}
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                                        <div className="p-1 bg-blue-100 rounded-full">
                                            <ImageIcon className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-800">Photo Guidelines</p>
                                            <ul className="list-disc list-inside text-slate-600 mt-1 space-y-1">
                                                <li><strong>2-5 images</strong> required per listing.</li>
                                                <li>The <strong>first image</strong> will be your main cover photo.</li>
                                                <li>Max <strong>3MB</strong> per image (JPG, PNG only).</li>
                                                <li>Clear photos increase rental requests by 40%.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Preview Strip */}
                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                                    )}

                                    {/* Manage Button */}
                                    <Button
                                        variant="outline"
                                        onClick={() => setImageManagerOpen(true)}
                                        className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 text-slate-600"
                                    >
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        {formData.images.length > 0
                                            ? `Manage Photos (${formData.images.length})`
                                            : "Upload Photos"}
                                    </Button>

                                    {/* Validation Warning */}
                                    {formData.images.length < 2 && (
                                        <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            At least 2 photos required to continue.
                                        </p>
                                    )}
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1 h-12"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() => setIsAffirmationOpen(true)}
                                        disabled={loading || formData.images.length < 2}
                                        className="flex-1 h-12 text-base bg-safety-orange hover:bg-safety-orange/90"
                                    >
                                        Review & Submit
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Affirmation Dialog */}
                <Dialog open={isAffirmationOpen} onOpenChange={setIsAffirmationOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-slate-900">
                                <Shield className="h-5 w-5 text-safety-orange" />
                                Final Safety Affirmation
                            </DialogTitle>
                            <DialogDescription>
                                To protect our community, please verify the following:
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <Checkbox
                                    id="affirmation"
                                    checked={isAffirmed}
                                    onCheckedChange={(checked) => setIsAffirmed(checked)}
                                    className="mt-1 data-[state=checked]:bg-safety-orange border-slate-300"
                                />
                                <label htmlFor="affirmation" className="text-sm text-slate-700 leading-relaxed cursor-pointer select-none">
                                    I certify that I am the owner of this tool, it is in good working condition, and I have accurately described its details. I understand that listing unsafe or prohibited items may result in account suspension.
                                </label>
                            </div>
                            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <Checkbox
                                    id="tos-affirmation"
                                    checked={isTosAccepted}
                                    onCheckedChange={(checked) => setIsTosAccepted(checked)}
                                    className="mt-1 data-[state=checked]:bg-safety-orange border-slate-300"
                                />
                                <label htmlFor="tos-affirmation" className="text-sm text-slate-700 leading-relaxed cursor-pointer select-none">
                                    I agree to the <Link href="/terms" className="text-safety-orange hover:underline" target="_blank">Terms of Service</Link> and pledge to adhere to the BlockHyre community guidelines.
                                </label>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setIsAffirmationOpen(false)}
                                className="w-full sm:w-auto"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!isAffirmed || !isTosAccepted || loading}
                                className="w-full sm:w-auto bg-safety-orange hover:bg-safety-orange/90"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    "Confirm & Publish"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <ImageManagerModal
                open={imageManagerOpen}
                onOpenChange={setImageManagerOpen}
                images={formData.images}
                onSave={handleImagesSave}
            />

            <Footer />
        </main >
    );
}
