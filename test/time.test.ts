import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { clockFrom12Hour, formatClock, formatDateTime, formatTime } from '../src/lib/time.ts';
import { localDay, waterDay, waterWindow, type WaterPlan } from '../src/features/wellness/domain.ts';
import { reminderPlan } from '../src/features/wellness/reminderPlan.ts';
import { emptyWellness, defaultCycleSettings } from '../src/features/wellness/domain.ts';

describe('IST clocks', () => {
  it('shows midnight and noon with explicit AM/PM and IST', () => {
    assert.equal(formatClock('00:00'), '12:00 AM IST');
    assert.equal(formatClock('12:00'), '12:00 PM IST');
    assert.equal(formatClock('23:05'), '11:05 PM IST');
    assert.equal(formatTime('2026-10-28T18:30:00Z'), '12:00 AM IST');
    assert.match(formatDateTime('2026-10-28T18:30:00Z'), /29 Oct 2026, 12:00 AM IST/);
  });
  it('converts twelve-hour inputs without accepting invalid times', () => {
    assert.equal(clockFrom12Hour('12','00','AM'), '00:00');
    assert.equal(clockFrom12Hour('12','00','PM'), '12:00');
    assert.equal(clockFrom12Hour('7','5','PM'), '19:05');
    for (const [h,m] of [['0','00'],['13','00'],['7','60'],['','15'],['3','-1']]) assert.equal(clockFrom12Hour(h,m,'AM'), null);
  });
  it('uses IST day boundaries and waking hours even for a legacy foreign plan', () => {
    const plan: WaterPlan = { version:'legacy', wakeTime:'07:00', sleepTime:'23:00', targetMl:2000, servingMl:250, timezone:'America/New_York', remindersEnabled:true, pausedUntil:null };
    const now = new Date('2026-10-28T19:00:00Z');
    assert.equal(localDay(now), '2026-10-29');
    assert.equal(waterDay(plan,now), '2026-10-29');
    assert.equal(waterWindow(plan,'2026-10-29').start.toISOString(), '2026-10-29T01:30:00.000Z');
    const data = { ...emptyWellness(), cycleSettings: { ...defaultCycleSettings('America/New_York'), remindersEnabled:true }, periods:[{id:'1',startDate:'2026-10-01',endDate:'2026-10-05'}] };
    assert.equal(reminderPlan(data,new Date('2026-10-25T00:00:00Z'))[0]?.at,'2026-10-27T03:30:00.000Z');
  });
});
