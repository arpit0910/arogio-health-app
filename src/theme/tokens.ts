import type { TextStyle } from 'react-native';

export const colors = {
  onPrimary: '#FFFFFF',
  background: '#F7FAF7',
  surface: '#FFFFFF',
  ink: '#0A1F1B',
  muted: '#5C716A',
  placeholder: '#64776F',
  primary: '#087D65',
  primaryPressed: '#054F40',
  border: '#DCE7E2',
  subtle: '#EEF5F2',
  accent: '#7B3D45',
  accentSurface: '#EEE1E1',
  error: '#C93C3C',
  onError: '#FFFFFF',
  errorSurface: '#FCE4E2',
  secondary: '#006973',
  secondarySurface: '#D0F7FB',
  mintSurface: '#DCF3EC',
  roseSurface: '#FFDAD6',
  brandSurface: '#087D65',
  onBrand: '#FFFFFF',
  brandSoft: '#BDF3E2',
} as const;

export const fonts = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  heading: 'PlusJakartaSans_600SemiBold',
  body: 'DMSans_400Regular',
} as const;

export const layout = { maxFormWidth: 440, horizontal: 24, fieldRadius: 12 } as const;

/** Geometry shared by Home, directories, account forms and daily trackers. */
export const ui = {
  radius: { field: 16, card: 20, tile: 18, pill: 28 },
  space: { inset: 16, card: 16, section: 28, row: 12 },
  control: 52,
  content: 440,
} as const;

/** Shared native type roles. Explicit line heights keep labels aligned across screens. */
export const typeStyles = {
  heading: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 30, letterSpacing: -0.4, includeFontPadding: false },
  title: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 26, includeFontPadding: false },
  rowTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, includeFontPadding: false },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, includeFontPadding: false },
  detail: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, includeFontPadding: false },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 18, includeFontPadding: false },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24, includeFontPadding: false, textAlignVertical: 'center' },
  input: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, includeFontPadding: false, textAlignVertical: 'center' },
} satisfies Record<string, TextStyle>;
