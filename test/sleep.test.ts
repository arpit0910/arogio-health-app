import { it } from 'node:test';
import assert from 'node:assert/strict';
import { sleepIntervals } from '../src/features/health-sync/sleep.ts';
it('keeps overnight sleep whole on wake-up day and merges duplicates and naps', () => {
  const night = { startTime: '2026-11-01T17:00:00.000Z', endTime: '2026-11-02T02:00:00.000Z' };
  const nap = { startTime: '2026-11-02T08:00:00.000Z', endTime: '2026-11-02T09:00:00.000Z' };
  assert.deepEqual(sleepIntervals([night, night, nap], '2026-11-01T18:30:00.000Z', '2026-11-02T18:30:00.000Z'), [night, nap]);
  assert.deepEqual(sleepIntervals([night], '2026-10-31T18:30:00.000Z', '2026-11-01T18:30:00.000Z'), []);
});
