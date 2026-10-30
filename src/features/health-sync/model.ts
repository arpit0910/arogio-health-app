import { addDays, localDay, zonedInstant } from '../wellness/domain.ts';
import { APP_TIMEZONE } from '../../lib/time.ts';

export const healthMetrics = [
  { key: 'Steps', title: 'Steps', permission: 'READ_STEPS', unit: 'steps' },
  {
    key: 'SleepSession',
    title: 'Sleep',
    permission: 'READ_SLEEP',
    unit: 'hours',
  },
  {
    key: 'HeartRate',
    title: 'Heart rate',
    permission: 'READ_HEART_RATE',
    unit: 'bpm',
  },
  { key: 'Weight', title: 'Weight', permission: 'READ_WEIGHT', unit: 'kg' },
  { key: 'Nutrition', title: 'Food calories', permission: 'READ_NUTRITION', unit: 'kcal' },
  { key: 'Distance', title: 'Distance', permission: 'READ_DISTANCE', unit: 'km' },
  { key: 'ActiveCaloriesBurned', title: 'Active energy', permission: 'READ_ACTIVE_CALORIES_BURNED', unit: 'kcal' },
  { key: 'TotalCaloriesBurned', title: 'Total energy', permission: 'READ_TOTAL_CALORIES_BURNED', unit: 'kcal' },
  { key: 'ExerciseSession', title: 'Exercise', permission: 'READ_EXERCISE', unit: 'min' },
  { key: 'FloorsClimbed', title: 'Floors climbed', permission: 'READ_FLOORS_CLIMBED', unit: 'floors' },
  { key: 'RestingHeartRate', title: 'Resting heart rate', permission: 'READ_RESTING_HEART_RATE', unit: 'bpm' },
  { key: 'Hydration', title: 'Water intake', permission: 'READ_HYDRATION', unit: 'L' },
] as const;
export type HealthMetric = (typeof healthMetrics)[number]['key'];
export type HealthAvailability =
  'available' | 'update-required' | 'unsupported' | 'rebuild-required';
export type Reading = { value: number | null; sources: string[] };
export type DailyHealth = {
  day: string;
  readings: Partial<Record<HealthMetric, Reading>>;
};
export type HealthSnapshot = {
  syncedAt: string;
  source?: string;
  granted: HealthMetric[];
  days: DailyHealth[];
  latestWeight: { kg: number; at: string; source: string } | null;
  failed: HealthMetric[];
};
export type HealthReader = {
  granted: () => Promise<HealthMetric[]>;
  aggregate: (
    metric: HealthMetric,
    start: string,
    end: string,
  ) => Promise<Reading>;
  latestWeight: (
    start: string,
    end: string,
  ) => Promise<HealthSnapshot['latestWeight']>;
};
export function healthDayRanges(now = new Date()) {
  const today = localDay(now, APP_TIMEZONE);
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - 6);
    return {
      day,
      start: zonedInstant(day, '00:00', APP_TIMEZONE).toISOString(),
      end:
        i === 6
          ? now.toISOString()
          : zonedInstant(addDays(day, 1), '00:00', APP_TIMEZONE).toISOString(),
    };
  });
}
/** Re-read permission state for every sync; never combine raw cumulative records. */
export async function readHealthSnapshot(
  reader: HealthReader,
  selected: HealthMetric[],
  now = new Date(),
  source?: string,
): Promise<HealthSnapshot> {
  const granted = (await reader.granted()).filter((metric) =>
    selected.includes(metric),
  );
  const failed = new Set<HealthMetric>();
  const days: DailyHealth[] = [];
  for (const range of healthDayRanges(now)) {
    const readings: DailyHealth['readings'] = {};
    await Promise.all(
      granted.map(async (metric) => {
        try {
          readings[metric] = await reader.aggregate(
            metric,
            range.start,
            range.end,
          );
        } catch {
          failed.add(metric);
        }
      }),
    );
    days.push({ day: range.day, readings });
  }
  let latestWeight: HealthSnapshot['latestWeight'] = null;
  if (granted.includes('Weight')) {
    try {
      latestWeight = await reader.latestWeight(
        zonedInstant(
          addDays(localDay(now), -29),
          '00:00',
          APP_TIMEZONE,
        ).toISOString(),
        now.toISOString(),
      );
    } catch {
      failed.add('Weight');
    }
  }
  // Access may change while the native reads are in flight. Drop any revoked
  // type before exposing the result, including readings collected earlier.
  const stillGranted = (await reader.granted()).filter((metric) =>
    granted.includes(metric),
  );
  for (const day of days)
    for (const metric of granted) {
      if (!stillGranted.includes(metric)) delete day.readings[metric];
    }
  if (!stillGranted.includes('Weight')) latestWeight = null;
  return {
    syncedAt: now.toISOString(),
    ...(source ? { source } : {}),
    granted: stillGranted,
    days,
    latestWeight,
    failed: [...failed],
  };
}
export function metricAverage(snapshot: HealthSnapshot, metric: HealthMetric) {
  const values = snapshot.days.flatMap((day) => {
    const value = day.readings[metric]?.value;
    return value == null ? [] : [value];
  });
  return values.length
    ? {
        value: values.reduce((sum, value) => sum + value, 0) / values.length,
        days: values.length,
      }
    : null;
}
export function formatHealthValue(
  metric: HealthMetric,
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value)) return 'No data';
  if (metric === 'SleepSession') {
    const minutes = Math.round(value * 60);
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }
  return metric === 'Steps'
    ? Math.round(value).toLocaleString('en-IN')
    : ['Weight', 'Distance', 'Hydration'].includes(metric)
      ? value.toFixed(1)
      : String(Math.round(value));
}
export function healthSourceName(source: string): string {
  return (
    (
      {
        'com.sec.android.app.shealth': 'Samsung Health',
        'com.google.android.apps.fitness': 'Google Fit',
        'com.fitbit.FitbitMobile': 'Fitbit',
      } as Record<string, string>
    )[source] ?? source
  );
}


export function hasHealthValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
export function recordedHealthMetrics(snapshot: HealthSnapshot | null): HealthMetric[] {
  if (!snapshot) return [];
  return healthMetrics.filter(({ key }) => snapshot.granted.includes(key) && (
    snapshot.days.some(day => hasHealthValue(day.readings[key]?.value)) ||
    (key === 'Weight' && hasHealthValue(snapshot.latestWeight?.kg))
  )).map(item => item.key);
}
