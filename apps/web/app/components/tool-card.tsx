import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { FavoriteButton } from "@/app/components/favorite-button";
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

export const ToolCard = memo(({ tool }: ToolCardProps) => {
    return (
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow duration-200 border-slate-200 flex flex-col h-full group">
            <div className="aspect-video w-full bg-slate-100 relative">
                <Image
                    src={tool.image}
                    alt={tool.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, (max-width: 1600px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <FavoriteButton
                    listingId={tool.id}
                    variant="overlay"
                    className="top-3 left-3 z-20"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end pointer-events-none">
                    {tool.instantBook && (
                        <Badge className="bg-yellow-500 text-white flex items-center gap-1 border-none animate-glow pointer-events-auto px-1.5 py-0.5 text-[10px]">
                            <Zap className="h-3 w-3 fill-white" />
                            Instant
                        </Badge>
                    )}
                </div>

                {tool.distance && (
                    <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-medium text-white flex items-center gap-1 pointer-events-none">
                        <MapPin className="h-3 w-3" />
                        {tool.distance.toFixed(1)} mi
                    </div>
                )}
            </div>

            <div className="p-3 flex flex-col flex-grow gap-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-base text-slate-900 line-clamp-2 leading-tight flex-1" title={tool.title}>
                        {tool.title}
                    </h3>
                    <div className="flex flex-col items-end flex-shrink-0">
                        <span className="font-bold text-lg text-slate-900">${tool.price}</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase">/day</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[120px]">
                        {tool.category}
                    </span>
                    {(tool.isHeavyMachinery || tool.acceptsBarter) && (
                        <div className="flex gap-1">
                            {tool.isHeavyMachinery && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                            {tool.acceptsBarter && <span className="text-[10px]">🍓</span>}
                        </div>
                    )}
                </div>

                <p className="text-[10px] text-slate-400 mt-auto pt-2 border-t border-slate-100">
                    + ${tool.deposit} deposit
                </p>
            </div>

            <Link
                href={`/listings/${tool.id}/${generateSlug(tool.title)}`}
                className="absolute inset-0 z-10"
                aria-label={`View details for ${tool.title}`}
            >
                <span className="sr-only">View Details</span>
            </Link>
        </Card>
    );
});

ToolCard.displayName = "ToolCard";
