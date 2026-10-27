import Svg, { Circle, Path, Rect } from "react-native-svg";
import { appTheme as t } from "../../theme/appTheme";

const paths = {
  home: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z",
  explore: "m16 8-3 5-5 3 3-5Z",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8ZM8 12h2l1-2 2 5 1-3h2",
  user: "M4 21v-3a8 8 0 0 1 16 0v3M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  calendar: "M4 5h16v16H4ZM8 2v6m8-6v6M4 11h16",
  location:
    "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  weight: "m5 4-2 17h18L19 4ZM9 4a3 3 0 0 0 6 0",
  height:
    "M9 9h6l2 7m-10 0 2-7m1 6-1 7m5-7 1 7M12 9v7M14 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  trend: "m3 17 6-6 4 3 8-10m-6 0h6v6M3 22h18",
  pill: "m8 4 12 12M5 19a6 6 0 0 1 0-8l6-6a6 6 0 0 1 8 8l-6 6a6 6 0 0 1-8 0Z",
  drop: "M12 2C9 7 4 11 4 16a8 8 0 0 0 16 0c0-5-5-9-8-14ZM8 16c0 2 1 3 3 4",
  report: "M5 2h10l4 4v16H5ZM14 2v6h5M8 12h8m-8 4h6",
  leaf: "M21 3C10 1 3 6 4 15c0 6 7 7 11 2 4-4 5-9 6-14ZM3 22 16 8",
  book: "M12 5C8 2 4 2 2 3v17c3-1 7-1 10 1 3-2 7-2 10-1V3c-2-1-6-1-10 2Zm0 0v16",
  goal: "M20 11a9 9 0 1 1-7-8m4 1 3-2v5l3 1-4 3-3-1-4 4m4-2a5 5 0 1 1-4-3",
  bell: "M5 17h14l-2-3V8a5 5 0 0 0-10 0v6ZM10 21h4M12 1v2",
  settings:
    "m9 2-1 3-3 1-3 3 2 3-1 3 3 3h3l3 4 3-2 1-3 3-1 1-4-2-3V7l-3-2-3 1ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  camera: "M3 7h5l2-3h4l2 3h5v14H3ZM16 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  back: "m15 3-9 9 9 9",
  right: "m9 4 8 8-8 8",
  down: "m5 9 7 7 7-7",
  check: "m4 12 5 5L20 6",
} as const;
export type AppIconName = keyof typeof paths;
export function AppIcon({
  name,
  color = t.teal,
  size = 24,
  filled = false,
}: {
  name: AppIconName;
  color?: string;
  size?: number;
  filled?: boolean;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {name === "explore" && (
        <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.7} />
      )}
      <Path
        d={paths[name]}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled && (name === "home" || name === "user") ? color : "none"}
      />
      {name === "report" && (
        <Rect x={8} y={8} width={2} height={1} fill={color} />
      )}
    </Svg>
  );
}
