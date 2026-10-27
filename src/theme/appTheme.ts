import { fonts } from "./tokens";

// Colors and typography from the supplied Home/Profile reference.
export const appTheme = {
  ink: "#090D31",
  muted: "#59648C",
  teal: "#008C85",
  border: "#E7EBF1",
  background: "#FAFDFC",
  mint: "#EAF8F4",
  white: "#FFFFFF",
  fonts,
  shadow: { boxShadow: "0px 4px 16px rgba(18, 84, 76, 0.06)" },
} as const;
