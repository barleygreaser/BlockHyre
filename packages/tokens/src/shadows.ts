/**
 * BlockHyre Shadows & Visual Textures
 * Physical machine depth, mechanical clicks, and operational glowing indicators
 */

export const shadows = {
  // Mechanical press shadows (physical button depth)
  mechanical: "0 4px 0 0 #333333",
  mechanicalHover: "0 6px 0 0 #1A1A1A",
  mechanicalActive: "0 1px 0 0 #1A1A1A",
  mechanicalOrange: "0 4px 0 0 #CC5500",
  mechanicalOrangeHover: "0 6px 0 0 #993F00",

  // Telemetry & Operational glows
  telemetryGlow: "0 0 15px rgba(255, 107, 0, 0.35)",
  operationalGlow: "0 0 12px rgba(16, 185, 129, 0.45)",
  cardElevation: "0 10px 30px rgba(0, 0, 0, 0.06)",
  cardElevationHover: "0 20px 60px rgba(0, 0, 0, 0.12)",
} as const;
