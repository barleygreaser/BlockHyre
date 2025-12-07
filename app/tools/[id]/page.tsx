"use client";

import { useState } from "react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { Calendar } from "@/app/components/ui/calendar";
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
    Info
} from "lucide-react";
import { addDays, format, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

// Mock Data for "Commercial Wood Chipper"
const TOOL_DATA = {
    id: "chipper-001",
    title: "Commercial Wood Chipper",
    owner: {
        name: "Robert F.",
        verified: true,
        rating: 4.9,
        reviews: 24,
        image: "https://placehold.co/100x100/e2e8f0/1e293b?text=RF"
    },
    distance: 0.8,
    images: [
        "https://placehold.co/800x600/e2e8f0/1e293b?text=Wood+Chipper+Main",
        "https://placehold.co/800x600/e2e8f0/1e293b?text=Side+View",
        "https://placehold.co/800x600/e2e8f0/1e293b?text=Control+Panel",
        "https://placehold.co/800x600/e2e8f0/1e293b?text=Hopper"
    ],
    price: {
        daily: 120,
        deposit: 500,
        peaceFundRate: 0.04 // 4%
    },
    specs: {
        power: "Gas (Honda GX390)",
        weight: "450 lbs",
        dimensions: "60\"L x 32\"W x 50\"H",
        capacity: "4-inch diameter"
    },
    isHeavyMachinery: true,
    manualUrl: "#"
};

export default function ToolDetailsPage() {
    const [selectedImage, setSelectedImage] = useState(0);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 2),
    });

    // Calculate Costs
    const days = dateRange?.from && dateRange?.to
        ? differenceInDays(dateRange.to, dateRange.from) + 1
        : 0;

    const rentalFee = days * TOOL_DATA.price.daily;
    const peaceFundFee = Math.round(rentalFee * TOOL_DATA.price.peaceFundRate);
    const total = rentalFee + peaceFundFee + TOOL_DATA.price.deposit;

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">

                {/* Breadcrumbs / Back */}
                <div className="mb-6">
                    <Button variant="link" className="pl-0 text-slate-500 hover:text-slate-900">
                        &larr; Back to Inventory
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
                                    src={TOOL_DATA.images[selectedImage]}
                                    alt={TOOL_DATA.title}
                                    className="w-full h-full object-cover"
                                />
                                {TOOL_DATA.isHeavyMachinery && (
                                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-md font-bold flex items-center gap-2 shadow-md">
                                        <AlertTriangle className="h-4 w-4" />
                                        Heavy Machinery
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {TOOL_DATA.images.map((img, idx) => (
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
                        </div>

                        {/* Title & Owner */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mb-2">
                                    {TOOL_DATA.title}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-safety-orange" />
                                        <span>{TOOL_DATA.distance} miles away</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span>{TOOL_DATA.owner.rating} ({TOOL_DATA.owner.reviews} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={TOOL_DATA.owner.image} alt={TOOL_DATA.owner.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                        {TOOL_DATA.owner.name}
                                        {TOOL_DATA.owner.verified && <CheckCircle className="h-3 w-3 text-blue-500" />}
                                    </p>
                                    <p className="text-xs text-slate-500">Verified Neighbor</p>
                                </div>
                            </div>
                        </div>

                        {/* Safety Warning */}
                        {TOOL_DATA.isHeavyMachinery && (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-4">
                                <Shield className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-red-900">Requires Safety Gate Clearance</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        This is a high-power tool. You must review the manufacturer manual and pass a quick competence check during checkout.
                                    </p>
                                    <a href={TOOL_DATA.manualUrl} className="inline-flex items-center gap-2 text-sm font-bold text-red-800 mt-2 hover:underline">
                                        <BookOpen className="h-4 w-4" />
                                        View Manufacturer Manual
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Tabs: Specs & Condition */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold font-serif text-slate-900">Technical Specifications</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                    <Zap className="h-5 w-5 text-slate-400 mb-2" />
                                    <p className="text-xs text-slate-500 uppercase">Power</p>
                                    <p className="font-bold text-slate-900">{TOOL_DATA.specs.power}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                    <Weight className="h-5 w-5 text-slate-400 mb-2" />
                                    <p className="text-xs text-slate-500 uppercase">Weight</p>
                                    <p className="font-bold text-slate-900">{TOOL_DATA.specs.weight}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                    <Ruler className="h-5 w-5 text-slate-400 mb-2" />
                                    <p className="text-xs text-slate-500 uppercase">Dimensions</p>
                                    <p className="font-bold text-slate-900">{TOOL_DATA.specs.dimensions}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                    <Info className="h-5 w-5 text-slate-400 mb-2" />
                                    <p className="text-xs text-slate-500 uppercase">Capacity</p>
                                    <p className="font-bold text-slate-900">{TOOL_DATA.specs.capacity}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Booking Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-slate-900 p-4 text-white text-center">
                                <p className="text-sm opacity-80">Daily Rate</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-3xl font-bold text-safety-orange">${TOOL_DATA.price.daily}</span>
                                    <span className="text-sm">/day</span>
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-6">

                                {/* Date Picker */}
                                <div className="space-y-6">
                                    <label className="text-sm font-bold text-slate-900">Select Dates</label>
                                    <div className="flex justify-center">
                                        <Calendar
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            disabled={(date) => date < new Date()}
                                        />
                                    </div>
                                </div>

                                {/* Cost Breakdown */}
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>${TOOL_DATA.price.daily} x {days} days</span>
                                        <span>${rentalFee}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            Peace Fund (10%)
                                            <Info className="h-3 w-3 text-slate-400" />
                                        </span>
                                        <span>${peaceFundFee}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-safety-orange">
                                        <span>Refundable Deposit</span>
                                        <span>${TOOL_DATA.price.deposit}</span>
                                    </div>

                                    <div className="flex justify-between items-end pt-3 border-t border-slate-200">
                                        <span className="font-bold text-slate-900">Total Due Now</span>
                                        <span className="text-2xl font-bold text-slate-900">${total}</span>
                                    </div>
                                </div>

                                <Button className="w-full h-12 text-lg font-bold bg-safety-orange hover:bg-safety-orange/90">
                                    Request to Rent
                                </Button>

                                <p className="text-xs text-center text-slate-400">
                                    You won't be charged until the owner approves.
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
