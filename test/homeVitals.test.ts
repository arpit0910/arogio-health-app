import { test } from 'node:test';
import assert from 'node:assert/strict';
import { homeVitals, sleepClock } from '../src/features/home-dashboard/vitalsModel.ts';
import { emptyActivity } from '../src/features/activity/model.ts';
import type { HealthSnapshot } from '../src/features/health-connections/model.ts';

test('homepage preserves missing values and never substitutes phone counts for a connected source', () => {
  const phone = { enabled: true, totals: { '2026-11-14': 6420 } };
  const tracking = { ...emptyActivity(), days: [{ day: '2026-11-14', values: { SleepSession: 7.4 } }] };
  assert.equal(homeVitals('2026-11-14', false, tracking, null, phone).steps, 6420);
  assert.equal(homeVitals('2026-11-14', false, tracking, null, phone).sleep, 7.4);
  assert.deepEqual(homeVitals('2026-11-14', true, tracking, null, phone), { steps: null, sleep: null, calories: null, distance: null, heart: null });
});
test('heart rate requires current access and a real reading, while zero steps remain zero', () => {
  const snapshot: HealthSnapshot = { syncedAt: '2026-11-14T06:00:00Z', granted: ['Steps'], failed: [], latestWeight: null, days: [{ day: '2026-11-14', readings: { Steps: { value: 0, sources: ['fixture'] }, HeartRate: { value: 72, sources: ['fixture'] } } }] };
  const phone = { enabled: false, totals: {} };
  assert.equal(homeVitals('2026-11-14', true, emptyActivity(), snapshot, phone).steps, 0);
  assert.equal(homeVitals('2026-11-14', true, emptyActivity(), snapshot, phone).heart, null);
  snapshot.granted.push('HeartRate');
  assert.equal(homeVitals('2026-11-14', true, emptyActivity(), snapshot, phone).heart, 72);
  assert.equal(sleepClock(7.4), '7h 24m');
});
