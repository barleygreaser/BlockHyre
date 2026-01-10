import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Shield, ShieldCheck } from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { Tool } from "@/app/components/tool-card";

interface FeaturedToolCardProps {
    tool: Tool;
}

export function FeaturedToolCard({ tool }: FeaturedToolCardProps) {
    // Determine Tier based on simple logic for now
    // Tier 3: Heavy Machinery or Price > $200
    // Tier 2: Price > $50
    // Tier 1: Others
    let tier = 1;
    if (tool.isHeavyMachinery || tool.price > 200) tier = 3;
    else if (tool.price > 50) tier = 2;

    const isVerified = true; // Hardcoded trust signal as requested

    return (
        <Card className="group overflow-hidden border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-white">
            {/* Image Section - More compact on mobile */}
            <div className="aspect-[4/3] md:aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
                {tool.image ? (
                    <Image
                        src={tool.image}
                        alt={tool.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                        No Image
                    </div>
                )}

                {/* Full-width Price Badge - Smaller on mobile */}
                <div className="absolute bottom-0 left-0 right-0 bg-safety-orange py-1.5 md:py-2 px-2 md:px-3 flex items-center justify-center">
                    <span className="text-white font-bold text-base md:text-lg tracking-wide">
                        ${tool.price}<span className="text-xs md:text-sm font-medium opacity-90">/day</span>
                    </span>
                </div>
            </div>

            {/* Content Section - Tighter padding on mobile */}
            <CardContent className="p-3 md:p-5 flex flex-col gap-2 md:gap-3 flex-grow">
                {/* Header: Title & Tier Badge */}
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base md:text-lg text-slate-900 leading-tight line-clamp-2 md:min-h-[3rem]" title={tool.title}>
                        {tool.title}
                    </h3>
                    <Badge variant="outline" className="shrink-0 border-slate-300 text-slate-600 text-[9px] md:text-[10px] uppercase font-bold tracking-wider">
                        Tier {tier}
                    </Badge>
                </div>

                {/* Trust Signals - Smaller on mobile */}
                <div className="flex items-center gap-1 md:gap-1.5 text-emerald-700">
                    <ShieldCheck className="w-3.5 md:w-4 h-3.5 md:h-4 fill-emerald-100" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide">Verified Owner</span>
                </div>

                {/* Categories/Meta - Smaller text on mobile */}
                <p className="text-xs md:text-sm text-slate-500 line-clamp-2 flex-grow">
                    {tool.category} — {tool.distance ? `${tool.distance.toFixed(1)} miles away` : 'Nearby'}
                </p>

                {/* Friction Reducer: Deposit - Smaller on mobile */}
                <p className="text-[10px] md:text-xs text-slate-400 font-medium">
                    Refundable Deposit: ${tool.deposit}
                </p>

                {/* CTA - Smaller button on mobile */}
                <div className="pt-1 md:pt-2 mt-auto">
                    <Link href={`/listings/${tool.id}/${generateSlug(tool.title)}`} className="block w-full">
                        <Button variant="outline" className="w-full text-xs md:text-sm h-8 md:h-10 border-slate-300 hover:border-safety-orange hover:text-safety-orange transition-colors">
                            View Tool Details
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
