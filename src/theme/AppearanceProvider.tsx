import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Platform, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors as light, fonts } from './tokens';

export type AppearancePreference = 'system' | 'light' | 'dark';
export type Palette = { [K in keyof typeof light]: string };
export const darkColors: Palette = {
  onPrimary: '#12281D', background: '#121C17', surface: '#1B2921', ink: '#EEF4EB', muted: '#B6C4B5',
  placeholder: '#A3B29F', primary: '#86C6A4', primaryPressed: '#6AAD89', border: '#3E5143',
  subtle: '#293E30', accent: '#E0A7AF', accentSurface: '#422D34', error: '#FFADB4', errorSurface: '#45272D',
};
const KEY = 'arogio.appearance.v1';
const Context = createContext({ preference: 'system' as AppearancePreference, scheme: 'light' as 'light' | 'dark', colors: light as Palette, ready: false, saving: false, error: '', setPreference: async (_value: AppearancePreference) => {} });
export function AppearanceProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setValue] = useState<AppearancePreference>('system');
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
