import { Skeleton } from "@/app/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";

export function InventorySkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-slate-200 flex flex-col h-full">
                    {/* Image Placeholder */}
                    <div className="aspect-video w-full bg-slate-100 relative">
                        <Skeleton className="w-full h-full" />
                    </div>

                    {/* Header Placeholder */}
                    <CardHeader className="p-4 pb-2 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-3 w-1/3" />
                    </CardHeader>

                    {/* Content Placeholder (Price) */}
                    <CardContent className="p-4 pt-0 flex-grow">
                        <div className="flex items-baseline gap-1 mt-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="h-3 w-40 mt-2" />
                    </CardContent>

                    {/* Footer Placeholder (Button) */}
                    <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-10 w-full rounded-md" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
