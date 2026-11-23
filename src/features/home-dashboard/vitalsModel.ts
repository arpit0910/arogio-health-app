import { activityReading, type ActivityTracking } from '../activity/model.ts';
import { hasHealthValue, type HealthSnapshot } from '../health-connections/model.ts';

/** Source selection is exclusive: a connected source never borrows phone values. */
export function homeVitals(day: string, connected: boolean, tracking: ActivityTracking, snapshot: HealthSnapshot | null, phone: { enabled: boolean; totals: Record<string, number> }) {
  const mode = connected ? 'connected' : 'manual';
  const read = (key: Parameters<typeof activityReading>[0]) => {
    const value = activityReading(key, day, mode, tracking, snapshot, phone).value;
    return hasHealthValue(value) ? value : null;
  };
  const rawHeart = connected && snapshot?.granted.includes('HeartRate') ? snapshot.days.find(item => item.day === day)?.readings.HeartRate?.value : null;
  return { steps: read('Steps'), sleep: read('SleepSession'), calories: read('ActiveCaloriesBurned'), distance: read('Distance'), heart: hasHealthValue(rawHeart) ? rawHeart : null };
}
export function sleepClock(hours: number) {
  const minutes = Math.round(hours * 60);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
