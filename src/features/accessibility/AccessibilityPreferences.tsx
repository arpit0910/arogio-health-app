import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

const key = 'arogio.accessibility.v1';
type Preferences = { large: boolean };
const Context = createContext({ large: false, ready: false, error: '', set: async (_patch: Partial<Preferences>) => {} });
export const useAccessibilityPreferences = () => useContext(Context);
export function AccessibilityPreferencesProvider({ children }: PropsWithChildren) {
  const [value, setValue] = useState<Preferences>({ large: false }), [ready, setReady] = useState(false), [error, setError] = useState('');
  const current = useRef(value), queue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = Platform.OS === 'web' ? window.localStorage.getItem(key) : await (await import('expo-secure-store')).getItemAsync(key);
        const saved = raw ? JSON.parse(raw) : {};
        if (active) { current.current = { large: saved.large === true }; setValue(current.current); }
      } catch { if (active) setError('Accessibility preferences could not be restored.'); }
      finally { if (active) setReady(true); }
    })();
    return () => { active = false; };
  }, []);
  function set(patch: Partial<Preferences>) {
    const operation = queue.current.then(async () => {
      try {
        const next = { ...current.current, ...patch }, raw = JSON.stringify(next);
        if (Platform.OS === 'web') window.localStorage.setItem(key, raw);
        else await (await import('expo-secure-store')).setItemAsync(key, raw);
        current.current = next; setValue(next); setError('');
      } catch { setError('Preferences could not be saved. Try again.'); }
    });
    queue.current = operation;
    return operation;
  }
  return <Context.Provider value={{ ...value, ready, error, set }}>{children}</Context.Provider>;
}
