import { Linking, Platform } from 'react-native';
import {
  readHealthSnapshot,
  type HealthAvailability,
  type HealthMetric,
  type HealthReader,
  type Reading,
} from './model';

let Health: typeof import('react-native-health-connect');

export async function healthAvailability(): Promise<HealthAvailability> {
  if (Number(Platform.Version) < 28) return 'unsupported';
  try {
    Health = await import('react-native-health-connect');
    const status = await Health.getSdkStatus();
    if (status === Health.SdkAvailabilityStatus.SDK_AVAILABLE)
      return 'available';
    return status ===
      Health.SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
      ? 'update-required'
      : 'unsupported';
  } catch {
    return 'rebuild-required';
  }
}
async function initializeHealth() {
  Health = await import('react-native-health-connect');
  if (!(await Health.initialize()))
    throw new Error(
      'Health Connect could not start. Install or update it, then try again.',
    );
}
export async function connectHealth(metrics: HealthMetric[]) {
  await initializeHealth();
  const permissions = await Health.requestPermission(
    metrics.map((recordType) => ({ accessType: 'read' as const, recordType })),
  );
  return metrics.filter((metric) =>
    permissions.some((p) => p.accessType === 'read' && p.recordType === metric),
  );
}
/** The OS aggregation API applies source priorities to avoid counting duplicate steps. */
const reader: HealthReader = {
  async granted() {
    const permissions = await Health.getGrantedPermissions();
    return (
      ['Steps', 'SleepSession', 'HeartRate', 'Weight'] as HealthMetric[]
    ).filter((metric) =>
      permissions.some(
        (p) => p.accessType === 'read' && p.recordType === metric,
      ),
    );
  },
  async aggregate(metric, start, end): Promise<Reading> {
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime: start,
      endTime: end,
    };
    if (start === end) return { value: null, sources: [] };
    let value: number | null = null,
      sources: string[] = [];
    if (metric === 'Steps') {
      const result = await Health.aggregateRecord({
        recordType: 'Steps',
        timeRangeFilter,
      });
      sources = result.dataOrigins;
      value = result.COUNT_TOTAL;
    }
    if (metric === 'SleepSession') {
      const result = await Health.aggregateRecord({
        recordType: 'SleepSession',
        timeRangeFilter,
      });
      sources = result.dataOrigins;
      value = result.SLEEP_DURATION_TOTAL / 3600;
    }
    if (metric === 'HeartRate') {
      const result = await Health.aggregateRecord({
        recordType: 'HeartRate',
        timeRangeFilter,
      });
      sources = result.dataOrigins;
      value = result.MEASUREMENTS_COUNT > 0 ? result.BPM_AVG : null;
    }
    if (metric === 'Weight') {
      const result = await Health.aggregateRecord({
        recordType: 'Weight',
        timeRangeFilter,
      });
      sources = result.dataOrigins;
      value = result.WEIGHT_AVG?.inKilograms ?? null;
    }
    return {
      value:
        sources.length && value != null && Number.isFinite(value)
          ? value
          : null,
      sources,
    };
  },
  async latestWeight(startTime, endTime) {
    const response = await Health.readRecords('Weight', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
      ascendingOrder: false,
      pageSize: 1,
    });
    const record = response.records[0];
    return record
      ? {
          kg: record.weight.inKilograms,
          at: record.time,
          source: record.metadata?.dataOrigin ?? '',
        }
      : null;
  },
};
export async function syncHealth(metrics: HealthMetric[]) {
  await initializeHealth();
  return readHealthSnapshot(reader, metrics);
}
export async function openHealthSettings() {
  await initializeHealth();
  Health.openHealthConnectSettings();
}
export async function installHealthConnect() {
  await Linking.openURL(
    'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata',
  );
}
