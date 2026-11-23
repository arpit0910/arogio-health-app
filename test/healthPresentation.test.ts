import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hasHealthValue, recordedHealthMetrics, type HealthSnapshot } from '../src/features/health-connections/model.ts';
import { connectableHealthApps, appHealthMetrics } from '../src/features/health-connections/connection.ts';
import { activityMode } from '../src/features/activity/model.ts';
import { confirmActivityGoals, confirmMedicineDose, normalizeWellness } from '../src/features/personal-wellness/snapshot.ts';
import { emptyWellness } from '../src/features/personal-wellness/domain.ts';

describe('Available health data and connections', () => {
  it('hides permission-only and invalid readings while keeping an actual zero', () => {
    const snapshot: HealthSnapshot = { syncedAt: '', granted: ['Steps', 'ExerciseSession', 'SleepSession', 'Weight'], failed: [], latestWeight: null, days: [{ day: '2026-10-30', readings: { Steps: { value: 0, sources: ['example.health'] }, ExerciseSession: { value: null, sources: [] }, SleepSession: { value: NaN, sources: [] } } }] };
    assert.deepEqual(recordedHealthMetrics(snapshot), ['Steps']);
    snapshot.latestWeight = { kg: 65, at: '2026-10-28', source: 'example.health' };
    assert.deepEqual(recordedHealthMetrics(snapshot), ['Steps', 'Weight']);
    snapshot.granted = [];
    assert.deepEqual(recordedHealthMetrics(snapshot), []);
    assert.equal(recordedHealthMetrics(null).length, 0);
    assert.equal(hasHealthValue(-1), false);
    assert.equal(hasHealthValue(Infinity), false);
  });
  it('offers only verified capable apps, and requests only their supported data types', () => {
    const apps = [{ id: 'example.good', name: 'Health', supportsHealthConnect: true, metrics: ['Steps' as const] }, { id: 'example.unsupported', name: 'Unsupported', supportsHealthConnect: false }, { id: 'example.unknown', name: 'Unknown' }, { id: 'example.empty', name: 'Empty', supportsHealthConnect: true, metrics: [] }];
    assert.deepEqual(connectableHealthApps(apps).map(app => app.id), ['example.good']);
    assert.deepEqual(appHealthMetrics(apps[0]), ['Steps']);
  });
  it('follows a restored connection unless the person explicitly chose manual tracking', () => {
    assert.equal(activityMode(null, false), 'manual');
    assert.equal(activityMode(null, true), 'connected');
    assert.equal(activityMode('manual', true), 'manual');
    assert.equal(activityMode('connected', false), 'manual');
  });
});
describe('Confirmed account targets', () => {
  it('accepts saved and cleared targets without overwriting unrelated goals', () => {
    const data = { ...emptyWellness(), activityTracking: { goals: { Steps: 8000, SleepSession: 8 }, days: [] } };
    confirmActivityGoals(data, { goals: { Steps: 8000 } });
    assert.throws(() => confirmActivityGoals(data, { goals: { Steps: 10000 } }), /did not confirm/);
    assert.throws(() => confirmActivityGoals(data, { goals: { Steps: null } }), /did not confirm/);
    confirmActivityGoals({ ...data, activityTracking: { goals: { SleepSession: 8 }, days: [] } }, { goals: { Steps: null } });
    assert.throws(() => confirmActivityGoals(emptyWellness(), { goals: { Steps: 8000 } }), /did not confirm/);
  });
  it('rejects malformed API successes instead of clearing the saved journal', () => {
    assert.throws(() => normalizeWellness({ message: 'Welcome' }), /did not return/);
    assert.deepEqual(normalizeWellness(emptyWellness()), emptyWellness());
  });
  it('rejects malformed dose records while accepting an older server without logging support', () => {
    assert.equal(normalizeWellness(emptyWellness()).medicineDoses, undefined);
    assert.throws(() => normalizeWellness({ ...emptyWellness(), medicineDoses: {} }), /valid medicine dose/);
    const dose = { medicineId: 'fixture', day: '2026-11-14', time: '08:00', status: 'taken' as const, recordedAt: '2026-11-14T03:00:00Z', snoozedUntil: null };
    assert.equal(normalizeWellness({ ...emptyWellness(), medicineDoses: [dose] }).medicineDoses?.length, 1);
    assert.throws(() => normalizeWellness({ ...emptyWellness(), medicineDoses: [{ ...dose, time: '28:00' }] }), /valid medicine dose/);
  });
  it('requires the server to confirm the exact medicine dose mutation before displaying success', () => {
    const path = 'medicines/fixture/doses/2026-11-14/08:00';
    const dose = { medicineId: 'fixture', day: '2026-11-14', time: '08:00', status: 'taken' as const, recordedAt: '2026-11-14T03:00:00Z', snoozedUntil: null };
    confirmMedicineDose({ ...emptyWellness(), medicineDoses: [dose] }, path, { status: 'taken' });
    assert.throws(() => confirmMedicineDose(emptyWellness(), path, { status: 'taken' }), /did not confirm/);
    assert.throws(() => confirmMedicineDose({ ...emptyWellness(), medicineDoses: [dose] }, path, { status: 'pending', snooze: true }), /did not confirm/);
  });
});
