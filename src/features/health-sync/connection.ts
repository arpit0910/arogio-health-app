import { healthMetrics, type HealthMetric } from './model.ts';

export type HealthApp = { id: string; name: string; icon?: string; supportsHealthConnect?: boolean; metrics?: HealthMetric[] };
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
  return typeof app.id === 'string' && /^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(app.id) && typeof app.name === 'string' && !!app.name.trim()
    && (app.icon == null || typeof app.icon === 'string')
    && (app.supportsHealthConnect == null || typeof app.supportsHealthConnect === 'boolean')
    && (app.metrics == null || (Array.isArray(app.metrics) && app.metrics.every(metric => allHealthMetrics.includes(metric))));
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


export function connectableHealthApps(apps: HealthApp[]): HealthApp[] {
  return apps.filter(app => isHealthApp(app) && app.supportsHealthConnect === true && (!app.metrics || app.metrics.some(metric => allHealthMetrics.includes(metric))));
}
export function appHealthMetrics(app: HealthApp): HealthMetric[] {
  return app.metrics ? allHealthMetrics.filter(metric => app.metrics!.includes(metric)) : allHealthMetrics;
}
export function sourceSharingInstructions(id: string, name: string): string {
  if (id === 'com.pebble.ring.app') return 'Sync your Pebble device in Pebble Halo, then enable Health Connect sharing in Pebble Halo. If it shares through another app, select that writing app in Arogio.';
  if (id === 'com.sec.android.app.shealth') return 'In Samsung Health, open Settings > Health Connect > App permissions > Samsung Health and allow writing the data you want to share. Sync your wearable in Samsung Health, then return to Arogio.';
  return `Open ${name}, enable its Health Connect data sharing, then return here. Your wearable may need to sync with that app first.`;
}
