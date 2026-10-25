import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'arogio.session.v1';
export type SessionTokens = { accessToken: string; refreshToken: string };

const memoryStore = new Map<string, string>();

async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fall through to memory store
    }
    return memoryStore.get(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fall through to memory store
    }
    memoryStore.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteStorageItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Fall through to memory store
    }
    memoryStore.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStore = {
  async get(): Promise<SessionTokens | null> {
    const value = await getStorageItem(SESSION_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as SessionTokens;
    } catch {
      await deleteStorageItem(SESSION_KEY);
      return null;
    }
  },
  async save(tokens: SessionTokens): Promise<void> {
    await setStorageItem(SESSION_KEY, JSON.stringify(tokens));
  },
  async clear(): Promise<void> {
    await deleteStorageItem(SESSION_KEY);
  },
};
