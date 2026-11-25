import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as connection from '../src/features/health-connections/connection.ts';
import * as model from '../src/features/health-connections/model.ts';
import { readingDiagnostics } from '../src/features/health-connections/diagnostics.ts';

describe('Health connection recovery', () => {
  it('keeps a saved source through a cache permission failure and retries only writer-supported types', async () => {
    const source = { id: 'com.pebble.ring.app', name: 'Pebble Halo', supportsHealthConnect: true, metrics: ['Steps'] };
    const unsupported = { id: 'example.legacy', name: 'Legacy app', supportsHealthConnect: false, metrics: [] };
    const snapshot = { source: source.id, days: [], granted: ['Steps'], latestWeight: null, failed: [], syncedAt: '2026-11-04T06:00:00.000Z' };
    let steps = 1000;
    let discoveryFails = false;
    let poll: () => void = () => {};
    let grantChecks = 0;
    const synced: string[][] = [];
    const values: any[] = [], refs: any[] = [], effects: (() => void)[] = [];
    let stateCursor = 0, refCursor = 0, first = true;
    const module = { exports: {} as { session: (props: object) => any } };
    const code = ts.transpileModule(readFileSync('src/features/health-connections/HealthSyncProvider.tsx', 'utf8') + '\nexports.session = HealthSession;', { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    const dependencies: Record<string, unknown> = {
      react: {
        createContext: () => ({ Provider: 'provider' }),
        useState: (initial: any) => { const i = stateCursor++; if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial; return [values[i], (value: any) => { values[i] = typeof value === 'function' ? value(values[i]) : value; }]; },
        useRef: (initial: any) => { const i = refCursor++; return refs[i] ?? (refs[i] = { current: initial }); },
        useEffect: (effect: () => void) => { if (first) effects.push(effect); },
      },
      'react/jsx-runtime': { jsx: (_type: unknown, props: unknown) => ({ props }) },
      'react-native': { Platform: { OS: 'android' }, AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } },
      'expo-secure-store': { getItemAsync: async () => JSON.stringify({ enabled: true, source, selected: ['Steps', 'SleepSession'], background: false, hasConnected: true }), setItemAsync: async () => {} },
      '../authentication/context/AuthContext': {}, './connection': connection, './model': model,
      './healthApps': { installedHealthApps: async () => { if (discoveryFails) throw new Error('Discovery bridge unavailable'); return [source, unsupported]; } },
      './healthConnect': { healthAvailability: async () => 'available', grantedHealth: async () => { if (++grantChecks === 1) throw new Error('Provider starting'); return ['Steps', 'SleepSession']; }, syncHealth: async (selected: string[]) => { synced.push(selected); return { ...snapshot, days: [{ day: '2026-11-04', readings: { Steps: { value: steps, sources: [source.id] } } }] }; } },
      './backgroundHealth': { cachedBackgroundHealth: async () => snapshot, stopBackgroundHealth: async () => {}, cacheHealthSnapshot: async () => {} },
    };
    vm.runInNewContext(code, { module, exports: module.exports, require: (name: string) => { if (!(name in dependencies)) throw new Error(name); return dependencies[name]; }, setInterval: (callback: () => void) => { poll = callback; return 1; }, clearInterval() {}, setTimeout, Date });
    function render() { stateCursor = 0; refCursor = 0; const node = module.exports.session({ account: 'test' }); first = false; return node.props.value; }
    render(); effects.forEach(effect => effect());
    await new Promise<void>(resolve => setImmediate(resolve));
    const state = render();
    assert.equal(state.ready, true);
    assert.equal(state.source.id, source.id);
    assert.equal(state.connected, true);
    assert.equal(state.error, '');
    assert.deepEqual(synced.map(item => Array.from(item)), [['Steps'], ['Steps']]);
    assert.equal(state.apps.length, 2);
    assert.equal(state.enabled, true);
    assert.equal(state.snapshot.days[0].readings.Steps.value, 1000);
    steps = 70001;
    await state.run();
    assert.equal(render().snapshot.days[0].readings.Steps.value, 70001);
    steps = 70035;
    poll();
    await new Promise<void>(resolve => setImmediate(resolve));
    assert.equal(render().snapshot.days.at(-1).readings.Steps.value, 70035);
    discoveryFails = true;
    steps = 70050;
    await render().run();
    assert.equal(render().snapshot.days[0].readings.Steps.value, 70050);
    assert.equal(render().connected, true);
  });
  it('distinguishes access, missing records, failures and another source', () => {
    const app = { id: 'example.writer', name: 'Writer', metrics: ['Steps', 'SleepSession', 'HeartRate', 'Weight'] as model.HealthMetric[] };
    const snapshot: model.HealthSnapshot = { source: app.id, syncedAt: '', days: [{ day: '2026-11-04', readings: { Steps: { value: 0, sources: [app.id] } } }], granted: ['Steps', 'SleepSession', 'HeartRate'], failed: ['HeartRate'], latestWeight: null };
    const statuses = readingDiagnostics(app, app.metrics, snapshot).map(item => item.status);
    assert.deepEqual(statuses, ['Receiving records', 'No shared records in the last 30 days', 'Refresh failed', 'Read access off']);
    assert.ok(readingDiagnostics(app, app.metrics, { ...snapshot, source: 'other.writer' }).every(item => item.status === 'Not checked yet'));
  });
});
