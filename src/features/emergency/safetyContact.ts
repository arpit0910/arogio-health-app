import { Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../authentication/context/AuthContext';
export type SafetyContact = { name: string; phone: string };
export function useSafetyContact() {
  const { user } = useAuth(), client = useQueryClient(), key = `arogio.sos.${user?.id ?? 'guest'}.v1`, queryKey = ['safety-contact', key];
  const query = useQuery({ queryKey, enabled: !!user, staleTime: Infinity, queryFn: async (): Promise<SafetyContact | null> => {
    const raw = Platform.OS === 'web' ? window.localStorage.getItem(key) : await (await import('expo-secure-store')).getItemAsync(key);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (typeof value.name !== 'string' || !/^\+?\d{6,15}$/.test(value.phone)) throw new Error('Contact could not be read.');
    return value;
  } });
  async function save(contact: SafetyContact | null) {
    if (!user) throw new Error('Sign in to save a contact.');
    const raw = JSON.stringify(contact);
    if (Platform.OS === 'web') { if (contact) window.localStorage.setItem(key, raw); else window.localStorage.removeItem(key); }
    else { const storage = await import('expo-secure-store'); if (contact) await storage.setItemAsync(key, raw); else await storage.deleteItemAsync(key); }
    client.setQueryData(queryKey, contact);
  }
  return { ...query, save };
}
