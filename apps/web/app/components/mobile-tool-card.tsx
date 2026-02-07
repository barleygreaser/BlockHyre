"use client";

import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { generateSlug } from "@/lib/utils";
import { Tool } from "@/app/components/tool-card";

interface MobileToolCardProps {
    tool: Tool;
}

export const MobileToolCard = memo(({ tool }: MobileToolCardProps) => {
    return (
        <Link href={`/listings/${tool.id}/${generateSlug(tool.title)}`}>
            <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm h-32">
                <div className="w-[35%] relative">
                    <Image
                        src={tool.image}
                        alt={tool.title}
                        fill
                        sizes="(max-width: 768px) 35vw, 200px"
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 line-clamp-2 text-sm leading-tight mb-1">{tool.title}</h3>
                        <div className="text-xs text-slate-500">{tool.distance ? `${tool.distance.toFixed(1)} miles` : 'Nearby'}</div>
                    </div>
                    <div className="mt-1">
                        <span className="font-bold text-lg text-safety-orange">${tool.price}</span>
                        <span className="text-xs text-slate-500">/day</span>
                    </div>
                </div>
            </div>
        </Link>
    );
});

MobileToolCard.displayName = "MobileToolCard";
