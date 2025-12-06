import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { AlertTriangle, CheckCircle, Star, Shield, MapPin, ArrowLeft } from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";

export default function ToolDetailsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Inventory
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Images */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="aspect-video w-full bg-slate-200 rounded-xl overflow-hidden relative">
                            {/* Main Image Placeholder */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://placehold.co/1200x800/e2e8f0/1e293b?text=Harvest+Right+Freeze+Dryer"
                                alt="Freeze Dryer Main"
                                className="w-full h-full object-cover"
                            />
                            <Badge className="absolute top-4 left-4 bg-safety-orange text-white border-none">
                                Available Now
                            </Badge>
                        </div>

                        {/* Thumbnail Carousel */}
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-video bg-slate-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent hover:border-slate-900">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://placehold.co/400x300/e2e8f0/1e293b?text=Photo+${i}`}
                                        alt={`View ${i}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">Description</h2>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Medium Harvest Right Freeze Dryer. Perfect for preserving garden harvests.
                                Includes vacuum pump and oil filter. I can provide a quick tutorial on setup if needed.
                                Recently serviced and in excellent working condition.
                            </p>

                            <h3 className="text-lg font-bold font-serif text-slate-900 mb-3">Specifications</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 110V Standard Outlet</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 4 Stainless Steel Trays</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Oil Pump Included</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 7-10 lbs Capacity per Batch</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Details & Checkout */}
                    <div className="space-y-6">

                        {/* Title & Price Card */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <h1 className="text-3xl font-bold font-serif text-slate-900 mb-2">Harvest Right Freeze Dryer</h1>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                    <MapPin className="h-4 w-4" />
                                    <span>0.3 miles away • North Hills</span>
                                </div>

                                <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-slate-100">
                                    <div>
                                        <span className="text-3xl font-bold text-slate-900">$45</span>
                                        <span className="text-slate-500">/day</span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        Deposit: $250
                                    </Badge>
                                </div>

                                <Link href="/checkout" className="w-full">
                                    <Button size="lg" className="w-full text-base bg-safety-orange hover:bg-safety-orange/90">
                                        Book Now
                                    </Button>
                                </Link>
                                <p className="text-xs text-center text-slate-400 mt-3">
                                    You won't be charged until the owner accepts.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Safety Alert Box */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-yellow-800 text-sm uppercase tracking-wide">Safety Rating: HIGH RISK</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        This equipment requires specific knowledge to operate safely. Improper use can result in injury or equipment damage.
                                    </p>
                                    <a href="#" className="text-sm font-semibold text-yellow-800 underline mt-2 inline-block hover:text-yellow-900">
                                        View Manufacturer Manual
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Owner Profile Card */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                                        D
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Dave M.</h3>
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium text-slate-900">4.9</span>
                                            <span>(12 Rents)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                                    <Shield className="h-4 w-4" />
                                    Verified Neighbor
                                </div>

                                <div className="mt-4 text-sm text-slate-600">
                                    "I love sharing my tools to help neighbors build their dream projects. Ask me anything!"
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
