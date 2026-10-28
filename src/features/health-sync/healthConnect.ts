import type { HealthAvailability, HealthMetric, HealthSnapshot } from './model';
export async function healthAvailability(): Promise<HealthAvailability> {
  return 'unsupported';
}
export async function connectHealth(
  _metrics: HealthMetric[],
): Promise<HealthMetric[]> {
  return [];
}
export async function syncHealth(
  _metrics: HealthMetric[],
): Promise<HealthSnapshot> {
  throw new Error('Health Connect is available in the Android app.');
}
export async function openHealthSettings(): Promise<void> {}
export async function installHealthConnect(): Promise<void> {}
