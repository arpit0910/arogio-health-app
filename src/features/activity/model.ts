import type { HealthSnapshot } from '../health-sync/model.ts';
export const activityMetrics = [
  { key: 'Steps', title: 'Steps', unit: 'steps', max: 200000, whole: true },
  { key: 'ActiveCaloriesBurned', title: 'Active calories', unit: 'kcal', max: 20000, whole: false },
  { key: 'Nutrition', title: 'Food calories', unit: 'kcal', max: 20000, whole: false },
  { key: 'Distance', title: 'Distance', unit: 'km', max: 500, whole: false },
  { key: 'ExerciseSession', title: 'Exercise', unit: 'min', max: 1440, whole: false },
  { key: 'SleepSession', title: 'Sleep', unit: 'hours', max: 24, whole: false },
] as const;
export type ActivityMetric = (typeof activityMetrics)[number]['key'];
export type ActivityTracking = { goals: Partial<Record<ActivityMetric, number>>; days: { day: string; values: Partial<Record<ActivityMetric, number>> }[] };
export const emptyActivity = (): ActivityTracking => ({ goals: {}, days: [] });
export function activityReading(metric: ActivityMetric, day: string, mode: 'manual' | 'connected', tracking: ActivityTracking, snapshot: HealthSnapshot | null, phone: { enabled: boolean; totals: Record<string, number> }) {
  if (mode === 'connected') {
    const value = snapshot?.granted.includes(metric) ? snapshot.days.find((entry) => entry.day === day)?.readings[metric]?.value ?? null : null;
    return { value, source: 'Connected app' };
  }
  if (metric === 'Steps' && phone.enabled) return { value: phone.totals[day] ?? null, source: 'Phone - while Arogio is open' };
  return { value: tracking.days.find((entry) => entry.day === day)?.values[metric] ?? null, source: 'Your entered total' };
}
export function parseActivityValue(metric: ActivityMetric, text: string, goal = false) {
  if (!text.trim()) return null;
  const info = activityMetrics.find((item) => item.key === metric)!;
  if (!/^\d+(\.\d{1,2})?$/.test(text.trim())) throw new Error(`Enter a valid number for ${info.title.toLowerCase()}.`);
  const value = Number(text);
  if (!Number.isFinite(value) || value < (goal ? 1 / 100 : 0) || value > info.max || (info.whole && !Number.isInteger(value))) throw new Error(`Enter ${info.title.toLowerCase()} ${goal ? 'above zero and' : ''} up to ${info.max} ${info.unit}${info.whole ? ' in whole numbers' : ''}.`);
  return value;
}
export function stepDelta(previous: number, current: number) {
  if (!Number.isFinite(current) || current < 0 || !Number.isInteger(current)) return { previous, delta: 0 };
  return { previous: current, delta: current >= previous ? current - previous : 0 };
}
