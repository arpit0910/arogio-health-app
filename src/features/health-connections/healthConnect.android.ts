import { sleepIntervals } from './sleep.ts';
import { Linking, Platform } from 'react-native';
import {
  readHealthSnapshot,
  healthRead,
  healthMetrics,
  type HealthAvailability,
  type HealthMetric,
  type HealthReader,
  type Reading,
  type SourceRecordCheck,
} from './model';

let Health: typeof import('react-native-health-connect');

export async function healthAvailability(): Promise<HealthAvailability> {
  if (Number(Platform.Version) < 28) return 'unsupported';
  try {
    Health = await import('react-native-health-connect');
    const status = await healthRead(Health.getSdkStatus());
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
  if (!(await healthRead(Health.initialize())))
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
  const permissions = await healthRead(Health.getGrantedPermissions());
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
  const thisReader: HealthReader = {
    granted: grantedTypes,
    async aggregate(metric, start, end): Promise<Reading> {
      if (start === end) return { value: null, sources: [] };
      return normalizeAggregate(metric, await healthRead(Health.aggregateRecord({ recordType: metric,
        timeRangeFilter: { operator: 'between', startTime: start, endTime: end }, dataOriginFilter })), source);
    },
    aggregateDays: async (metric, ranges) => {
      const first = ranges[0], last = ranges.at(-1);
      if (!first || !last) return [];
      if (metric !== 'SleepSession') {
        // Android can omit the partial final duration bucket. Read today directly.
        const today = thisReader.aggregate(metric, last.start, last.end).catch(() => undefined);
        if (first === last) return [await today];
        try {
          const buckets = await healthRead(Health.aggregateGroupByDuration({
            recordType: metric, dataOriginFilter,
            timeRangeFilter: { operator: 'between', startTime: first.start, endTime: last.start },
            timeRangeSlicer: { duration: 'DAYS', length: 1 },
          }));
          const byStart = new Map(buckets.map(bucket => [Date.parse(bucket.startTime), bucket.result]));
          return [...ranges.slice(0, -1).map(range => {
            const result = byStart.get(Date.parse(range.start));
            return result ? normalizeAggregate(metric, result, source) : { value: null, sources: [] };
          }), await today];
        } catch {
          return [...ranges.slice(0, -1).map(() => undefined), await today];
        }
      }
      const sessions: { startTime: string; endTime: string }[] = [];
      let pageToken: string | undefined;
      const pages = new Set<string>();
      do {
        const response = await healthRead(Health.readRecords('SleepSession', {
          dataOriginFilter, pageSize: 1000, pageToken,
          timeRangeFilter: { operator: 'between', startTime: new Date(Math.max(Date.parse(first.start) - 86400000, Date.parse(last.end) - 30 * 86400000)).toISOString(), endTime: last.end },
        }));
        sessions.push(...response.records.filter(record => record.metadata?.dataOrigin === source));
        pageToken = response.pageToken || undefined;
        if (pageToken && pages.has(pageToken)) throw new Error('Health Connect repeated a sleep page.');
        if (pageToken) pages.add(pageToken);
      } while (pageToken);
      return Promise.all(ranges.map(async range => {
        const intervals = sleepIntervals(sessions, range.start, range.end);
        try {
          let total = 0, found = false;
          for (const interval of intervals) {
            const reading = await thisReader.aggregate('SleepSession', interval.startTime, interval.endTime);
            if (reading.value != null) { total += reading.value; found = true; }
          }
          return { value: found ? total : null, sources: found ? [source] : [] };
        } catch {
          return undefined;
        }
      }));
    },
    async latestWeight(startTime, endTime) {
      const response = await healthRead(Health.readRecords('Weight', {
        timeRangeFilter: { operator: 'between', startTime, endTime },
        ascendingOrder: false,
        pageSize: 1,
        dataOriginFilter,
      }));
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
  return thisReader;
}
export async function syncHealth(metrics: HealthMetric[], source: string, dayCount?: number) {
  if (!source || !/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(source)) throw new Error('Choose one health app before syncing.');
  await initializeHealth();
  return readHealthSnapshot(createReader(source), metrics, new Date(), source, dayCount);
}
/** An explicit diagnostic reads source timestamps directly, without using the app cache. */
export async function checkSourceRecords(metrics: HealthMetric[], source: string): Promise<SourceRecordCheck[]> {
  if (!/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(source)) throw new Error('Choose one health app before syncing.');
  await initializeHealth();
  const granted = await grantedTypes();
  const end = new Date(), start = new Date(end.getTime() - 29 * 86400000);
  const checks: SourceRecordCheck[] = [];
  for (const metric of metrics.filter(item => granted.includes(item))) {
    try {
      const response = await healthRead(Health.readRecords(metric, { dataOriginFilter: [source], pageSize: 1, ascendingOrder: false,
        timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() } }));
      const record = response.records.find(item => item.metadata?.dataOrigin === source);
      const instant = record ? ('time' in record ? record.time : 'endTime' in record ? record.endTime : null) : null;
      const recordedAt = typeof instant === 'string' ? instant : null;
      const modifiedAt = record?.metadata?.lastModifiedTime;
      checks.push({ metric, source, recordedAt: recordedAt && Number.isFinite(Date.parse(recordedAt)) ? recordedAt : null,
        modifiedAt: modifiedAt && Number.isFinite(Date.parse(modifiedAt)) ? modifiedAt : null, failed: false });
    } catch { checks.push({ metric, source, recordedAt: null, modifiedAt: null, failed: true }); }
  }
  return checks;
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
  return (await healthRead(Health.getGrantedPermissions())).some((p) => p.recordType === 'BackgroundAccessPermission' && p.accessType === 'read');
}
export async function requestBackgroundHealth() {
  await initializeHealth();
  await Health.requestPermission([{ accessType: 'read', recordType: 'BackgroundAccessPermission' }]);
  return backgroundHealthGranted();
}
