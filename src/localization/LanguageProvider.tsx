import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createTranslator, validLanguage, type Language } from './model';
const KEY = 'arogio.language.v1';
const Context = createContext({ language: 'en' as Language, locale: 'en-IN', ready: false, saving: false, error: '', setLanguage: async (_language: Language) => {}, t: createTranslator('en') });
export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setValue] = useState<Language>('en'), [ready, setReady] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const saved = Platform.OS === 'web' ? typeof window === 'undefined' ? null : window.localStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
        if (alive && validLanguage(saved)) setValue(saved);
      } catch { if (alive) setError('Language could not be restored. Choose a language to try again.'); }
      finally { if (alive) setReady(true); }
    })();
    return () => { alive = false; };
  }, []);
  async function setLanguage(value: Language) {
    if (!ready || lock.current || !validLanguage(value)) return;
    lock.current = true; setSaving(true); setError('');
    try {
      if (Platform.OS === 'web') window.localStorage.setItem(KEY, value);
      else await SecureStore.setItemAsync(KEY, value);
      setValue(value);
    } catch { setError('Language could not be saved. Please try again.'); }
    finally { lock.current = false; setSaving(false); }
  }
  const t = useMemo(() => createTranslator(language), [language]);
  return <Context.Provider value={{ language, locale: language === 'hi' ? 'hi-IN' : 'en-IN', ready, saving, error, setLanguage, t }}>{children}</Context.Provider>;
}
export const useLanguage = () => useContext(Context);
export const useTranslation = useLanguage;
