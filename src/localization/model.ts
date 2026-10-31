import { hindi } from './hindi.ts';
export type Language = 'en' | 'hi';
export const validLanguage = (value: unknown): value is Language => value === 'en' || value === 'hi';
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function createTranslator(language: Language) {
  const patterns = Object.entries(hindi).filter(([key]) => /\{\d+\}/.test(key)).map(([key, translated]) => ({
    expression: new RegExp('^' + key.split(/\{\d+\}/).map(escape).join('([\\s\\S]*?)') + '$'), translated,
  }));
  return function t<T>(value: T): T {
    if (language === 'en' || typeof value !== 'string') return value;
    const exact = hindi[value];
    if (exact) return exact as T;
    const trimmed = value.trim(), normalized = hindi[trimmed];
    if (normalized) return value.replace(trimmed, normalized) as T;
    for (const pattern of patterns) {
      const match = value.match(pattern.expression);
      if (match) return pattern.translated.replace(/\{(\d+)\}/g, (_, index: string) => match[Number(index) + 1] ?? '') as T;
    }
    return value;
  };
}
