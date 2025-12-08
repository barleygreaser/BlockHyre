"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Separator } from "@/app/components/ui/separator";
import { useMarketplace, Listing } from "@/app/hooks/use-marketplace";
import { MapPin, ShieldCheck, AlertTriangle, Zap, User, Star, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { generateSlug } from "@/lib/utils";

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { fetchListing, loading: marketplaceLoading } = useMarketplace();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);

    const listingId = params?.id as string;
    const listingSlug = params?.slug as string;

    useEffect(() => {
        if (listingId) {
            setLoading(true);
            fetchListing(listingId).then((data) => {
                setListing(data);
                setLoading(false);

                // Optional: Check slug and redirect if mismatched (SEO)
                if (data && generateSlug(data.title) !== listingSlug) {
                    router.replace(`/inventory/${data.id}/${generateSlug(data.title)}`);
                }
            });
        }
    }, [listingId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="w-32 h-6 mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="w-full aspect-video rounded-xl" />
                        <div className="space-y-4">
                            <Skeleton className="w-3/4 h-10" />
                            <Skeleton className="w-1/2 h-6" />
                            <Skeleton className="w-full h-32" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!listing) {
        return (
            <main className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Listing Not Found</h1>
                    <p className="text-slate-600 mb-6">The tool you are looking for may have been removed or does not exist.</p>
                    <Link href="/inventory">
                        <Button>Return to Inventory</Button>
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 md:py-12">
                <Link href="/inventory" className="inline-flex items-center text-sm text-slate-500 hover:text-safety-orange mb-6 transition-colors font-medium">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Inventory
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Left Column: Images & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Image */}
                        <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video relative shadow-sm group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={listing.images?.[0] || `https://placehold.co/800x600/e2e8f0/1e293b?text=${encodeURIComponent(listing.title)}`}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />

                            {/* Badges Overlay */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                {listing.booking_type === 'instant' && (
                                    <Badge className="bg-yellow-500 text-white border-none flex gap-1 px-3 py-1 shadow-md">
                                        <Zap className="h-3 w-3 fill-white" /> Instant Book
                                    </Badge>
                                )}
                                {listing.is_high_powered && (
                                    <Badge variant="destructive" className="flex gap-1 px-3 py-1 shadow-md">
                                        <AlertTriangle className="h-3 w-3" /> Heavy Machinery
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Title & Description (Mobile Only view setup could be here, but we use standard flow) */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-slate-500 border-slate-300">
                                        {listing.category?.name || 'Tool'}
                                    </Badge>
                                    <div className="flex items-center text-xs font-medium text-slate-500">
                                        <MapPin className="h-3 w-3 mr-1 text-safety-orange" />
                                        {listing.distance ? `${listing.distance.toFixed(1)} miles away` : 'Nearby'}
                                    </div>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mb-4">{listing.title}</h1>
                                <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                                    {listing.description || "No description provided."}
                                </p>
                            </div>

                            <Separator />

                            {/* Trust & Safety Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="bg-slate-50 border-slate-200 shadow-sm">
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <ShieldCheck className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">Peace Fund Protected</h3>
                                            <p className="text-xs text-slate-600 mt-1">
                                                Covered by our community insurance. Zero deductible for accidental damage.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-50 border-slate-200 shadow-sm">
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <User className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">Verified Owner</h3>
                                            <p className="text-xs text-slate-600 mt-1">
                                                Identity and residency verified by BlockHyre.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Specifications (Example) */}
                            {listing.specifications && Object.keys(listing.specifications).length > 0 && (
                                <div className="pt-4">
                                    <h3 className="text-xl font-bold font-serif text-slate-900 mb-4">Specifications</h3>
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                                        {Object.entries(listing.specifications).map(([key, value]) => (
                                            <div key={key} className="flex justify-between border-b border-slate-100 pb-2">
                                                <dt className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                                                <dd className="font-medium text-slate-900">{String(value)}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Booking Card (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border-slate-200 shadow-lg overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                    <div className="flex justify-between items-baseline">
                                        <div>
                                            <span className="text-2xl font-bold text-slate-900">${listing.daily_price}</span>
                                            <span className="text-slate-500 font-medium">/day</span>
                                        </div>
                                        {listing.accepts_barter && (
                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
                                                🍓 Barter Friendly
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-slate-700">Peace Fund Fee</div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Tier {listing.category?.risk_daily_fee <= 1 ? '1' : listing.category?.risk_daily_fee <= 5 ? '2' : '3'} Coverage</span>
                                            <span className="font-medium text-slate-900">+${listing.category?.risk_daily_fee || 0}/day</span>
                                        </div>
                                        <p className="text-xs text-slate-400">Includes $0 deductible damage protection.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-slate-700">Availability</div>
                                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-2 rounded-md">
                                            <CalendarIcon className="h-4 w-4" />
                                            Available Today
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-2">
                                        <Link href={`/request-booking/${listing.id}`} className="w-full block">
                                            <Button size="lg" className="w-full bg-safety-orange hover:bg-orange-600 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all">
                                                Request to Rent
                                            </Button>
                                        </Link>
                                        <p className="text-xs text-center text-slate-400">
                                            You won't be charged yet.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 justify-center">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <ShieldCheck className="h-3 w-3" />
                                        <span>Full money-back guarantee</span>
                                    </div>
                                </CardFooter>
                            </Card>

                            {/* Owner Profile Preview */}
                            <div className="mt-6 flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">Owner</div>
                                    <div className="flex items-center text-xs text-slate-500">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                        <span>4.9 (12 reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </main>
    );
}
