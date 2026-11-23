import { validDay, type WellnessData } from './domain.ts';
import { APP_TIMEZONE } from '../../shared/date-time.ts';
import { z } from 'zod';

const doseRecords = z.array(z.object({
  medicineId: z.string().min(1), day: z.string().refine(validDay),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  status: z.enum(['taken', 'skipped', 'pending']),
  recordedAt: z.string().datetime(), snoozedUntil: z.string().datetime().nullable(),
}));

export function normalizeWellness(value: unknown): WellnessData {
  if (!value || typeof value !== 'object') throw new Error('Tracking response is unavailable. Try again.');
  const data = value as WellnessData;
  if (![data.waterLogs, data.waterTasks, data.periods, data.cycleEntries].every(Array.isArray)) {
    throw new Error('The server did not return your tracking records. Please try again.');
  }
  if (data.medicineDoses !== undefined && !doseRecords.safeParse(data.medicineDoses).success)
    throw new Error('The server did not return valid medicine dose records. Please try again.');
  return { ...data, waterPlan: data.waterPlan ? { ...data.waterPlan, timezone: APP_TIMEZONE } : null, cycleSettings: data.cycleSettings ? { ...data.cycleSettings, timezone: APP_TIMEZONE } : null };
}
export function confirmMedicineDose(data: WellnessData, path: string, body: unknown) {
  const match = /^medicines\/([^/]+)\/doses\/([^/]+)\/([^/]+)$/.exec(path);
  if (!match) return;
  const change = body as { status?: string; snooze?: boolean } | undefined;
  const record = data.medicineDoses?.find(dose => dose.medicineId === match[1] && dose.day === match[2] && dose.time === match[3]);
  if (!record || record.status !== change?.status || (change.snooze ? !record.snoozedUntil : record.snoozedUntil !== null))
    throw new Error('The server did not confirm your dose change. Refresh your schedule before trying again.');
}
export function confirmActivityGoals(data: WellnessData, body: unknown) {
  const goals = (body as { goals?: Record<string, number | null> } | undefined)?.goals;
  const stored = data.activityTracking?.goals as Record<string, number> | undefined;
  if (!goals || !stored || Object.entries(goals).some(([key, value]) => value == null ? stored[key] != null : stored[key] !== value)) {
    throw new Error('The server did not confirm your targets. Your changes are still here; try saving again.');
  }
}
