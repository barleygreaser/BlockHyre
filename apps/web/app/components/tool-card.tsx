import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { MapPin, AlertTriangle, Zap } from "lucide-react";
import { cn, generateSlug } from "@/lib/utils";

export interface Tool {
    id: string;
    title: string;
    image: string;
    price: number;
    deposit: number;
    category: string;
    isHeavyMachinery: boolean;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    distance?: number; // Calculated at runtime
    acceptsBarter?: boolean;
    instantBook?: boolean;
}

interface ToolCardProps {
    tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-slate-200 flex flex-col h-full">
            <div className="aspect-video w-full bg-slate-100 relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                    {tool.instantBook && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1 border-none animate-glow">
                            <Zap className="h-3 w-3 fill-white" />
                            Instant Book
                        </Badge>
                    )}
                    {tool.isHeavyMachinery && (
                        <Badge variant="destructive" className="flex items-center gap-1 shadow-sm">
                            <AlertTriangle className="h-3 w-3" />
                            Heavy Machinery
                        </Badge>
                    )}
                    {tool.acceptsBarter && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-sm border-none">
                            🍓 Accepts Barter
                        </Badge>
                    )}
                </div>

                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-slate-900 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-safety-orange" />
                    {tool.distance ? `${tool.distance.toFixed(1)} miles` : 'Nearby'}
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <h3 className="font-bold text-lg text-slate-900 line-clamp-1" title={tool.title}>
                    {tool.title}
                </h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    {tool.category}
                </p>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-bold text-safety-orange">${tool.price}</span>
                    <span className="text-sm text-slate-500">/day</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                    + ${tool.deposit} refundable deposit
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Link href={`/listings/${tool.id}/${generateSlug(tool.title)}`} className="w-full cursor-pointer">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                        View Details
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
