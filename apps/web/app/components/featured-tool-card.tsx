import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ShieldCheck, ArrowRight, Zap } from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { Tool } from "@/app/components/tool-card";

interface FeaturedToolCardProps {
    tool: Tool;
}

export const FeaturedToolCard = memo(({ tool }: FeaturedToolCardProps) => {
    let tier = 1;
    if (tool.isHeavyMachinery || tool.price > 200) tier = 3;
    else if (tool.price > 50) tier = 2;

    const tierLabel = `T${tier}`;
    const tierColor = tier === 3
        ? "text-red-500 bg-red-50 border-red-200"
        : tier === 2
            ? "text-safety-orange bg-safety-orange/10 border-safety-orange/20"
            : "text-slate-500 bg-slate-50 border-slate-200";

    return (
        <Link
            href={`/listings/${tool.id}/${generateSlug(tool.title)}`}
            className="block group"
        >
            <div className="spec-card bg-white rounded-[2rem] border border-slate-200 overflow-hidden transition-all duration-500 hover:border-safety-orange/40 hover:shadow-xl shadow-sm flex flex-col h-full">
                {/* Image Section */}
                <div className="aspect-[16/10] w-full bg-slate-100 relative overflow-hidden">
                    {tool.image ? (
                        <Image
                            src={tool.image}
                            alt={tool.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-mono text-xs uppercase tracking-wider">
                            No Image
                        </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <Badge className={`${tierColor} border text-[10px] font-mono font-bold uppercase tracking-widest rounded-full px-3 py-1`}>
                            {tierLabel}
                        </Badge>
                        {tool.instantBook && (
                            <Badge className="bg-safety-orange/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 flex items-center gap-1 border-0">
                                <Zap className="h-3 w-3" />
                                Instant
                            </Badge>
                        )}
                    </div>

                    {/* Price Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent pt-8 pb-3 px-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white font-mono">${tool.price}</span>
                            <span className="text-xs text-white/60 font-mono">/day</span>
                        </div>
                    </div>
                </div>

                {/* Spec Sheet Content */}
                <div className="p-5 md:p-6 flex flex-col gap-3 flex-grow">
                    {/* Title */}
                    <h3 className="font-bold text-base md:text-lg text-slate-900 leading-tight line-clamp-2 tracking-tight" title={tool.title}>
                        {tool.title}
                    </h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono uppercase tracking-wider">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-300">Category</span>
                            <span className="text-slate-600 font-bold">{tool.category}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-300">Distance</span>
                            <span className="text-slate-600 font-bold">
                                {tool.distance ? `${tool.distance.toFixed(1)} mi` : "Nearby"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-300">Deposit</span>
                            <span className="text-slate-600 font-bold">${tool.deposit}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-300">Status</span>
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-600 font-bold">Verified</span>
                            </span>
                        </div>
                    </div>

                    {/* Barter Badge */}
                    {tool.acceptsBarter && (
                        <div className="text-[10px] font-mono text-safety-orange/70 uppercase tracking-wider border border-safety-orange/15 rounded-full px-3 py-1 self-start bg-safety-orange/5">
                            Accepts Barter
                        </div>
                    )}

                    {/* CTA */}
                    <div className="pt-2 mt-auto">
                        <Button
                            variant="ghost"
                            className="w-full text-xs h-10 text-slate-400 hover:text-safety-orange hover:bg-safety-orange/5 font-bold uppercase tracking-wider rounded-xl transition-all group/btn flex items-center justify-center gap-2"
                        >
                            View Spec Sheet
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
});

FeaturedToolCard.displayName = "FeaturedToolCard";
