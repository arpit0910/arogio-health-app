import { createContext, useContext, type PropsWithChildren } from 'react';
import { colors, fonts } from './tokens';

export type AppearancePreference = 'light';
export type Palette = { [K in keyof typeof colors]: string };
const appearance = { preference: 'light' as const, scheme: 'light' as const, colors: colors as Palette, ready: true, saving: false, error: '', setPreference: async (_value: AppearancePreference) => {} };
const Context = createContext(appearance);
/** Fixed light appearance. Stored dark/system preferences are deliberately ignored. */
export function AppearanceProvider({ children }: PropsWithChildren) {
  return <Context value={appearance}>{children}</Context>;
}
export const useAppearance = () => useContext(Context);
export const usePalette = () => useAppearance().colors;
export function useAppTheme() {
  const c = usePalette();
  return { onPrimary: c.onPrimary, ink: c.ink, muted: c.muted, teal: c.primary, border: c.border, background: c.background, mint: c.subtle, white: c.surface, accent: c.accent, fonts, shadow: {} };
}
