import { healthMetrics, type HealthMetric } from './model.ts';

export type HealthApp = { id: string; name: string };
export type HealthPreference = {
  enabled: boolean;
  selected: HealthMetric[];
  background: boolean;
  source: HealthApp | null;
  hasConnected: boolean;
};
export const allHealthMetrics = healthMetrics.map((item) => item.key);
export function isHealthApp(value: unknown): value is HealthApp {
  if (!value || typeof value !== 'object') return false;
  const app = value as HealthApp;
  return typeof app.id === 'string' && /^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(app.id) && typeof app.name === 'string' && !!app.name.trim();
}
export function restoreHealthPreference(stored: string | null): HealthPreference {
  const empty: HealthPreference = { enabled: false, selected: allHealthMetrics, background: false, source: null, hasConnected: false };
  if (!stored) return empty;
  const parsed = JSON.parse(stored) as Partial<HealthPreference>;
  if (typeof parsed.enabled !== 'boolean' || !Array.isArray(parsed.selected)) throw new Error('Invalid health preference');
  const source = isHealthApp(parsed.source) ? parsed.source : null;
  return { enabled: parsed.enabled && !!source, selected: parsed.selected.filter((m) => allHealthMetrics.includes(m)),
    background: parsed.background === true && !!source, source,
    // Legacy connections require source selection, but never repeat the Home prompt.
    hasConnected: (typeof parsed.hasConnected === 'boolean' ? parsed.hasConnected : true) || !!source };
}
export function showHealthConnectionPrompt(ready: boolean, hasConnected: boolean) {
  return ready && !hasConnected;
}
