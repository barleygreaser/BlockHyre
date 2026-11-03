import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Star } from "lucide-react";
import { cn, generateSlug } from "@/lib/utils";
import { Tool } from "@/app/components/tool-card";

interface FeaturedToolCardProps {
    tool: Tool;
}

export const FeaturedToolCard = memo(({ tool }: FeaturedToolCardProps) => {
    let tier = 1;
    if (tool.isHeavyMachinery || tool.price > 200) tier = 3;
    else if (tool.price > 50) tier = 2;

    const tierLabel = `T${tier}`;

    return (
        <Link
            href={`/listings/${tool.id}/${generateSlug(tool.title)}`}
            className="block group h-full"
        >
            <Card
                variant="boutique"
                padding="none"
                className="spec-card overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-xl shadow-xs flex flex-col h-full border-border/80"
            >
                {/* Image Section */}
                <div className="aspect-[16/10] w-full bg-muted relative overflow-hidden">
                    {tool.image ? (
                        <Image
                            src={tool.image}
                            alt={tool.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground/50 font-mono text-xs uppercase tracking-wider">
                            No Image
                        </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <Badge
                            variant={tier === 3 ? "urgent" : tier === 2 ? "default" : "secondary"}
                            shape="pill"
                            className="text-2xs font-mono font-bold uppercase tracking-widest px-3 py-1"
                        >
                            {tierLabel}
                        </Badge>
                        {tool.instantBook && (
                            <Badge
                                variant="default"
                                shape="pill"
                                className="bg-primary/95 text-primary-foreground text-2xs font-bold uppercase tracking-wider px-3 py-1 flex items-center gap-1 border-0"
                            >
                                <Zap className="h-3 w-3" />
                                Instant
                            </Badge>
                        )}
                    </div>

                    {/* Price Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-3 px-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white font-mono">${tool.price}</span>
                            <span className="text-xs text-white/70 font-mono">/day</span>
                        </div>
                    </div>
                </div>

                {/* Spec Sheet Content */}
                <div className="p-5 md:p-6 flex flex-col gap-3 flex-grow">
                    {/* Title */}
                    <h3 className="font-bold text-base md:text-lg text-card-foreground leading-snug line-clamp-2 tracking-tight" title={tool.title}>
                        {tool.title}
                    </h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-2xs font-mono uppercase tracking-industrial">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground/60">Category</span>
                            <span className="text-card-foreground font-bold">{tool.category}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground/60">Distance</span>
                            <span className="text-card-foreground font-bold">
                                {tool.distance ? `${tool.distance.toFixed(1)} mi` : "Nearby"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground/60">Deposit</span>
                            <span className="text-card-foreground font-bold">${tool.deposit}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground/60">Rating</span>
                            <span className="flex items-center gap-1">
                                <Star className={cn("w-3 h-3", (tool.ownerReviewCount ?? 0) > 0 ? "text-primary fill-primary" : "text-muted-foreground/40")} />
                                <span className={cn("font-bold", (tool.ownerReviewCount ?? 0) > 0 ? "text-card-foreground" : "text-muted-foreground/60")}>
                                    {(tool.ownerReviewCount ?? 0) > 0
                                        ? `${Number(tool.ownerRating).toFixed(1)} (${tool.ownerReviewCount})`
                                        : "New"}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Barter Badge */}
                    {tool.acceptsBarter && (
                        <div className="text-2xs font-mono text-primary uppercase tracking-wider border border-primary/20 rounded-full px-3 py-1 self-start bg-primary/10">
                            Accepts Barter
                        </div>
                    )}

                    {/* CTA */}
                    <div className="pt-2 mt-auto">
                        <Button
                            variant="ghost"
                            className="w-full text-xs h-10 text-muted-foreground hover:text-primary hover:bg-primary/5 font-bold uppercase tracking-wider rounded-default transition-all group/btn flex items-center justify-center gap-2"
                        >
                            View Spec Sheet
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </Card>
        </Link>
    );
});

FeaturedToolCard.displayName = "FeaturedToolCard";
