import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
// DAY_SIZE accounts for container padding (20px*2 listing + 16px*2 calendar = 72px)
// plus gaps (6 * 2px = 12px) and a small safety buffer (~6px) -> 90px total reduction
export const DAY_SIZE = (SCREEN_WIDTH - 90) / 7;

// Palette: Slate 900 base (#0F172A), Slate 800 cards (#1E293B), Orange Primary
export const darkTheme = {
  background: "#0F172A", // Main app background (Slate 900)
  foreground: "#F8FAFC", // Slate 50
  card: "#1E293B",       // Slightly lighter for cards (Slate 800)
  cardForeground: "#F8FAFC",
  popover: "#0F172A",
  popoverForeground: "#F8FAFC",
  primary: "#FF6700",    // App Primary Orange
  primaryForeground: "#FFFFFF",
  secondary: "#334155",  // Slate 700
  secondaryForeground: "#F8FAFC",
  muted: "#334155",      // Slate 700 for disabled/inactive
  mutedForeground: "#94A3B8", // Slate 400
  accent: "#1E293B",
  accentForeground: "#F8FAFC",
  destructive: "#ef4444",
  destructiveForeground: "#FFFFFF",
  border: "#334155",     // Slate 700
  input: "#1E293B",      // Slate 800
  ring: "#F8FAFC",
  success: "#22c55e",
  warning: "#f59e0b",
  info: "#3b82f6",
  surfaceHover: "#1E293B", // Slate 800
  surfaceActive: "#334155", // Slate 700
};

export const lightTheme = {
  background: "#FFFFFF",
  foreground: "#0F172A",
  card: "#FFFFFF",
  cardForeground: "#0F172A",
  popover: "#FFFFFF",
  popoverForeground: "#0F172A",
  primary: "#FF6700",
  primaryForeground: "#FFFFFF",
  secondary: "#F1F5F9",
  secondaryForeground: "#0F172A",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  accent: "#F1F5F9",
  accentForeground: "#0F172A",
  destructive: "#ef4444",
  destructiveForeground: "#FFFFFF",
  border: "#E2E8F0",
  input: "#F8FAFC",
  ring: "#0F172A",
  success: "#22c55e",
  warning: "#f59e0b",
  info: "#3b82f6",
  surfaceHover: "#F8FAFC",
  surfaceActive: "#E2E8F0",
};
