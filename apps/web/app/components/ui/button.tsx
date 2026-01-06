import * as React from "react"
import { cn } from "@/lib/utils"

// Note: I am not installing class-variance-authority or radix-ui/react-slot yet.
// I should probably install them or write a simpler button if I want to avoid too many deps.
// The user asked for "Shadcn UI-style component architecture".
// I will implement a simpler version without cva/radix for now to keep it single-file friendly if possible,
// BUT standard shadcn uses them.
// Let's stick to the prompt "Shadcn UI-style component architecture".
// I'll implement a robust Button without extra deps to keep it simple but "style-compatible".

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link" | "destructive"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = "button"

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "bg-safety-orange text-white hover:bg-safety-orange/90",
            destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
            outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
            ghost: "hover:bg-slate-100 hover:text-slate-900",
            link: "text-slate-900 underline-offset-4 hover:underline",
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        }

        return (
            <Comp
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

const buttonVariants = ({ variant = "default", size = "default", className = "" }: { variant?: "default" | "outline" | "ghost" | "link" | "destructive", size?: "default" | "sm" | "lg" | "icon", className?: string }) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variants = {
        default: "bg-safety-orange text-white hover:bg-safety-orange/90",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",
    }

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    }

    return cn(baseStyles, variants[variant], sizes[size], className)
}

export { Button, buttonVariants }
