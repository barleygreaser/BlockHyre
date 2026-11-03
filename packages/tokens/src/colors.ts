/**
 * BlockHyre Canonical Brand Colors
 * Derived from docs/BRAND_SHEET.md: "The Industrial Boutique"
 */

export const primitiveColors = {
  electricIndigo: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#7289DA", // Periwinkle Blue / Light Indigo
    500: "#5B6EAE", // Canonical Electric Indigo Brand Primary
    600: "#485994", // Deeper Indigo
    700: "#364478",
    800: "#27335C",
    900: "#1B2A4A", // Canonical Midnight Navy Brand Hover & Depth
    950: "#10192E",
  },
  safetyOrange: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#FF6B00", // Canonical Safety Orange - Dedicated Urgent/Alert Accent
    600: "#E66000", // Hover
    700: "#CC5500", // Active / Depth
    800: "#993F00",
    900: "#7C3300",
  },
  charcoal: {
    950: "#121212", // Deepest Industrial Obsidian
    900: "#1A1A1A", // Canonical Brand Charcoal
    800: "#242424",
    700: "#2A2A2A", // Elevated Surface
    600: "#333333", // Workshop Gray
    500: "#4B4B4B",
    400: "#666666",
  },
  concrete: {
    50: "#FCFCFA",
    100: "#FAFAF8", // Signal White
    200: "#F5F4F0",
    300: "#E8E4DD", // Canonical Concrete
    400: "#D4CFC7", // Concrete Dark
    500: "#BAB4AA",
  },
  peaceFund: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981", // Operational Emerald
    600: "#059669",
    700: "#047857",
  },
  status: {
    destructive: "#EF4444",
    destructiveHover: "#DC2626",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
} as const;

export const semanticColors = {
  light: {
    // Surfaces
    background: primitiveColors.concrete[100], // #FAFAF8 Signal White
    foreground: primitiveColors.charcoal[900], // #1A1A1A
    card: "#FFFFFF",
    cardForeground: primitiveColors.charcoal[900],
    popover: "#FFFFFF",
    popoverForeground: primitiveColors.charcoal[900],
    
    // Brand CTA (Electric Indigo blue matching homepage hero and navigation)
    primary: primitiveColors.electricIndigo[500], // #5B6EAE
    primaryHover: primitiveColors.electricIndigo[900], // #1B2A4A Midnight Navy
    primaryForeground: "#FFFFFF",

    // Urgent / Alert Role (Dedicated Safety Orange)
    urgent: primitiveColors.safetyOrange[500], // #FF6B00
    urgentHover: primitiveColors.safetyOrange[600], // #E66000
    urgentForeground: "#FFFFFF",

    // Secondary & Neutral
    secondary: primitiveColors.concrete[300], // #E8E4DD
    secondaryForeground: primitiveColors.charcoal[900],
    muted: primitiveColors.concrete[200], // #F5F4F0
    mutedForeground: "#6E6E6E",

    // Interactive & Borders
    accent: primitiveColors.concrete[300],
    accentForeground: primitiveColors.charcoal[900],
    destructive: primitiveColors.status.destructive,
    destructiveForeground: "#FFFFFF",
    border: "#E2DED7",
    input: "#E2DED7",
    ring: primitiveColors.electricIndigo[500],

    // Industrial Role
    workshopDark: primitiveColors.charcoal[900], // Contrast break (Manifesto/KPIs)
    workshopDarkForeground: primitiveColors.concrete[100],
    operational: primitiveColors.peaceFund[500],
  },
  dark: {
    // Surfaces
    background: primitiveColors.charcoal[900], // #1A1A1A
    foreground: primitiveColors.concrete[100], // #FAFAF8
    card: primitiveColors.charcoal[800], // #242424
    cardForeground: primitiveColors.concrete[100],
    popover: primitiveColors.charcoal[800],
    popoverForeground: primitiveColors.concrete[100],

    // Brand CTA
    primary: primitiveColors.electricIndigo[500], // #5B6EAE
    primaryHover: primitiveColors.electricIndigo[400], // #7289DA (Periwinkle Blue for dark mode contrast)
    primaryForeground: "#FFFFFF",

    // Urgent / Alert Role (Dedicated Safety Orange)
    urgent: primitiveColors.safetyOrange[500], // #FF6B00
    urgentHover: primitiveColors.safetyOrange[600], // #E66000
    urgentForeground: "#FFFFFF",

    // Secondary & Neutral
    secondary: primitiveColors.charcoal[700], // #2A2A2A
    secondaryForeground: primitiveColors.concrete[100],
    muted: primitiveColors.charcoal[700],
    mutedForeground: "#A1A1AA",

    // Interactive & Borders
    accent: primitiveColors.charcoal[700],
    accentForeground: primitiveColors.concrete[100],
    destructive: primitiveColors.status.destructive,
    destructiveForeground: "#FFFFFF",
    border: primitiveColors.charcoal[600], // #333333
    input: primitiveColors.charcoal[600],
    ring: primitiveColors.electricIndigo[500],

    // Industrial Role
    workshopDark: primitiveColors.charcoal[950],
    workshopDarkForeground: primitiveColors.concrete[100],
    operational: primitiveColors.peaceFund[500],
  },
} as const;
