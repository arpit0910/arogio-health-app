import { Linking, Platform } from 'react-native';
import {
  readHealthSnapshot,
  healthMetrics,
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
async function grantedTypes() {
  const permissions = await Health.getGrantedPermissions();
  return healthMetrics.map((item) => item.key).filter((metric) => permissions.some((p) => p.accessType === 'read' && p.recordType === metric));
}
/** A fresh reader captures exactly one source; no mutable global source can leak across reads. */
function createReader(source: string): HealthReader {
  const dataOriginFilter = [source];
  return {
    granted: grantedTypes,
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
          dataOriginFilter,
        });
        sources = result.dataOrigins;
        value = result.COUNT_TOTAL;
      }
      if (metric === 'SleepSession') {
        const result = await Health.aggregateRecord({
          recordType: 'SleepSession',
          timeRangeFilter,
          dataOriginFilter,
        });
        sources = result.dataOrigins;
        value = result.SLEEP_DURATION_TOTAL / 3600;
      }
      if (metric === 'HeartRate') {
        const result = await Health.aggregateRecord({
          recordType: 'HeartRate',
          timeRangeFilter,
          dataOriginFilter,
        });
        sources = result.dataOrigins;
        value = result.MEASUREMENTS_COUNT > 0 ? result.BPM_AVG : null;
      }
      if (metric === 'Weight') {
        const result = await Health.aggregateRecord({
          recordType: 'Weight',
          timeRangeFilter,
          dataOriginFilter,
        });
        sources = result.dataOrigins;
        value = result.WEIGHT_AVG?.inKilograms ?? null;
      }
      if (metric === 'Nutrition') {
      const result = await Health.aggregateRecord({ recordType: 'Nutrition', timeRangeFilter, dataOriginFilter });
      sources = result.dataOrigins;
      value = result.ENERGY_TOTAL?.inKilocalories ?? null;
    }
    if (metric === 'Distance') {
        const result = await Health.aggregateRecord({ recordType: 'Distance', timeRangeFilter, dataOriginFilter });
        sources = result.dataOrigins;
        value = result.DISTANCE.inKilometers;
      }
      if (metric === 'ActiveCaloriesBurned') {
        const result = await Health.aggregateRecord({ recordType: 'ActiveCaloriesBurned', timeRangeFilter, dataOriginFilter });
        sources = result.dataOrigins;
        value = result.ACTIVE_CALORIES_TOTAL.inKilocalories;
      }
      if (metric === 'TotalCaloriesBurned') {
        const result = await Health.aggregateRecord({ recordType: 'TotalCaloriesBurned', timeRangeFilter, dataOriginFilter });
        sources = result.dataOrigins;
        value = result.ENERGY_TOTAL.inKilocalories;
      }
      if (metric === 'ExerciseSession') {
        const result = await Health.aggregateRecord({ recordType: 'ExerciseSession', timeRangeFilter, dataOriginFilter });
        sources = result.dataOrigins;
        value = result.EXERCISE_DURATION_TOTAL.inSeconds / 60;
      }
      if (metric === 'FloorsClimbed') {
        const result = await Health.aggregateRecord({ recordType: 'FloorsClimbed', timeRangeFilter, dataOriginFilter });
        sources = result.dataOrigins;
        value = result.FLOORS_CLIMBED_TOTAL;
      }
      if (metric === 'RestingHeartRate') {
        const result = await Health.aggregateRecord({ recordType: 'RestingHeartRate', timeRangeFilter, dataOriginFilter });
        sources = result.dataOrigins;
        value = result.BPM_AVG;
      }
      if (metric === 'Hydration') {
        const result = await Health.aggregateRecord({ recordType: 'Hydration', timeRangeFilter, dataOriginFilter });
        sources = result.dataOrigins;
        value = result.VOLUME_TOTAL.inLiters;
      }
      return {
        value:
          sources.length && sources.every((origin) => origin === source) && value != null && Number.isFinite(value)
            ? value
            : null,
        sources: sources.every((origin) => origin === source) ? sources : [],
      };
    },
    async latestWeight(startTime, endTime) {
      const response = await Health.readRecords('Weight', {
        timeRangeFilter: { operator: 'between', startTime, endTime },
        ascendingOrder: false,
        pageSize: 1,
        dataOriginFilter,
      });
      const record = response.records[0];
      return record?.metadata?.dataOrigin === source
        ? {
            kg: record.weight.inKilograms,
            at: record.time,
            source: record.metadata?.dataOrigin ?? '',
          }
        : null;
    },
  };
}
export async function syncHealth(metrics: HealthMetric[], source: string) {
  if (!source || !/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(source)) throw new Error('Choose one health app before syncing.');
  await initializeHealth();
  return readHealthSnapshot(createReader(source), metrics, new Date(), source);
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

export async function grantedHealth() {
  await initializeHealth();
  return grantedTypes();
}

export async function backgroundHealthGranted() {
  await initializeHealth();
  return (await Health.getGrantedPermissions()).some((p) => p.recordType === 'BackgroundAccessPermission' && p.accessType === 'read');
}
export async function requestBackgroundHealth() {
  await initializeHealth();
  await Health.requestPermission([{ accessType: 'read', recordType: 'BackgroundAccessPermission' }]);
  return backgroundHealthGranted();
}
