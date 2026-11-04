/**
 * BlockHyre Strict 5-Tier Semantic Corner Radii Scale
 * Balances hard industrial machinery lines with the signature 40px Boutique corner
 */

export const radii = {
  none: "0px",         // 0px - Hard machinery edges, raw industrial containers
  subtle: "6px",       // 6px - Inputs, badges, small tags, telemetry brackets
  default: "10px",     // 10px - Standard buttons, interactive dropdowns, notifications
  interactive: "10px", // 10px - Interactive controls, icon boxes, action buttons
  card: "16px",        // 16px - Standard cards, modal panels, dialog sheets
  boutique: "2.5rem",  // 40px - Signature boutique radius for hero & primary tool cards
  full: "9999px",      // 9999px - Circular pills, avatars, operational status dots
} as const;

export const radiiNumeric = {
  none: 0,
  subtle: 6,
  default: 10,
  interactive: 10,
  card: 16,
  boutique: 40,
  full: 9999,
} as const;
