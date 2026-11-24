import { useAppTheme } from '../../theme/AppearanceProvider';
import { Platform, View } from 'react-native';
import Svg, { Circle, Path, Rect } from "react-native-svg";


const paths = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  bookmark: "M6 3h12v19l-6-4-6 4Z",
  filter: "M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6",
  grid: "M3 3h3v3H3ZM10.5 3h3v3h-3ZM18 3h3v3h-3ZM3 10.5h3v3H3ZM10.5 10.5h3v3h-3ZM18 10.5h3v3h-3ZM3 18h3v3H3ZM10.5 18h3v3h-3ZM18 18h3v3h-3Z",
  emergency: 'm10 2 4 0v6l5.2-3 2 3.5-5.2 3 5.2 3-2 3.5-5.2-3v6h-4v-6l-5.2 3-2-3.5 5.2-3-5.2-3 2-3.5 5.2 3Z',
  medicalCase: 'M9 2h6v3H9ZM5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2ZM11 10v3H8v2h3v3h2v-3h3v-2h-3v-3Z',
  blood: 'M12 2C9 6 4 11 4 16a8 8 0 0 0 16 0c0-5-5-10-8-14ZM11 10h2v3h3v2h-3v3h-2v-3H8v-2h3Z',
  hospital: 'M4 3h16v18H4ZM10 6v3H7v4h3v3h4v-3h3V9h-3V6Z',
  stethoscope: 'M5 3v5a5 5 0 0 0 10 0V3M3 3h4m6 0h4M10 13v4a4 4 0 0 0 8 0v-2m3-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  robot: 'M5 7h14v13H5ZM12 3v4M10 3h4M2 11v5m20-5v5M8 12h1m6 0h1M9 16h6',
  sparkles: 'm12 2 2.6 6.4L21 11l-6.4 2.6L12 20l-2.6-6.4L3 11l6.4-2.6ZM20 2l.8 2.2L23 5l-2.2.8L20 8l-.8-2.2L17 5l2.2-.8ZM4 17l.8 2.2L7 20l-2.2.8L4 23l-.8-2.2L1 20l2.2-.8Z',
  chat: 'M3 3h18v13H9l-6 5ZM7 7h10M7 11h7',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  ambulance: 'M3 17H2V6h12v11H8m6 0h2m5 0h1v-5l-4-4h-4M18 8v5h4M6 8v5m-2-2h4M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z',
  directions: 'm12 2 10 10-10 10L2 12ZM8 15v-4h8m-3-3 3 3-3 3',
  bloodBank: 'M4 21V5h16v16M2 21h20M9 21v-5h6v5M12 7v6m-3-3h6',

  female: 'M16 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM11 13v9M7 18h8',
  male: 'M14 14a5 5 0 1 1-7-7 5 5 0 0 1 7 7ZM14 7l7-6m-6 0h6v6',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  up: 'm5 15 7-7 7 7',
  send: 'm22 2-7 20-4-9-9-4Zm0 0L11 13',
  food: 'M5 3v7m3-7v7M2 3v7c0 3 6 3 6 0M5 13v9M17 3c-4 5-4 10 0 10h3M20 3v19',
  fitness: 'M6 5v14M3 8v8M18 5v14M21 8v8M6 12h12',
  walk: 'M15 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 13l2-4 4-1 3 5h4M13 8l-2 7 5 3v4M11 15l-3 7',
  cloud: 'M6 19a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 0 10Z',
  users: 'M3 21v-3a6 6 0 0 1 12 0v3M13 4a4 4 0 0 1 0 8M18 14a5 5 0 0 1 3 4v3M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  share: 'M12 16V2m-5 5 5-5 5 5M5 12H3v10h18V12h-2',

  sun: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
  moon: 'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z',
  device: 'M6 2h12v20H6ZM10 18h4',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6ZM8 12l3 3 5-6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M18 6 6 18',
  logout: 'M9 4H4v16h5M10 12h11m-4-4 4 4-4 4',
  pencil: 'm15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z',
  sync: 'M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5',
  glass: 'M5 3h14l-2 18H7ZM6 10h12',
  bottle: 'M9 2h6v5l3 3v11H6V10l3-3ZM9 5h6M6 13h12',
  smile: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM7 14c2 4 8 4 10 0M8 8h.01M16 8h.01',
  calm: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM7 9h3m4 0h3m-8 6h6',
  low: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM7 17c2-4 8-4 10 0M8 8h.01M16 8h.01',
  bolt: 'M13 2 4 14h7l-1 8 10-13h-7Z',
  clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2',
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
  color,
  size = 24,
  filled = false,
}: {
  name: AppIconName;
  color?: string;
  size?: number;
  filled?: boolean;
}) {
  const t = useAppTheme();
  color ??= t.teal;

  // Keep the shared navigation control in simple native geometry.
  if (name === 'menu') return <View {...(Platform.OS === 'web' ? { 'aria-hidden': true } : { accessibilityElementsHidden: true, importantForAccessibility: 'no' })} style={{width: size, height: size}}>{[6, 12, 18].map(y => <View key={y} style={{position: 'absolute', left: size / 6, top: (y - 0.85) * size / 24, width: size * 2 / 3, height: size * 1.7 / 24, borderRadius: size / 24, backgroundColor: color}} />)}</View>;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...(Platform.OS === 'web' ? { 'aria-hidden': true } : { accessibilityElementsHidden: true, importantForAccessibility: 'no' })}
    >
      {name === "explore" && (
        <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.7} fill={filled ? color : "none"} />
      )}
      <Path
        d={paths[name]}
        stroke={name === "explore" && filled ? t.white : color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        fillRule="evenodd"
        fill={name === 'emergency' || name === 'medicalCase' || name === 'blood' ? color : name === "explore" && filled ? t.white : filled && (name === "home" || name === "user" || name === "heart" || name === "bookmark") ? color : "none"}
      />
      {name === "heart" && filled && <Path d="M7 12h3l1-2 2 5 1-3h3" stroke={t.white} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />}
      {name === "report" && (
        <Rect x={8} y={8} width={2} height={1} fill={color} />
      )}
    </Svg>
  );
}
