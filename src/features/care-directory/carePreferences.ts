import { Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../authentication/context/AuthContext';
import type { CareKind } from './api';

type Preferences = { saved: { id: string; kind: CareKind }[]; recent: string[] };
const empty = (): Preferences => ({ saved: [], recent: [] });
let queue = Promise.resolve();
async function read(key: string): Promise<Preferences> {
  const raw = Platform.OS === 'web' ? window.localStorage.getItem(key) : await (await import('expo-secure-store')).getItemAsync(key);
  if (!raw) return empty();
  const value = JSON.parse(raw) as Preferences;
  if (!Array.isArray(value.saved) || !Array.isArray(value.recent)) throw new Error('Saved care could not be read.');
  return value;
}
export function useCarePreferences() {
  const { user } = useAuth(), client = useQueryClient();
  const key = `arogio.care.${user?.id ?? 'guest'}.v1`, queryKey = ['care-preferences', key];
  const query = useQuery({ queryKey, queryFn: () => read(key), staleTime: Infinity });
  function update(change: (value: Preferences) => Preferences) {
    const operation = queue.then(async () => {
      const next = change(await read(key));
      const raw = JSON.stringify(next);
      if (Platform.OS === 'web') window.localStorage.setItem(key, raw);
      else await (await import('expo-secure-store')).setItemAsync(key, raw);
      client.setQueryData(queryKey, next);
    });
    queue = operation.catch(() => {});
    return operation;
  }
  return { ...query, data: query.data ?? empty(),
    toggle: (id: string, kind: CareKind) => update(v => {
      const found = v.saved.some(item => item.id === id && item.kind === kind);
      if (!found && v.saved.length >= 20) throw new Error('Your saved care list is full. Remove a provider first.');
      return { ...v, saved: found ? v.saved.filter(item => item.id !== id || item.kind !== kind) : [...v.saved, { id, kind }] };
    }),
    remember: (term: string) => update(v => ({ ...v, recent: [term.trim().slice(0, 100), ...v.recent.filter(x => x !== term.trim())].filter(Boolean).slice(0, 6) })),
    clearRecent: () => update(v => ({ ...v, recent: [] })),
  };
}
