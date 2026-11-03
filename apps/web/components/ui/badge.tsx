import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none transition-all select-none overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-midnight-navy shadow-xs",
        urgent:
          "border-transparent bg-urgent text-urgent-foreground shadow-xs font-semibold [a&]:hover:bg-safety-orange-hover",
        operational:
          "border-peace-fund/30 bg-peace-fund/10 text-peace-fund dark:bg-peace-fund/20 font-semibold shadow-xs",
        periwinkle:
          "border-periwinkle-blue/30 bg-periwinkle-blue/10 text-periwinkle-blue dark:bg-periwinkle-blue/20 font-semibold shadow-xs",
        spec:
          "border-border/60 bg-muted text-muted-foreground font-mono text-2xs tracking-industrial uppercase",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/30 dark:bg-destructive/80",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
      shape: {
        pill: "rounded-full px-2.5 py-0.5",
        subtle: "rounded-subtle px-2 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "pill",
    },
  }
)

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({
  className,
  variant,
  shape,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, shape }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
