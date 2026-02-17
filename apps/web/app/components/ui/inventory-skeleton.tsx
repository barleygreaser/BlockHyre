import { Skeleton } from "@/app/components/ui/skeleton";
import { Card } from "@/app/components/ui/card";

export function InventorySkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="relative overflow-hidden border-slate-200 flex flex-col h-full rounded-lg">
                    {/* Image Placeholder */}
                    <div className="aspect-video w-full bg-slate-100 relative">
                        <Skeleton className="w-full h-full" />
                        {/* Favorite Button Placeholder */}
                        <Skeleton className="absolute top-2 left-2 h-8 w-8 rounded-full z-10" />
                    </div>

                    <div className="p-3 flex flex-col flex-grow gap-2">
                        {/* Title and Price Row */}
                        <div className="flex justify-between items-start gap-2">
                            <Skeleton className="h-5 w-3/4 rounded-sm" />
                            <div className="flex flex-col items-end gap-1">
                                <Skeleton className="h-6 w-12 rounded-sm" />
                            </div>
                        </div>

                        {/* Category/Tags Row */}
                        <div className="flex items-center gap-2 mt-1">
                            <Skeleton className="h-4 w-20 rounded-sm" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>

                        {/* Deposit Footer */}
                        <div className="mt-auto pt-2 border-t border-slate-100">
                            <Skeleton className="h-3 w-24 rounded-sm" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
