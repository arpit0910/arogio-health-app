import { colors, fonts } from "./tokens";

// Colors and typography from the supplied Home/Profile reference.
export const appTheme = {
  ink: colors.ink,
  muted: colors.muted,
  teal: colors.primary,
  border: colors.border,
  background: colors.background,
  mint: colors.subtle,
  white: colors.surface,
  accent: colors.accent,
  fonts,
  shadow: {},
} as const;
