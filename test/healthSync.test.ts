import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatHealthValue,
  healthDayRanges,
  metricAverage,
  readHealthSnapshot,
  type HealthReader,
} from '../src/features/health-sync/model.ts';

describe('Device-only health analytics', () => {
  const now = new Date('2026-10-28T18:40:00Z');
  it('uses seven IST day windows, including a partial current day', () => {
    const ranges = healthDayRanges(now);
    assert.equal(ranges.length, 7);
    assert.equal(ranges[0].day, '2026-10-23');
    assert.equal(ranges[0].start, '2026-10-22T18:30:00.000Z');
    assert.equal(ranges[6].day, '2026-10-29');
    assert.equal(ranges[6].end, now.toISOString());
    ranges
      .slice(1)
      .forEach((range, index) => assert.equal(ranges[index].end, range.start));
  });
  it('checks granted access on every sync and never reads denied types', async () => {
    let permission = true;
    const calls: string[] = [];
    const reader: HealthReader = {
      granted: async () => (permission ? ['Steps'] : []),
      aggregate: async (metric) => {
        calls.push(metric);
        return { value: 100, sources: ['example.source'] };
      },
      latestWeight: async () => {
        throw new Error('Denied weight must not be read');
      },
    };
    const first = await readHealthSnapshot(reader, ['Steps', 'Weight'], now);
    assert.deepEqual(first.granted, ['Steps']);
    assert.equal(calls.length, 7);
    assert.ok(calls.every((metric) => metric === 'Steps'));
    permission = false;
    const revoked = await readHealthSnapshot(reader, ['Steps', 'Weight'], now);
    assert.deepEqual(revoked.granted, []);
    assert.ok(
      revoked.days.every((day) => Object.keys(day.readings).length === 0),
    );
    assert.equal(calls.length, 7);
  });
  it('preserves partial failures and missing readings instead of inventing zeros', async () => {
    const reader: HealthReader = {
      granted: async () => ['Steps', 'SleepSession', 'HeartRate'],
      aggregate: async (metric) => {
        if (metric === 'HeartRate')
          throw new Error('Permission revoked during read');
        return {
          value: metric === 'Steps' ? 0 : null,
          sources: metric === 'Steps' ? ['example.source'] : [],
        };
      },
      latestWeight: async () => null,
    };
    const result = await readHealthSnapshot(
      reader,
      ['Steps', 'SleepSession', 'HeartRate'],
      now,
    );
    assert.deepEqual(result.failed, ['HeartRate']);
    assert.equal(metricAverage(result, 'Steps')?.value, 0);
    assert.equal(metricAverage(result, 'SleepSession'), null);
    assert.equal(formatHealthValue('SleepSession', null), 'No data');
    assert.equal(formatHealthValue('SleepSession', 7.5), '7h 30m');
    assert.equal(formatHealthValue('Steps', 0), '0');
  });
  it('clears readings when permission is revoked during a sync', async () => {
    let checks = 0;
    const reader: HealthReader = {
      granted: async () => (++checks === 1 ? ['Steps', 'Weight'] : []),
      aggregate: async () => ({ value: 70, sources: ['example.source'] }),
      latestWeight: async () => ({
        kg: 70,
        at: now.toISOString(),
        source: 'example.source',
      }),
    };
    const result = await readHealthSnapshot(reader, ['Steps', 'Weight'], now);
    assert.deepEqual(result.granted, []);
    assert.equal(result.latestWeight, null);
    assert.ok(
      result.days.every((day) => Object.keys(day.readings).length === 0),
    );
  });
  it('reads recent weight separately from daily averages and does not request unselected data', async () => {
    let window = '';
    const reader: HealthReader = {
      granted: async () => ['Weight', 'Steps'],
      aggregate: async (metric) => {
        assert.equal(metric, 'Weight');
        return { value: 70, sources: ['example.source'] };
      },
      latestWeight: async (start) => {
        window = start;
        return { kg: 71, at: now.toISOString(), source: 'example.source' };
      },
    };
    const result = await readHealthSnapshot(reader, ['Weight'], now);
    assert.equal(result.latestWeight?.kg, 71);
    assert.equal(window, '2026-09-29T18:30:00.000Z');
    assert.deepEqual(result.granted, ['Weight']);
  });
});
