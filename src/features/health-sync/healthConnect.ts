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
  _source: string,
): Promise<HealthSnapshot> {
  throw new Error('Health Connect is available in the Android app.');
}
export async function openHealthSettings(): Promise<void> {}
export async function installHealthConnect(): Promise<void> {}

export async function grantedHealth(): Promise<HealthMetric[]> { return []; }

export async function backgroundHealthGranted() { return false; }
export async function requestBackgroundHealth() { return false; }
