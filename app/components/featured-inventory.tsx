import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Star } from "lucide-react";

import { Listing } from "@/app/hooks/use-marketplace";

interface FeaturedInventoryProps {
    onRentClick: () => void;
    listings: Listing[];
}

export function FeaturedInventory({ onRentClick, listings }: FeaturedInventoryProps) {
    // Use the first 3 listings or whatever is passed
    const displayTools = listings.slice(0, 3);

    return (
        <section className="py-20 bg-slate-50" id="inventory">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-serif">Featured Inventory</h2>
                        <p className="text-slate-600 mt-2">High-value tools available for rent in your neighborhood today.</p>
                    </div>
                    <Button variant="outline">View All Inventory</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayTools.map((tool) => (
                        <Card key={tool.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                            <div className="aspect-video w-full bg-slate-200 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={tool.images?.[0] || `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(tool.title)}`}
                                    alt={tool.title}
                                    className="w-full h-full object-cover"
                                />
                                <Badge className="absolute top-3 right-3 bg-white/90 text-slate-900 hover:bg-white">
                                    ${tool.daily_price}/day
                                </Badge>
                            </div>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                                </div>
                                <CardDescription className="flex items-center gap-1 text-xs font-medium text-slate-500">
                                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                                        Refundable Deposit: $100
                                    </Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                            N
                                        </div>
                                        <span>Neighbor</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {tool.distance ? `${tool.distance.toFixed(1)} miles` : 'Nearby'}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-3 border-t border-slate-100">
                                <Button className="w-full" onClick={onRentClick}>
                                    Rent Now
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
