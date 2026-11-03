"use client";

import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { Star } from "lucide-react";
import { cn, generateSlug } from "@/lib/utils";
import { Tool } from "@/app/components/tool-card";
import { FavoriteButton } from "@/app/components/favorite-button";

interface MobileToolCardProps {
    tool: Tool;
}

export const MobileToolCard = memo(({ tool }: MobileToolCardProps) => {
    const hasReviews = (tool.ownerReviewCount ?? 0) > 0;

    return (
        <div className="flex bg-card rounded-card border border-border/80 overflow-hidden shadow-xs h-32 relative group transition-all duration-300 hover:shadow-md hover:border-primary/40">
            <div className="w-[35%] relative bg-muted">
                <Image
                    src={tool.image}
                    alt={tool.title}
                    fill
                    sizes="(max-width: 768px) 35vw, 200px"
                    className="object-cover"
                />
                <FavoriteButton
                    listingId={tool.id}
                    variant="overlay"
                    className="top-2 left-2 z-20 h-7 w-7"
                />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold font-serif text-card-foreground line-clamp-2 text-sm leading-snug mb-1">{tool.title}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{tool.distance ? `${tool.distance.toFixed(1)} miles` : 'Nearby'}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <div className="flex items-center gap-0.5">
                            <Star className={cn("h-3 w-3", hasReviews ? "text-primary fill-primary" : "text-muted-foreground/40")} />
                            <span className={cn("text-xs font-mono font-bold", hasReviews ? "text-card-foreground" : "text-muted-foreground/60")}>
                                {hasReviews ? `${Number(tool.ownerRating).toFixed(1)}` : "New"}
                            </span>
                            {hasReviews && (
                                <span className="text-2xs text-muted-foreground/60 font-mono">({tool.ownerReviewCount})</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-1">
                    <span className="font-bold font-mono text-lg text-primary tracking-tight">${tool.price}</span>
                    <span className="text-2xs font-mono uppercase tracking-widest text-muted-foreground ml-1">/day</span>
                </div>
            </div>
            <Link
                href={`/listings/${tool.id}/${generateSlug(tool.title)}`}
                className="absolute inset-0 z-10 block"
                aria-label={`View details for ${tool.title}`}
            >
                <span className="sr-only">View Details</span>
            </Link>
        </div>
    );
});

MobileToolCard.displayName = "MobileToolCard";
