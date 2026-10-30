import type { WellnessData } from './domain.ts';
import { APP_TIMEZONE } from '../../lib/time.ts';

export function normalizeWellness(value: unknown): WellnessData {
  if (!value || typeof value !== 'object') throw new Error('Tracking response is unavailable. Try again.');
  const data = value as WellnessData;
  if (![data.waterLogs, data.waterTasks, data.periods, data.cycleEntries].every(Array.isArray)) {
    throw new Error('The server did not return your tracking records. Please try again.');
  }
  return { ...data, waterPlan: data.waterPlan ? { ...data.waterPlan, timezone: APP_TIMEZONE } : null, cycleSettings: data.cycleSettings ? { ...data.cycleSettings, timezone: APP_TIMEZONE } : null };
}
export function confirmActivityGoals(data: WellnessData, body: unknown) {
  const goals = (body as { goals?: Record<string, number | null> } | undefined)?.goals;
  const stored = data.activityTracking?.goals as Record<string, number> | undefined;
  if (!goals || !stored || Object.entries(goals).some(([key, value]) => value == null ? stored[key] != null : stored[key] !== value)) {
    throw new Error('The server did not confirm your targets. Your changes are still here; try saving again.');
  }
}
