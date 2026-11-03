import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/app/components/favorite-button";
import { MapPin, AlertTriangle, Zap, Star } from "lucide-react";
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
    distance?: number;
    acceptsBarter?: boolean;
    instantBook?: boolean;
    ownerRating?: number;
    ownerReviewCount?: number;
}

interface ToolCardProps {
    tool: Tool;
}

export const ToolCard = memo(({ tool }: ToolCardProps) => {
    const hasReviews = (tool.ownerReviewCount ?? 0) > 0;

    return (
        <Card
            data-testid="tool-card"
            variant="default"
            padding="none"
            className="relative overflow-hidden hover:shadow-md transition-all duration-300 border-border/80 hover:border-primary/40 flex flex-col h-full group"
        >
            <div className="aspect-video w-full bg-muted relative">
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
                        <Badge
                            data-testid="instant-badge"
                            variant="urgent"
                            shape="subtle"
                            className="text-2xs flex items-center gap-1 border-none animate-glow pointer-events-auto"
                        >
                            <Zap className="h-3 w-3 fill-white" />
                            Instant
                        </Badge>
                    )}
                </div>

                {tool.distance && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-subtle text-2xs font-mono font-medium text-signal-white flex items-center gap-1 pointer-events-none">
                        <MapPin className="h-3 w-3" />
                        {tool.distance.toFixed(1)} mi
                    </div>
                )}
            </div>

            <div className="p-3.5 flex flex-col flex-grow gap-1.5">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-base text-card-foreground line-clamp-2 leading-snug flex-1" title={tool.title}>
                        {tool.title}
                    </h3>
                    <div className="flex flex-col items-end flex-shrink-0">
                        <span className="font-bold text-lg text-card-foreground">${tool.price}</span>
                        <span className="text-2xs text-muted-foreground font-mono font-medium uppercase">/day</span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-subtle text-xs truncate max-w-[130px]">
                            {tool.category}
                        </span>
                        {(tool.isHeavyMachinery || tool.acceptsBarter) && (
                            <div className="flex gap-1">
                                {tool.isHeavyMachinery && <AlertTriangle className="h-3.5 w-3.5 text-urgent" />}
                                {tool.acceptsBarter && <span className="text-xs">🍓</span>}
                            </div>
                        )}
                    </div>

                    {/* Rating Pill */}
                    <div className="flex items-center gap-1 shrink-0">
                        <Star className={cn("h-3 w-3", hasReviews ? "text-primary fill-primary" : "text-muted-foreground/40")} />
                        <span className={cn("font-mono text-xs font-bold", hasReviews ? "text-card-foreground" : "text-muted-foreground/60")}>
                            {hasReviews
                                ? `${Number(tool.ownerRating).toFixed(1)}`
                                : "New"}
                        </span>
                        {hasReviews && (
                            <span className="text-2xs text-muted-foreground/60 font-mono">
                                ({tool.ownerReviewCount})
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-2xs text-muted-foreground mt-auto pt-2 border-t border-border/60 font-mono">
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
