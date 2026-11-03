import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-default text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:ring-offset-1 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-midnight-navy hover:shadow-md active:translate-y-0.5 active:shadow-xs",
        urgent:
          "bg-urgent text-urgent-foreground shadow-xs hover:bg-safety-orange-hover hover:shadow-md active:translate-y-0.5 active:shadow-xs font-semibold",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 hover:shadow-md active:translate-y-0.5 active:shadow-xs focus-visible:ring-destructive/30",
        outline:
          "border border-border/80 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-border active:translate-y-0.5 dark:bg-card/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:translate-y-0.5",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline",
        boutique:
          "bg-primary text-primary-foreground hover:bg-midnight-navy rounded-full shadow-md hover:shadow-xl hover:shadow-electric-indigo/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm font-semibold tracking-wide uppercase text-xs px-5 py-2.5",
        workshop:
          "bg-workshop-dark text-workshop-dark-foreground border border-white/10 hover:bg-charcoal-light shadow-md active:translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3 min-h-[40px]",
        sm: "h-8 rounded-subtle gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-default px-6 has-[>svg]:px-4 text-base min-h-[48px]",
        touch: "h-11 min-h-[44px] px-5 rounded-default text-sm font-medium",
        icon: "size-10 min-h-[40px] min-w-[40px]",
        "icon-sm": "size-8 min-h-[32px] min-w-[32px]",
        "icon-lg": "size-12 min-h-[48px] min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
