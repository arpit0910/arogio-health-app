export const colors = {
  onPrimary: '#FFFFFF',
  background: '#FFFDFA',
  surface: '#FFFDFA',
  ink: '#203E32',
  muted: '#586357',
  placeholder: '#687064',
  primary: '#214F3D',
  primaryPressed: '#173D2D',
  border: '#D8DCCF',
  subtle: '#E7EDDF',
  accent: '#7B3D45',
  accentSurface: '#EEE1E1',
  error: '#A42A36',
  errorSurface: '#F8E9E8',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  heading: 'PlusJakartaSans_600SemiBold',
  body: 'DMSans_400Regular',
} as const;

export const layout = { maxFormWidth: 440, horizontal: 24, fieldRadius: 12 } as const;
