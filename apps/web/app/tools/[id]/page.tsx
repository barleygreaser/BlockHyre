"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
    ArrowLeft,
    MapPin,
    Shield,
    AlertTriangle,
    BookOpen,
    Zap,
    Weight,
    Ruler,
    Info,
    CheckCircle,
    Star,
    Loader2
} from "lucide-react";
import { addDays, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/app/context/cart-context";
import { useRouter, useParams } from "next/navigation";
import { calculateRentalPrice } from "@/lib/pricing";
import { useMarketplace, Listing } from "@/app/hooks/use-marketplace";

export default function ToolDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { fetchListing, fetchUnavailableDates } = useMarketplace();

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 2),
    });
    const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);

    useEffect(() => {
        if (id) {
            fetchListing(id as string).then(data => {
                setListing(data);
                setLoading(false);
            });
            fetchUnavailableDates(id as string).then(setUnavailableDates);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-electric-indigo" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <h1 className="text-2xl font-bold font-serif text-midnight-navy mb-4">Listing Not Found</h1>
                <Button onClick={() => router.push('/')} className="rounded-interactive active:translate-y-0.5">Return Home</Button>
            </div>
        );
    }

    // Calculate Costs
    const days = dateRange?.from && dateRange?.to
        ? differenceInDays(dateRange.to, dateRange.from) + 1
        : 0;

    // Use Listing Data
    const riskTier = listing.category?.risk_daily_fee > 5 ? 3 : listing.category?.risk_daily_fee > 2 ? 2 : 1;
    // Fallback deposit if missing
    const deposit = (listing as any).deposit_amount || 250;

    const { subtotal, peaceFundTotal, finalTotal } = calculateRentalPrice(listing.daily_price, days, riskTier);
    const totalDue = finalTotal + deposit;

    const handleAddToCart = () => {
        if (!dateRange?.from || !dateRange?.to) return;

        addToCart({
            id: listing.id,
            title: listing.title,
            image: listing.images?.[0] || "/placeholder.png",
            owner_id: listing.owner_id || listing.owner?.id || "",
            price: {
                daily: listing.daily_price,
                deposit: deposit,
                riskTier: riskTier as 1 | 2 | 3
            },
            dates: {
                from: dateRange.from,
                to: dateRange.to
            },
            days
        });

        toast.success("Item added to cart!");
    };

    const handleRentNow = () => {
        if (!dateRange?.from || !dateRange?.to) return;
        handleAddToCart(); // Add to cart first purely for state flow if needed, or straight to checkout
        // Typically checkout needs cart state
        router.push("/checkout");
    };

    const handleRequestToRent = () => {
        if (!dateRange?.from || !dateRange?.to) return;
        const searchParams = new URLSearchParams({
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString()
        });
        router.push(`/request-booking/${listing.id}?${searchParams.toString()}`);
    };

    const images = listing.images && listing.images.length > 0 ? listing.images : ["https://placehold.co/800x600?text=No+Image"];
    const specs = listing.specifications || {};

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">

                {/* Breadcrumbs / Back */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        className="pl-0 text-slate-500 hover:text-midnight-navy font-mono text-xs uppercase tracking-industrial font-semibold hover:bg-transparent"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Results
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Images & Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Hero Section */}
                        <div className="space-y-4">
                            <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden relative">
                                <Image
                                    src={images[selectedImage]}
                                    alt={listing.title}
                                    fill
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 66vw"
                                    className="object-cover"
                                />
                                {listing.is_high_powered && (
                                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-md font-bold flex items-center gap-2 shadow-md">
                                        <AlertTriangle className="h-4 w-4" />
                                        Heavy Machinery
                                    </div>
                                )}
                            </div>

                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={cn(
                                                "aspect-video bg-slate-100 rounded-interactive overflow-hidden border-2 relative transition-all",
                                                selectedImage === idx ? "border-electric-indigo ring-2 ring-electric-indigo/20 shadow-xs" : "border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <Image
                                                src={img}
                                                alt={`View ${idx + 1}`}
                                                fill
                                                sizes="(max-width: 768px) 25vw, 15vw"
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Title & Owner */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="text-3xl md:text-4xl font-bold font-serif text-midnight-navy">
                                        {listing.title}
                                    </h1>
                                    {listing.accepts_barter && (
                                        <div className="group relative">
                                            <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/20 rounded-full font-mono text-2xs uppercase tracking-industrial font-semibold cursor-help">
                                                🍓 Accepts Barter
                                            </Badge>
                                            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-midnight-navy text-white text-xs rounded-interactive shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-sans">
                                                This owner is interested in trading rental time for goods created with the tool. Message them to inquire!
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-electric-indigo" />
                                        <span>{listing.distance ? `${listing.distance.toFixed(1)} miles away` : "Nearby"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span>5.0 (New listing)</span>
                                    </div>
                                </div>
                            </div>

                            {listing.owner && (
                                <div className="flex items-center gap-3 bg-white p-3 rounded-interactive border border-slate-200/80 shadow-xs">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={listing.owner.profile_photo_url || "https://placehold.co/100"} alt={listing.owner.full_name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-midnight-navy flex items-center gap-1">
                                            {listing.owner.full_name}
                                            <CheckCircle className="h-3.5 w-3.5 text-electric-indigo" />
                                        </p>
                                        <p className="text-2xs font-mono uppercase tracking-industrial text-slate-500">Verified Neighbor</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-xl font-bold font-serif text-midnight-navy mb-3">About this Tool</h3>
                            <div className="prose prose-slate max-w-none text-slate-600">
                                {listing.description}
                            </div>
                            {listing.manual_url && !listing.is_high_powered && (
                                <div className="mt-4">
                                    <a
                                        href={listing.manual_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-industrial font-semibold text-electric-indigo hover:text-midnight-navy bg-electric-indigo/5 hover:bg-electric-indigo/10 px-3.5 py-2 rounded-interactive border border-electric-indigo/15 transition-colors"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        View Manufacturer Manual / Guide
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Safety Warning */}
                        {listing.is_high_powered && (
                            <div className="bg-safety-orange/5 border border-safety-orange/30 rounded-card p-5 flex items-start gap-4">
                                <Shield className="h-6 w-6 text-safety-orange shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-midnight-navy font-serif text-base">Requires Safety Gate Clearance</h3>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                        This is a high-power tool. You must review the manufacturer manual and pass a quick competence check during checkout.
                                    </p>
                                    {listing.manual_url ? (
                                        <a href={listing.manual_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-industrial font-bold text-safety-orange mt-2.5 hover:underline">
                                            <BookOpen className="h-4 w-4" />
                                            View Manufacturer Manual
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-industrial text-slate-400 mt-2.5 italic cursor-not-allowed">
                                            <BookOpen className="h-4 w-4" />
                                            Manual not provided
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tabs: Specs & Condition */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold font-serif text-midnight-navy">Technical Specifications</h3>
                            {Object.entries(specs).length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.entries(specs).map(([key, val], i) => (
                                        <div key={i} className="bg-white p-4 rounded-interactive border border-slate-200/80 shadow-xs hover:border-electric-indigo/30 transition-colors">
                                            <Info className="h-4 w-4 text-electric-indigo mb-2" />
                                            <p className="text-2xs font-mono uppercase tracking-industrial text-slate-500 mb-1">{key}</p>
                                            <p className="font-mono font-bold text-midnight-navy text-sm truncate">{String(val)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">No specific details provided.</p>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Booking Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 border-slate-200/80 shadow-lg rounded-card overflow-hidden">
                            <div className="bg-midnight-navy p-5 text-white text-center">
                                <p className="text-2xs font-mono uppercase tracking-industrial text-signal-white/70 mb-1">Daily Rate</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    {listing.daily_price === 0 ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-2xl md:text-3xl font-mono font-bold text-emerald-400">Free to Borrow</span>
                                            <span className="text-2xs font-mono text-signal-white/60 mt-1">
                                                ${listing.category.risk_daily_fee}.00/day Peace Fund contribution required
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-bold text-safety-orange">${listing.daily_price}</span>
                                            <span className="text-sm">/day</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-6">

                                {/* Date Picker */}
                                <div className="space-y-6">
                                    <label className="text-xs font-mono uppercase tracking-industrial font-bold text-midnight-navy block">Select Dates</label>
                                    <div className="flex justify-center border border-slate-200/80 rounded-interactive p-2 bg-slate-50/50 shadow-2xs">
                                        <Calendar
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={1}
                                            disabled={[
                                                { before: new Date() },
                                                ...unavailableDates
                                            ]}
                                        />
                                    </div>
                                    {unavailableDates.length > 0 && <p className="text-2xs font-mono text-slate-500 text-center">Gray dates are unavailable.</p>}
                                </div>

                                {/* Cost Breakdown */}
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Rental Fee ({days} days)</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            Peace Fund (Tier {riskTier})
                                            <Info className="h-3 w-3 text-slate-400 cursor-help" />
                                        </span>
                                        <span className="font-mono font-semibold text-slate-900">${peaceFundTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-safety-orange">
                                        <span>Refundable Deposit</span>
                                        <span>${deposit.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-end pt-3 border-t border-slate-200">
                                        <span className="font-bold text-slate-900">Total Due Now</span>
                                        <span className="text-2xl font-bold text-slate-900">${totalDue.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {listing.booking_type === 'instant' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={handleRentNow}
                                                className="w-full h-12 text-base font-bold bg-safety-orange hover:bg-safety-orange/90 text-white"
                                            >
                                                Rent Now
                                            </Button>
                                            <Button
                                                onClick={handleAddToCart}
                                                variant="outline"
                                                className="w-full h-12 text-base font-bold border-slate-300 text-slate-900 hover:bg-slate-50"
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleRequestToRent}
                                            className="w-full h-12 text-lg font-bold bg-safety-orange hover:bg-safety-orange/90 text-white"
                                        >
                                            Request to Rent
                                        </Button>
                                    )}
                                </div>

                                <p className="text-2xs font-mono text-center text-slate-400">
                                    You won&apos;t be charged until the owner approves.
                                </p>

                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
            <Footer />
        </main>
    );
}
