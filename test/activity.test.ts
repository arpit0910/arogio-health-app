import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { activityReading, emptyActivity, parseActivityValue, stepDelta } from '../src/features/activity/model.ts';
import type { HealthSnapshot } from '../src/features/health-sync/model.ts';

describe('Daily activity sources and targets', () => {
  const day = '2026-10-29';
  const tracking = { goals: { Steps: 8000 }, days: [{ day, values: { Steps: 3000, ActiveCaloriesBurned: 120, Nutrition: 600 } }] };
  const phone = { enabled: true, totals: { [day]: 200 } };
  const snapshot: HealthSnapshot = { syncedAt: '2026-10-29T12:00:00Z', source: 'example.source', granted: ['Steps', 'Nutrition'], latestWeight: null, failed: [], days: [{ day, readings: { Steps: { value: 4000, sources: ['example.source'] }, Nutrition: { value: 700, sources: ['example.source'] } } }] };
  it('never adds phone, entered and connected counts together or falls back for missing connected data', () => {
    assert.equal(activityReading('Steps', day, 'manual', tracking, snapshot, phone).value, 200);
    assert.equal(activityReading('Steps', day, 'manual', tracking, snapshot, { ...phone, enabled: false }).value, 3000);
    assert.equal(activityReading('Steps', day, 'connected', tracking, snapshot, phone).value, 4000);
    assert.equal(activityReading('ActiveCaloriesBurned', day, 'connected', tracking, snapshot, phone).value, null);
    assert.equal(activityReading('Steps', day, 'connected', tracking, null, phone).value, null);
  });
  it('keeps food energy separate from active energy, and preserves missing versus a real zero', () => {
    assert.equal(activityReading('ActiveCaloriesBurned', day, 'manual', tracking, null, phone).value, 120);
    assert.equal(activityReading('Nutrition', day, 'manual', tracking, null, phone).value, 600);
    assert.equal(activityReading('Nutrition', day, 'connected', tracking, snapshot, phone).value, 700);
    assert.equal(activityReading('Steps', day, 'manual', emptyActivity(), null, { enabled: true, totals: {} }).value, null);
    assert.equal(activityReading('Steps', day, 'manual', emptyActivity(), null, { enabled: true, totals: { [day]: 0 } }).value, 0);
  });
  it('requires positive targets, allows clearing optional targets and validates units', () => {
    assert.equal(parseActivityValue('Steps', '', true), null);
    assert.equal(parseActivityValue('SleepSession', '7.5', true), 7.5);
    assert.equal(parseActivityValue('Nutrition', '600'), 600);
    assert.equal(parseActivityValue('Steps', '0'), 0);
    assert.throws(() => parseActivityValue('Steps', '0', true));
    assert.throws(() => parseActivityValue('Steps', '3.5'));
    assert.throws(() => parseActivityValue('SleepSession', '25'));
    assert.throws(() => parseActivityValue('Distance', 'Infinity'));
  });
  it('counts only new sensor increments, ignores duplicate or invalid samples and handles a reset', () => {
    assert.deepEqual(stepDelta(0, 10), { previous: 10, delta: 10 });
    assert.deepEqual(stepDelta(10, 15), { previous: 15, delta: 5 });
    assert.deepEqual(stepDelta(15, 15), { previous: 15, delta: 0 });
    assert.deepEqual(stepDelta(15, 0), { previous: 0, delta: 0 });
    assert.deepEqual(stepDelta(15, NaN), { previous: 15, delta: 0 });
  });
});
