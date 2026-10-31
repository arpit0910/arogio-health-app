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
type NativeAggregate = {
  dataOrigins?: string[]; COUNT_TOTAL?: number; SLEEP_DURATION_TOTAL?: number;
  BPM_AVG?: number; MEASUREMENTS_COUNT?: number; FLOORS_CLIMBED_TOTAL?: number;
  WEIGHT_AVG?: { inKilograms?: number }; ENERGY_TOTAL?: { inKilocalories?: number };
  DISTANCE?: { inKilometers?: number }; ACTIVE_CALORIES_TOTAL?: { inKilocalories?: number };
  EXERCISE_DURATION_TOTAL?: { inSeconds?: number }; VOLUME_TOTAL?: { inLiters?: number };
};
function normalizeAggregate(metric: HealthMetric, result: NativeAggregate, source: string): Reading {
  const sources = result.dataOrigins ?? [];
  const values: Partial<Record<HealthMetric, number | undefined>> = {
    Steps: result.COUNT_TOTAL, SleepSession: result.SLEEP_DURATION_TOTAL == null ? undefined : result.SLEEP_DURATION_TOTAL / 3600,
    HeartRate: (result.MEASUREMENTS_COUNT ?? 0) > 0 ? result.BPM_AVG : undefined,
    Weight: result.WEIGHT_AVG?.inKilograms, Nutrition: result.ENERGY_TOTAL?.inKilocalories,
    Distance: result.DISTANCE?.inKilometers, ActiveCaloriesBurned: result.ACTIVE_CALORIES_TOTAL?.inKilocalories,
    TotalCaloriesBurned: result.ENERGY_TOTAL?.inKilocalories,
    ExerciseSession: result.EXERCISE_DURATION_TOTAL?.inSeconds == null ? undefined : result.EXERCISE_DURATION_TOTAL.inSeconds / 60,
    FloorsClimbed: result.FLOORS_CLIMBED_TOTAL, RestingHeartRate: result.BPM_AVG, Hydration: result.VOLUME_TOTAL?.inLiters,
  };
  const validSource = sources.length > 0 && sources.every(origin => origin === source), value = values[metric];
  return { value: validSource && value != null && Number.isFinite(value) && value >= 0 ? value : null,
    sources: validSource ? sources : [] };
}
/** Every native request stays scoped to the selected app. IST has fixed 24h days. */
function createReader(source: string): HealthReader {
  const dataOriginFilter = [source];
  return {
    granted: grantedTypes,
    async aggregate(metric, start, end): Promise<Reading> {
      if (start === end) return { value: null, sources: [] };
      return normalizeAggregate(metric, await Health.aggregateRecord({ recordType: metric,
        timeRangeFilter: { operator: 'between', startTime: start, endTime: end }, dataOriginFilter }), source);
    },
    // One weekly request per metric instead of seven daily requests per metric.
    aggregateDays: typeof Health.aggregateGroupByDuration === 'function' ? async (metric, ranges) => {
      const first = ranges[0], last = ranges.at(-1);
      if (!first || !last || first.start === last.end) return ranges.map(() => ({ value: null, sources: [] }));
      const buckets = await Health.aggregateGroupByDuration({ recordType: metric, dataOriginFilter,
        timeRangeFilter: { operator: 'between', startTime: first.start, endTime: last.end },
        timeRangeSlicer: { duration: 'DAYS', length: 1 } });
      return ranges.map(range => {
        const bucket = buckets.find(item => Date.parse(item.startTime) === Date.parse(range.start));
        return bucket ? normalizeAggregate(metric, bucket.result, source) : { value: null, sources: [] };
      });
    } : undefined,
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
