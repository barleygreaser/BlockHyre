import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted/70 dark:bg-muted/40 rounded-subtle", className)}
            {...props}
        />
    )
}

export { Skeleton }
