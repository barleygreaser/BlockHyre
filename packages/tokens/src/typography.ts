/**
 * BlockHyre Typography System: "Industrial Boutique"
 * Bebas Neue (Display) + Roboto Slab (Serif) + Inter (Sans) + Space Mono (Mono)
 */

export const fontFamilies = {
  display: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
  serif: 'var(--font-roboto-slab), "Roboto Slab", serif',
  sans: 'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'var(--font-space-mono), "Space Mono", "Courier New", monospace',
} as const;

/**
 * Fallback font stacks for environments without CSS variables (e.g. Email clients like Outlook/Gmail, SSR canvas)
 */
export const emailFontFamilies = {
  display: '"Bebas Neue", Impact, -apple-system, sans-serif',
  serif: '"Roboto Slab", Georgia, "Times New Roman", serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  mono: '"Space Mono", "Courier New", Courier, monospace',
} as const;

/**
 * 12-Tier Standardized Typographic Sizing Scale
 */
export const fontSizes = {
  "2xs": "0.625rem",  // 10px - Industrial telemetry & badge metadata
  xs: "0.75rem",      // 12px - Footnotes & tags
  sm: "0.875rem",     // 14px - Secondary body & interactive controls
  base: "1rem",       // 16px - Standard body
  lg: "1.125rem",     // 18px - Lead body & small titles
  xl: "1.25rem",      // 20px - Card titles & section subheads
  "2xl": "1.5rem",    // 24px - Section headers
  "3xl": "1.875rem",  // 30px - Page titles
  "4xl": "2.25rem",   // 36px - Hero sub-displays
  "5xl": "3rem",      // 48px - Primary display
  "6xl": "3.75rem",   // 60px - Large display numbers
  "7xl": "4.5rem",    // 72px - Monumental headlines
} as const;

/**
 * Typographic Line Heights (Leading)
 */
export const lineHeights = {
  none: "1",
  tight: "1.15",
  snug: "1.25",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
} as const;

/**
 * Typographic Letter Spacing (Tracking)
 */
export const letterSpacing = {
  tighter: "-0.04em",
  tight: "-0.02em",
  normal: "0em",
  wide: "0.05em",
  wider: "0.1em",
  widest: "0.15em",
  industrial: "0.2em", // Spec, badge uppercase metadata & telemetry
} as const;

/**
 * Typographic Font Weights
 */
export const fontWeights = {
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;
