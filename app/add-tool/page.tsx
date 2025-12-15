"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { ArrowLeft, Shield, AlertTriangle, BookOpen, Upload, CheckCircle, Loader2, Hammer } from "lucide-react";
import { cn, generateSlug } from "@/lib/utils";
import { useMarketplace } from "@/app/hooks/use-marketplace";
import { supabase } from "@/lib/supabase";
import { Switch } from "@/app/components/ui/switch";
import { ImageUpload } from "@/app/components/ui/image-upload";
import { TypeaheadInput } from "@/app/components/ui/typeahead-input";
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
    const { categories, fetchCategories } = useMarketplace();

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
        images: ["", "", ""],
        specs: {
            weight: "",
            dimensions: ""
        }
    });

    const [isAffirmationOpen, setIsAffirmationOpen] = useState(false);
    const [isAffirmed, setIsAffirmed] = useState(false);
    const [isTosAccepted, setIsTosAccepted] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const selectedCategory = categories.find(c => c.id === formData.categoryId);

    // Sort categories alphabetically
    const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

    // Auto-calculate Risk/Deposit based on Category risk_tier
    const riskTier = (selectedCategory as any)?.risk_tier || 1;
    const deductibleAmount = (selectedCategory as any)?.deductible_amount || 0;
    const deposit = riskTier === 3 ? deductibleAmount : 0; // Only Tier 3 requires deposit
    const isHighRisk = riskTier === 3;
    const requiresManual = riskTier === 3;

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

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
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

            // if (!user) throw new Error("You must be logged in to list a tool.");

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
                    owner_id: user?.id
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
                                                onValueChange={(val) => handleInputChange("categoryId", val)}
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
                                        </div>
                                    </div>
                                </div>

                                {/* Auto-Calculated Risk Info */}
                                {selectedCategory && (
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-900">Risk Level</span>
                                            <span className={cn(
                                                "px-2 py-1 rounded text-xs font-bold",
                                                riskTier === 3 ? "bg-red-100 text-red-800" : riskTier === 2 ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                                            )}>
                                                {riskTier === 3 ? "Tier 3 (High)" : riskTier === 2 ? "Tier 2 (Mid)" : "Tier 1 (Low)"}
                                            </span>
                                        </div>
                                        {riskTier === 3 ? (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">Required Deductible</span>
                                                    <span className="font-bold text-slate-900">${deposit.toFixed(2)}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2">
                                                    Tier 3 tools require a refundable deductible + Peace Fund fee (paid by renter).
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-xs text-slate-500 mt-2">
                                                Tier {riskTier} tools only require the Peace Fund fee (paid by renter). No deposit needed.
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

                                {/* Images */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-slate-900">Images</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {formData.images.map((img, idx) => (
                                            <ImageUpload
                                                key={idx}
                                                bucket="tool_images"
                                                initialValue={img}
                                                onUpload={(url) => handleImageChange(idx, url)}
                                                label={`Photo ${idx + 1}`}
                                                folder="tools"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500">Upload clear photos of your item.</p>
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
                                        disabled={loading}
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
            <Footer />
        </main >
    );
}
