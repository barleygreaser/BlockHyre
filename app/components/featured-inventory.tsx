import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Star } from "lucide-react";

interface FeaturedInventoryProps {
    onRentClick: () => void;
}

export function FeaturedInventory({ onRentClick }: FeaturedInventoryProps) {
    const tools = [
        {
            id: 1,
            name: "Harvest Right Freeze Dryer",
            image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Freeze+Dryer",
            price: "$45/day",
            deposit: "$250",
            distance: "0.3 miles",
            owner: "Dave M.",
            rating: 4.9,
        },
        {
            id: 2,
            name: "DeWalt 10-Inch Table Saw",
            image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Table+Saw",
            price: "$25/day",
            deposit: "$100",
            distance: "0.8 miles",
            owner: "Sarah J.",
            rating: 5.0,
        },
        {
            id: 3,
            name: "Honda Mid-Tine Rototiller",
            image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Rototiller",
            price: "$35/day",
            deposit: "$150",
            distance: "1.2 miles",
            owner: "Mike T.",
            rating: 4.8,
        },
    ];

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
                    {tools.map((tool) => (
                        <Card key={tool.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                            <div className="aspect-video w-full bg-slate-200 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={tool.image}
                                    alt={tool.name}
                                    className="w-full h-full object-cover"
                                />
                                <Badge className="absolute top-3 right-3 bg-white/90 text-slate-900 hover:bg-white">
                                    {tool.price}
                                </Badge>
                            </div>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="text-xl">{tool.name}</CardTitle>
                                </div>
                                <CardDescription className="flex items-center gap-1 text-xs font-medium text-slate-500">
                                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                                        Refundable Deposit: {tool.deposit}
                                    </Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                            {tool.owner.charAt(0)}
                                        </div>
                                        <span>{tool.owner}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {tool.distance}
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
