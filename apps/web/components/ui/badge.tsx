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
        notification:
          "border-transparent bg-electric-indigo text-white font-bold text-2xs min-w-5 h-5 px-1.5 shadow-[0_0_10px_rgba(91,110,174,0.4)] tabular-nums",
        "notification-urgent":
          "border-transparent bg-urgent text-white font-bold text-2xs min-w-5 h-5 px-1.5 shadow-[0_0_10px_rgba(255,107,0,0.4)] tabular-nums",
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

// ─── Tokenized Notification Counter Badge ─────────────────────────────────────

export interface NotificationBadgeProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  count?: number;
  max?: number;
  showZero?: boolean;
  variant?: "default" | "urgent";
  children?: React.ReactNode;
}

export function NotificationBadge({
  count,
  max = 99,
  showZero = false,
  variant = "default",
  className,
  children,
  ...props
}: NotificationBadgeProps) {
  if (count !== undefined && count <= 0 && !showZero) {
    return null;
  }

  const display =
    count !== undefined
      ? count > max
        ? `${max}+`
        : count
      : children;

  return (
    <Badge
      variant={variant === "urgent" ? "notification-urgent" : "notification"}
      shape="pill"
      className={cn("leading-none", className)}
      {...props}
    >
      {display}
    </Badge>
  );
}

// ─── Tokenized Telemetry / Notification Ping Dot ─────────────────────────────

const notificationDotVariants = cva("relative inline-flex rounded-full shrink-0", {
  variants: {
    variant: {
      default: "bg-electric-indigo",
      urgent: "bg-urgent",
      operational: "bg-peace-fund shadow-[0_0_8px_rgba(16,185,129,0.5)]",
      destructive: "bg-destructive",
      amber: "bg-amber-500",
    },
    size: {
      sm: "h-2 w-2",
      default: "h-2.5 w-2.5",
      lg: "h-3 w-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface NotificationDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof notificationDotVariants> {
  ping?: boolean;
  border?: boolean;
}

export function NotificationDot({
  variant,
  size,
  ping = false,
  border = false,
  className,
  ...props
}: NotificationDotProps) {
  const dotClasses = cn(
    notificationDotVariants({ variant, size }),
    border && "border border-white/40"
  );

  if (ping) {
    return (
      <span className={cn("relative flex items-center justify-center shrink-0", className)} {...props}>
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            notificationDotVariants({ variant, size })
          )}
        />
        <span className={dotClasses} />
      </span>
    );
  }

  return <span className={cn(dotClasses, className)} {...props} />;
}

export { Badge, badgeVariants }
