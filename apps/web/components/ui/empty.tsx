"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Empty = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex h-full w-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
            className
        )}
        {...props}
    />
))
Empty.displayName = "Empty"

const EmptyHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center space-y-2", className)}
        {...props}
    />
))
EmptyHeader.displayName = "EmptyHeader"

interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "icon"
}

const EmptyMedia = React.forwardRef<HTMLDivElement, EmptyMediaProps>(
    ({ className, variant = "default", children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center justify-center",
                    variant === "icon" && "h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800",
                    className
                )}
                {...props}
            >
                {variant === "icon" && React.isValidElement(children)
                    ? React.cloneElement(children as React.ReactElement<{ className?: string }>, {
                        className: "h-6 w-6 text-slate-400 dark:text-slate-500",
                    })
                    : children}
            </div>
        )
    }
)
EmptyMedia.displayName = "EmptyMedia"

const EmptyTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-lg font-medium text-slate-900 dark:text-slate-50 mt-4", className)}
        {...props}
    />
))
EmptyTitle.displayName = "EmptyTitle"

const EmptyDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn(
            "text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto",
            className
        )}
        {...props}
    />
))
EmptyDescription.displayName = "EmptyDescription"

const EmptyContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("mt-6", className)}
        {...props}
    />
))
EmptyContent.displayName = "EmptyContent"

export {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
}
