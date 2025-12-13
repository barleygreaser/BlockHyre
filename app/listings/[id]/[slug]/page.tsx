"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { Calendar } from "@/app/components/ui/calendar"; // Keep if needed for types or just remove? 
import { ListingCalendar } from "@/app/components/listings/listing-calendar";
import {
    MapPin,
    Shield,
    AlertTriangle,
    BookOpen,
    Zap,
    Ruler,
    Weight,
    CheckCircle,
    Star,
    Info,
    Loader2,
    Pencil,
    BarChart2,
    Eye,
    MessageSquare
} from "lucide-react";
import { addDays, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useCart } from "@/app/context/cart-context";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { useAuth } from "@/app/context/auth-context";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { calculateRentalPrice } from "@/lib/pricing";
import { useMarketplace, Listing } from "@/app/hooks/use-marketplace";
import { upsertConversation } from "@/app/lib/chat-helpers";
import { toast } from "sonner";

export default function ListingDetailsPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { fetchListing, fetchUnavailableDates } = useMarketplace();
    const { addToCart } = useCart();
    const router = useRouter();

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 2),
    });

    useEffect(() => {
        if (id) {
            Promise.all([
                fetchListing(id as string),
                fetchUnavailableDates(id as string)
            ]).then(([data, dates]) => {
                setListing(data);
                setUnavailableDates(dates);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Listing Not Found</h1>
                <Button onClick={() => router.push('/listings')}>Back to Listings</Button>
            </div>
        );
    }

    // Calculate Costs
    const days = dateRange?.from && dateRange?.to
        ? differenceInDays(dateRange.to, dateRange.from) + 1
        : 0;

    // Map risk_daily_fee to Tier (1, 2, 3)
    const riskFee = listing.category.risk_daily_fee;
    const riskTier = riskFee === 1 ? 1 : riskFee === 3 ? 2 : 3;

    const { subtotal, peaceFundTotal, finalTotal } = calculateRentalPrice(listing.daily_price, days, riskTier as 1 | 2 | 3);
    const deposit = 100; // Hardcoded for now, or add to DB
    const totalDue = finalTotal + deposit;

    const handleAddToCart = () => {
        if (!dateRange?.from || !dateRange?.to) return;

        addToCart({
            id: listing.id,
            title: listing.title,
            image: listing.images?.[0] || "",
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

        alert("Item added to cart!");
    };

    const handleRentNow = () => {
        if (!dateRange?.from || !dateRange?.to) return;
        handleAddToCart(); // Add to cart first
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

    // Calculate transaction details for system message context
    const getSystemMessageContext = () => {
        if (!listing || !user) return undefined;

        const priceDisplay = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

        return {
            tool_name: listing.title,
            renter_name: user.user_metadata?.full_name || user.email || 'A neighbor',
            start_date: dateRange?.from?.toLocaleDateString() || 'TBD',
            end_date: dateRange?.to?.toLocaleDateString() || 'TBD',
            total_cost: totalDue.toFixed(2),
            // The link the owner clicks to view the request/chat. 
            // Since we don't have the chat ID yet, we can't deep link to the specific chat easily 
            // UNLESS we assume the link will be generated after chat creation? 
            // In chat-helpers, we generate the message AFTER creating the chat.
            // But we pass the context IN. 
            // Let's pass a placeholder or base URL, and let the helper or the template handle it?
            // Actually, currently `sendSystemMessage` uses the context as is.
            // Let's use a generic link to the messages page for now, or the dashboard.
            owner_notes_link: `${window.location.origin}/messages`
        };
    };

    const handleContactOwner = async () => {
        if (!user) {
            toast.error('Please log in to contact the owner');
            router.push('/auth');
            return;
        }

        try {
            const context = getSystemMessageContext();

            // If dates aren't selected, we might want to prompt user? 
            // Or just send a generic inquiry without dates?
            // The template requires dates: "from {{ start_date }} to {{ end_date }}".
            // If missing, it might look broken.
            // Let's assume for "Contact Owner" button, dates are optional?
            // BUT the logic implies "Inquiry" is about a specific trip.
            // If no dates selected, maybe we shouldn't send the "New Inquiry" template?
            // Just create the chat.

            const chatId = await upsertConversation(listing.id, context);
            if (chatId) {
                router.push(`/messages?id=${chatId}`);
            } else {
                toast.error('Failed to create conversation');
            }
        } catch (error: any) {
            console.error('Error creating chat:', error);
            // Show specific error message if available (e.g., "Cannot chat with yourself")
            toast.error(error?.message || 'Failed to contact owner');
        }
    };

    // Parse specs if string or object
    const specs = typeof listing.specifications === 'string'
        ? JSON.parse(listing.specifications)
        : listing.specifications || {};

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">

                {/* Breadcrumbs / Back */}
                <div className="mb-6">
                    <Button variant="link" className="pl-0 text-slate-500 hover:text-slate-900" onClick={() => router.push('/listings')}>
                        &larr; Back to Listings
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Images & Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Hero Section */}
                        <div className="space-y-4">
                            <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={listing.images?.[selectedImage] || `https://placehold.co/800x600?text=${encodeURIComponent(listing.title)}`}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                />
                                {listing.is_high_powered && (
                                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-md font-bold flex items-center gap-2 shadow-md">
                                        <AlertTriangle className="h-4 w-4" />
                                        Heavy Machinery
                                    </div>
                                )}
                            </div>

                            {listing.images && listing.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {listing.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={cn(
                                                "aspect-video bg-slate-100 rounded-lg overflow-hidden border-2 transition-all",
                                                selectedImage === idx ? "border-safety-orange ring-2 ring-safety-orange/20" : "border-transparent hover:border-slate-300"
                                            )}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Title & Owner */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900">
                                        {listing.title}
                                    </h1>
                                    {listing.accepts_barter && (
                                        <div className="group relative">
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 cursor-help">
                                                🍓 Accepts Barter
                                            </Badge>
                                            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                This owner is interested in trading rental time for goods created with the tool. Message them to inquire!
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-safety-orange" />
                                        <span>{listing.distance ? listing.distance.toFixed(1) : '0.5'} miles away</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span>5.0 (Verified Neighbor)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-500">
                                    N
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                        Neighbor
                                        <CheckCircle className="h-3 w-3 text-blue-500" />
                                    </p>
                                    <p className="text-xs text-slate-500">Verified</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-xl font-bold font-serif text-slate-900 mb-2">Description</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {listing.description || "No description provided."}
                            </p>
                            {listing.manual_url && !listing.is_high_powered && (
                                <div className="mt-4">
                                    <a
                                        href={listing.manual_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 transition-colors"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        View Manufacturer Manual / Guide
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Safety Warning */}
                        {listing.is_high_powered && (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-4">
                                <Shield className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-red-900">Requires Safety Gate Clearance</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        This is a high-power tool. You must review the manufacturer manual and pass a quick competence check during checkout.
                                    </p>
                                    {listing.manual_url ? (
                                        <a
                                            href={listing.manual_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm font-bold text-red-800 mt-2 hover:underline"
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            View Manufacturer Manual
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-red-800/60 mt-2 italic cursor-not-allowed">
                                            <BookOpen className="h-4 w-4" />
                                            Manual not provided by owner
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Specs */}
                        {Object.keys(specs).length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold font-serif text-slate-900">Technical Specifications</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(specs).map(([key, value]) => (
                                        <div key={key} className="bg-white p-4 rounded-lg border border-slate-200">
                                            <p className="text-xs text-slate-500 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                                            <p className="font-bold text-slate-900 truncate" title={String(value)}>{String(value)}</p>
                                        </div>
                                    ))}
                                    {listing.weight_kg && (
                                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                                            <Weight className="h-5 w-5 text-slate-400 mb-2" />
                                            <p className="text-xs text-slate-500 uppercase">Weight</p>
                                            <p className="font-bold text-slate-900">{listing.weight_kg} kg</p>
                                        </div>
                                    )}
                                    {listing.dimensions_cm && (
                                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                                            <Ruler className="h-5 w-5 text-slate-400 mb-2" />
                                            <p className="text-xs text-slate-500 uppercase">Dimensions</p>
                                            <p className="font-bold text-slate-900">{listing.dimensions_cm}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Booking Card or Owner Actions */}
                    <div className="lg:col-span-1">
                        {user && listing.owner_id === user.id && searchParams.get('view') !== 'public' ? (
                            // OWNER VIEW
                            <Card className="sticky top-24 border-safety-orange/50 shadow-lg overflow-hidden bg-orange-50/10">
                                <div className="bg-safety-orange p-4 text-white text-center">
                                    <h3 className="flex items-center justify-center gap-2 font-bold text-lg">
                                        <Pencil className="h-5 w-5" />
                                        Manage Listing
                                    </h3>
                                </div>
                                <CardContent className="p-6 space-y-6">
                                    <div className="text-center space-y-2">
                                        <p className="text-slate-600">You are viewing your own listing.</p>
                                        <p className="text-sm text-slate-500">
                                            Switch to consumer view to sanity check your pricing/photos.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Link href={`/owner/listings/edit/${listing.id}`} className="block">
                                            <Button className="w-full h-12 text-lg font-bold bg-safety-orange hover:bg-safety-orange/90 text-white shadow-sm">
                                                <Pencil className="mr-2 h-5 w-5" />
                                                Edit Details
                                            </Button>
                                        </Link>

                                        <Link href={`${location.pathname}?view=public`} className="block">
                                            <Button variant="outline" className="w-full h-12 text-base font-medium border-slate-300 hover:bg-white text-slate-700">
                                                <Eye className="mr-2 h-5 w-5 text-slate-500" />
                                                View Public Listing
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">Status</span>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mt-2">
                                            <span className="text-slate-600">Daily Price</span>
                                            <span className="font-bold text-slate-900">${listing.daily_price}/day</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            // RENTER VIEW
                            <Card className="sticky top-24 border-slate-200 shadow-lg overflow-hidden">
                                <div className="bg-slate-900 p-4 text-white text-center">
                                    <p className="text-sm opacity-80">Daily Rate</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        {listing.daily_price === 0 ? (
                                            <div className="flex flex-col items-center">
                                                <span className="text-3xl font-bold text-green-400">Free to Borrow</span>
                                                <span className="text-xs text-slate-400 mt-1">
                                                    ${riskFee}.00/day Peace Fund contribution required
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
                                        <label className="text-sm font-bold text-slate-900">Select Dates</label>
                                        <div className="flex justify-center">
                                            <ListingCalendar
                                                unavailableDates={unavailableDates}
                                                dateRange={dateRange}
                                                onDateRangeChange={setDateRange}
                                                minDate={new Date()}
                                            />
                                        </div>
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>Rental Fee ({days} days)</span>
                                            <span>${subtotal}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <span>Peace Fund (Tier {riskTier})</span>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button className="cursor-help">
                                                                <Info className="h-3 w-3 text-slate-400" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                            <div className="space-y-2">
                                                                <p className="font-bold text-sm">Community Safety Net</p>
                                                                <p className="text-xs">
                                                                    This mandatory fee pools into a fund that covers accidental damage during rentals, replacing bulky deposits.
                                                                </p>
                                                                <div className="bg-slate-100 dark:bg-slate-800 rounded p-2 text-xs">
                                                                    <div className="flex justify-between mb-1">
                                                                        <span className="text-slate-600 dark:text-slate-400">Daily Rate:</span>
                                                                        <span className="font-bold text-safety-orange">${riskTier === 3 ? '10' : riskTier === 2 ? '3' : '1'}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-600 dark:text-slate-400">Coverage Limit:</span>
                                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">${riskTier === 3 ? '3,000' : riskTier === 2 ? '500' : '100'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <span>${peaceFundTotal}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-safety-orange">
                                            <span>Refundable Deposit</span>
                                            <span>${deposit}</span>
                                        </div>

                                        <div className="flex justify-between items-end pt-3 border-t border-slate-200">
                                            <span className="font-bold text-slate-900">Total Due Now</span>
                                            <span className="text-2xl font-bold text-slate-900">${totalDue}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {listing.booking_type === 'request' ? (
                                            <Button
                                                onClick={handleRequestToRent}
                                                className="w-full h-12 text-lg font-bold bg-safety-orange hover:bg-safety-orange/90 text-white"
                                            >
                                                Request to Rent
                                            </Button>
                                        ) : (
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
                                        )}
                                    </div>

                                    {/* Contact Owner Button */}
                                    <Button
                                        onClick={handleContactOwner}
                                        variant="outline"
                                        className="w-full h-12 text-base font-medium border-slate-300 text-slate-700 hover:bg-slate-50"
                                    >
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        Contact Owner
                                    </Button>

                                    <p className="text-xs text-center text-slate-400">
                                        You won't be charged until the owner approves.
                                    </p>

                                </CardContent>
                            </Card>
                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </main>
    );
}
