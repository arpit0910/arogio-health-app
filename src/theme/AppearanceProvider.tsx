import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Platform, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors as light, fonts } from './tokens';

export type AppearancePreference = 'system' | 'light' | 'dark';
export type Palette = { [K in keyof typeof light]: string };
export const darkColors: Palette = {
  onPrimary: '#003728', background: '#00291E', surface: '#0C3B30', ink: '#F4FAF5', muted: '#B8D0C4',
  placeholder: '#A4C0B1', primary: '#79E6BB', primaryPressed: '#5BCBA0', border: '#2A5546',
  subtle: '#164C3B', accent: '#BDB3F7', accentSurface: '#303D59', error: '#FFAFBB', errorSurface: '#502C35',
};
const KEY = 'arogio.appearance.v1';
const Context = createContext({ preference: 'dark' as AppearancePreference, scheme: 'dark' as 'light' | 'dark', colors: darkColors as Palette, ready: false, saving: false, error: '', setPreference: async (_value: AppearancePreference) => {} });
export function AppearanceProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setValue] = useState<AppearancePreference>('dark');
  const [ready, setReady] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const saved = Platform.OS === 'web' ? (typeof window === 'undefined' ? null : window.localStorage.getItem(KEY)) : await SecureStore.getItemAsync(KEY);
        if (alive && (saved === 'system' || saved === 'light' || saved === 'dark')) setValue(saved);
      } catch { if (alive) setError('Appearance could not be restored. Choose a mode to try again.'); }
      finally { if (alive) setReady(true); }
    })();
    return () => { alive = false; };
  }, []);
  async function setPreference(value: AppearancePreference) {
    if (!ready || lock.current) return;
    lock.current = true; setSaving(true); setError('');
    try {
      if (Platform.OS === 'web') window.localStorage.setItem(KEY, value);
      else await SecureStore.setItemAsync(KEY, value);
      setValue(value);
    } catch { setError('Appearance could not be saved. Please try again.'); }
    finally { lock.current = false; setSaving(false); }
  }
  const scheme = preference === 'system' ? system === 'dark' ? 'dark' : 'light' : preference;
  return <Context.Provider value={{ preference, scheme, colors: scheme === 'dark' ? darkColors : light, ready, saving, error, setPreference }}>{children}</Context.Provider>;
}
export const useAppearance = () => useContext(Context);
export const usePalette = () => useAppearance().colors;
export function useAppTheme() {
  const colors = usePalette();
  return { onPrimary: colors.onPrimary, ink: colors.ink, muted: colors.muted, teal: colors.primary, border: colors.border, background: colors.background, mint: colors.subtle, white: colors.surface, accent: colors.accent, fonts, shadow: {} };
}
