import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';
import ts from 'typescript';
import { healthMetrics, type HealthSnapshot } from '../src/features/health-sync/model.ts';

const require = createRequire(import.meta.url);
function load(file: string, dependencies: Record<string, unknown>) {
  const module = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, require: (key: string) => {
    if (!(key in dependencies)) throw new Error(`Unexpected dependency ${key}`);
    return dependencies[key];
  }, console, setTimeout, clearTimeout });
  return module.exports;
}
const model = require('../src/features/health-sync/model.ts');

describe('Expanded native health import', () => {
  it('rejects missing sources and refuses mixed-origin readings or a weight from another app', async () => {
    let queries = 0;
    const native = { initialize: async () => true,
      getGrantedPermissions: async () => [{ recordType: 'Steps', accessType: 'read' }, { recordType: 'Weight', accessType: 'read' }],
      aggregateRecord: async ({ dataOriginFilter }: { dataOriginFilter: string[] }) => {
        queries++; assert.deepEqual(Array.from(dataOriginFilter), ['example.source']);
        return { COUNT_TOTAL: 2000, WEIGHT_AVG: { inKilograms: 60 }, dataOrigins: ['example.source', 'other.source'] };
      },
      readRecords: async (_type: string, options: { dataOriginFilter: string[] }) => {
        assert.deepEqual(Array.from(options.dataOriginFilter), ['example.source']);
        return { records: [{ time: new Date().toISOString(), weight: { inKilograms: 60 }, metadata: { dataOrigin: 'other.source' } }] };
      },
    };
    const api = load('../src/features/health-sync/healthConnect.android.ts', {
      'react-native': { Platform: { Version: 36 } }, './model': model, 'react-native-health-connect': native,
    }) as { syncHealth: (selected: string[], source: string) => Promise<HealthSnapshot> };
    await assert.rejects(api.syncHealth(['Steps'], ''), /Choose one health app/);
    assert.equal(queries, 0);
    const result = await api.syncHealth(['Steps', 'Weight'], 'example.source');
    assert.equal(result.source, 'example.source');
    assert.ok(result.days.every((day) => day.readings.Steps?.value === null && !day.readings.Steps?.sources.length));
    assert.equal(result.latestWeight, null);
  });
  it('captures each source separately when two syncs overlap', async () => {
    const native = { initialize: async () => true,
      getGrantedPermissions: async () => [{ recordType: 'Steps', accessType: 'read' }],
      aggregateRecord: async ({ dataOriginFilter }: { dataOriginFilter: string[] }) => {
        await Promise.resolve();
        return { COUNT_TOTAL: dataOriginFilter[0] === 'example.source' ? 100 : 900, dataOrigins: [dataOriginFilter[0]] };
      }, readRecords: async () => ({ records: [] }),
    };
    const api = load('../src/features/health-sync/healthConnect.android.ts', {
      'react-native': { Platform: { Version: 36 } }, './model': model, 'react-native-health-connect': native,
    }) as { syncHealth: (selected: string[], source: string) => Promise<HealthSnapshot> };
    const [first, second] = await Promise.all([api.syncHealth(['Steps'], 'example.source'), api.syncHealth(['Steps'], 'other.source')]);
    assert.equal(first.source, 'example.source'); assert.equal(second.source, 'other.source');
    assert.ok(first.days.every((day) => day.readings.Steps?.value === 100));
    assert.ok(second.days.every((day) => day.readings.Steps?.value === 900));
  });
  it('converts source units, reads every allowed metric and never requests write access', async () => {
    const values: Record<string, object> = {
      Nutrition: { ENERGY_TOTAL: { inKilocalories: 650 } },
      Steps: { COUNT_TOTAL: 4500 }, SleepSession: { SLEEP_DURATION_TOTAL: 27000 },
      HeartRate: { MEASUREMENTS_COUNT: 3, BPM_AVG: 72 }, Weight: { WEIGHT_AVG: { inKilograms: 65 } },
      Distance: { DISTANCE: { inKilometers: 3.25 } }, ActiveCaloriesBurned: { ACTIVE_CALORIES_TOTAL: { inKilocalories: 250 } },
      TotalCaloriesBurned: { ENERGY_TOTAL: { inKilocalories: 1800 } }, ExerciseSession: { EXERCISE_DURATION_TOTAL: { inSeconds: 1800 } },
      FloorsClimbed: { FLOORS_CLIMBED_TOTAL: 8 }, RestingHeartRate: { BPM_AVG: 58 }, Hydration: { VOLUME_TOTAL: { inLiters: 1.75 } },
    };
    const native = {
      initialize: async () => true,
      getGrantedPermissions: async () => healthMetrics.map((item) => ({ recordType: item.key, accessType: 'read' })),
      requestPermission: async (permissions: { accessType: string }[]) => {
        assert.ok(permissions.every((p) => p.accessType === 'read'));
        return permissions;
      },
      aggregateRecord: async ({ recordType, dataOriginFilter }: { recordType: string; dataOriginFilter: string[] }) => { assert.deepEqual(Array.from(dataOriginFilter), ['example.source']); return { ...values[recordType], dataOrigins: ['example.source'] }; },
      readRecords: async (_type: string, options: { dataOriginFilter: string[] }) => { assert.deepEqual(Array.from(options.dataOriginFilter), ['example.source']); return { records: [] }; },
    };
    const api = load('../src/features/health-sync/healthConnect.android.ts', {
      'react-native': { Platform: { Version: 36 } }, './model': model, 'react-native-health-connect': native,
    }) as { syncHealth: (selected: string[], source: string) => Promise<HealthSnapshot>; connectHealth: (selected: string[]) => Promise<string[]> };
    const selected = healthMetrics.map((item) => item.key);
    assert.equal((await api.connectHealth(selected)).length, 12);
    const snapshot = await api.syncHealth(selected, 'example.source');
    assert.equal(snapshot.granted.length, 12);
    const reading = snapshot.days[0].readings;
    assert.equal(reading.Nutrition?.value, 650);
    assert.equal(reading.SleepSession?.value, 7.5);
    assert.equal(reading.ExerciseSession?.value, 30);
    assert.equal(reading.Distance?.value, 3.25);
    assert.equal(reading.ActiveCaloriesBurned?.value, 250);
    assert.equal(reading.TotalCaloriesBurned?.value, 1800);
    assert.equal(reading.Hydration?.value, 1.75);
    assert.equal(reading.RestingHeartRate?.value, 58);
    assert.equal(reading.FloorsClimbed?.value, 8);
  });
});
function backgroundHarness() {
  const store = new Map<string, string>();
  let handler: () => Promise<number>;
  let registered = false, grants = true, registrations = 0;
  let read: (source: string) => Promise<HealthSnapshot> = async (source) => ({ syncedAt: new Date().toISOString(), granted: ['Steps'], days: [], latestWeight: null, failed: [], source });
  const api = load('../src/features/health-sync/backgroundHealth.ts', {
    'react-native': { Platform: { OS: 'android' } },
    'expo-crypto': { randomUUID },
    'expo-secure-store': { getItemAsync: async (key: string) => store.get(key) ?? null, setItemAsync: async (key: string, value: string) => { store.set(key, value); }, deleteItemAsync: async (key: string) => { store.delete(key); } },
    'expo-background-task': { BackgroundTaskStatus: { Available: 2 }, BackgroundTaskResult: { Success: 1, Failed: 2 }, getStatusAsync: async () => 2,
      registerTaskAsync: async (_name: string, options: { minimumInterval: number }) => { assert.equal(options.minimumInterval, 15); registered = true; registrations++; },
      unregisterTaskAsync: async () => { registered = false; } },
    'expo-task-manager': { defineTask: (_name: string, task: () => Promise<number>) => { handler = task; }, isAvailableAsync: async () => true, isTaskRegisteredAsync: async () => registered },
    './healthConnect': { backgroundHealthGranted: async () => grants, healthAvailability: async () => 'available', syncHealth: (_selected: string[], source: string) => read(source) },
    './healthApps': { installedHealthApps: async () => [{ id: 'example.source', name: 'Example' }, { id: 'other.source', name: 'Other' }] },
    './model': model,
  }) as { startBackgroundHealth: (owner: string, selected: string[], source: string, valid?: () => boolean) => Promise<boolean>; stopBackgroundHealth: () => Promise<void>; cachedBackgroundHealth: (owner: string, source: string) => Promise<HealthSnapshot | null> };
  return { api, store, run: () => handler(), setRead: (next: typeof read) => { read = next; }, revoke: () => { grants = false; }, registrations: () => registrations, registered: () => registered };
}
describe('Background refresh lifecycle', () => {
  it('keeps the 15-minute task schedule stable across foreground refreshes and isolates accounts', async () => {
    const h = backgroundHarness();
    assert.equal(await h.api.startBackgroundHealth('alice', ['Steps'], 'example.source'), true);
    await h.run();
    assert.ok(await h.api.cachedBackgroundHealth('alice', 'example.source'));
    assert.equal(await h.api.cachedBackgroundHealth('bob', 'example.source'), null);
    await h.api.startBackgroundHealth('alice', ['Steps'], 'example.source');
    assert.equal(h.registrations(), 1);
    await h.api.stopBackgroundHealth();
    assert.equal(h.registered(), false);
    assert.equal(h.store.size, 0);
  });
  it('does not publish an in-flight read after disconnect or sign-out', async () => {
    const h = backgroundHarness();
    let complete: (snapshot: HealthSnapshot) => void;
    let began: () => void;
    const started = new Promise<void>((resolve) => { began = resolve; });
    h.setRead(() => { began(); return new Promise((resolve) => { complete = resolve; }); });
    await h.api.startBackgroundHealth('alice', ['Steps'], 'example.source');
    const running = h.run();
    await started;
    await h.api.stopBackgroundHealth();
    complete!({ syncedAt: new Date().toISOString(), granted: ['Steps'], days: [], latestWeight: null, failed: [], source: 'example.source' });
    await running;
    assert.equal(h.store.size, 0);
  });
  it('discards old results even when the same account reconnects before the read completes', async () => {
    const h = backgroundHarness();
    let complete: (snapshot: HealthSnapshot) => void;
    let began: () => void;
    const started = new Promise<void>((resolve) => { began = resolve; });
    h.setRead(() => { began(); return new Promise((resolve) => { complete = resolve; }); });
    await h.api.startBackgroundHealth('alice', ['Steps'], 'example.source');
    const running = h.run();
    await started;
    await h.api.stopBackgroundHealth();
    await h.api.startBackgroundHealth('alice', ['Steps'], 'example.source');
    complete!({ syncedAt: new Date().toISOString(), granted: ['Steps'], days: [], latestWeight: null, failed: [], source: 'example.source' });
    await running;
    assert.equal(await h.api.cachedBackgroundHealth('alice', 'example.source'), null);
  });
  it('clears old-source cache and rejects in-flight results after switching apps', async () => {
    const h = backgroundHarness();
    await h.api.startBackgroundHealth('alice', ['Steps'], 'example.source');
    await h.run();
    assert.ok(await h.api.cachedBackgroundHealth('alice', 'example.source'));
    assert.equal(await h.api.cachedBackgroundHealth('alice', 'other.source'), null);
    let complete: (snapshot: HealthSnapshot) => void;
    let began: () => void;
    const started = new Promise<void>((resolve) => { began = resolve; });
    h.setRead((source) => { assert.equal(source, 'example.source'); began(); return new Promise((resolve) => { complete = resolve; }); });
    const running = h.run();
    await started;
    await h.api.startBackgroundHealth('alice', ['Steps'], 'other.source');
    complete!({ syncedAt: new Date().toISOString(), granted: ['Steps'], days: [], latestWeight: null, failed: [], source: 'example.source' });
    await running;
    assert.equal(await h.api.cachedBackgroundHealth('alice', 'other.source'), null);
    assert.equal(await h.api.cachedBackgroundHealth('alice', 'example.source'), null);
    h.setRead(async (source) => ({ syncedAt: new Date().toISOString(), granted: ['Steps'], days: [], latestWeight: null, failed: [], source }));
    await h.run();
    assert.equal((await h.api.cachedBackgroundHealth('alice', 'other.source'))?.source, 'other.source');
  });
  it('clears cache on revocation and failed reads, and declines obsolete account registrations', async () => {
    const h = backgroundHarness();
    assert.equal(await h.api.startBackgroundHealth('alice', ['Steps'], 'example.source', () => false), false);
    assert.equal(h.store.size, 0);
    await h.api.startBackgroundHealth('alice', ['Steps'], 'example.source');
    await h.run();
    h.setRead(async () => { throw new Error('Provider read failed'); });
    assert.equal(await h.run(), 2);
    assert.equal(await h.api.cachedBackgroundHealth('alice', 'example.source'), null);
    h.revoke();
    await h.run();
    assert.equal(h.store.size, 0);
    assert.equal(h.registered(), false);
  });
});
