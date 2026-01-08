import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
// DAY_SIZE accounts for container padding (20px*2 listing + 16px*2 calendar = 72px)
// plus gaps (6 * 2px = 12px) and a small safety buffer (~6px) -> 90px total reduction
export const DAY_SIZE = (SCREEN_WIDTH - 90) / 7;

export const darkTheme = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  card: "#0f0f0f",
  cardForeground: "#fafafa",
  popover: "#0a0a0a",
  popoverForeground: "#fafafa",
  primary: "#FF6700",
  primaryForeground: "#FFFFFF",
  secondary: "#1a1a1a",
  secondaryForeground: "#fafafa",
  muted: "#1a1a1a",
  mutedForeground: "#737373",
  accent: "#1a1a1a",
  accentForeground: "#fafafa",
  destructive: "#ef4444",
  destructiveForeground: "#fafafa",
  border: "#262626",
  input: "#262626",
  ring: "#fafafa",
  success: "#22c55e",
  warning: "#f59e0b",
  info: "#3b82f6",
  surfaceHover: "#171717",
  surfaceActive: "#404040",
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
