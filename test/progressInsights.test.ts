import { it } from 'node:test';
import assert from 'node:assert/strict';
import { progressInsights, healthSummary } from '../src/features/health-connections/insights.ts';
import { readHealthSnapshot, mergeHealthSnapshot, type HealthSnapshot } from '../src/features/health-connections/model.ts';

const snapshot: HealthSnapshot = { syncedAt: '2026-11-10T06:00:00Z', source: 'example.app', granted: ['Steps'], latestWeight: null, failed: [],
  days: [8000, null, 0, 4000].map((value, i) => ({ day: `2026-11-${String(7 + i).padStart(2, '0')}`, readings: { Steps: { value, sources: ['example.app'] } } })) };
it('explains goals using recorded completed days and keeps a true zero', () => {
  const insight = progressInsights(snapshot, 'Steps', 8000, '2026-11-10');
  assert.equal(insight.average, 4000);
  assert.equal(insight.completed, 2);
  assert.equal(insight.goalDays, 1);
  assert.equal(insight.remaining, 4000);
  assert.equal(progressInsights(snapshot, 'Steps', undefined, '2026-11-10').remaining, null);
});
it('sorts comparisons, excludes future or invalid readings and avoids invented goal advice', () => {
  const reversed = { ...snapshot, days: [...snapshot.days].reverse() };
  assert.equal(healthSummary(reversed, 'Steps', '2026-11-10').comparison?.difference, -8000);
  assert.equal(healthSummary(snapshot, 'Steps', '2026-11-08').recorded, 1);
  assert.equal(progressInsights(snapshot, 'Nutrition', 2000, '2026-11-10').goalDays, null);
});
it('retains successful daily buckets when one native read fails, and merges only the failed cell', async () => {
  const next = await readHealthSnapshot({ granted: async () => ['Steps'], aggregate: async () => { throw new Error('unused'); }, latestWeight: async () => null,
    aggregateDays: async (_, ranges) => ranges.map((_, i) => i === ranges.length - 1 ? undefined : { value: 1000, sources: ['example.app'] }) }, ['Steps'], new Date('2026-11-10T06:00:00Z'), 'example.app');
  assert.deepEqual(next.failed, ['Steps']);
  const merged = mergeHealthSnapshot(snapshot, next);
  assert.equal(merged.days.at(-1)?.readings.Steps?.value, 4000);
  assert.equal(merged.days.at(-2)?.readings.Steps?.value, 1000);
  assert.equal(merged.days.at(-1)?.readings.Steps?.checkedAt, snapshot.syncedAt);
});
