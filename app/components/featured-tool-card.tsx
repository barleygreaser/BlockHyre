import Link from "next/link";
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
            {/* Image Section */}
            <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Full-width Price Badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-safety-orange py-2 px-3 flex items-center justify-center">
                    <span className="text-white font-bold text-lg tracking-wide">
                        ${tool.price}<span className="text-sm font-medium opacity-90">/day</span>
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-5 flex flex-col gap-3 flex-grow">
                {/* Header: Title & Tier Badge */}
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2 min-h-[3rem]" title={tool.title}>
                        {tool.title}
                    </h3>
                    <Badge variant="outline" className="shrink-0 border-slate-300 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                        Tier {tier}
                    </Badge>
                </div>

                {/* Trust Signals */}
                <div className="flex items-center gap-1.5 text-emerald-700">
                    <ShieldCheck className="w-4 h-4 fill-emerald-100" />
                    <span className="text-xs font-bold uppercase tracking-wide">Verified Owner</span>
                </div>

                {/* Categories/Meta */}
                <p className="text-sm text-slate-500 line-clamp-2 flex-grow">
                    {tool.category} — {tool.distance ? `${tool.distance.toFixed(1)} miles away` : 'Nearby'}
                </p>

                {/* Friction Reducer: Deposit */}
                <p className="text-xs text-slate-400 font-medium">
                    Refundable Deposit: ${tool.deposit}
                </p>

                {/* CTA */}
                <div className="pt-2 mt-auto">
                    <Link href={`/inventory/${tool.id}/${generateSlug(tool.title)}`} className="block w-full">
                        <Button variant="outline" className="w-full border-slate-300 hover:border-safety-orange hover:text-safety-orange transition-colors">
                            View Tool Details
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
