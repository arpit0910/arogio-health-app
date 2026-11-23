import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medicineSchedule } from '../src/features/personal-wellness/doseSchedule.ts';
import { reminderPlan } from '../src/features/personal-wellness/reminderPlan.ts';
import { emptyWellness } from '../src/features/personal-wellness/domain.ts';

test('dose completion and snooze affect the schedule and native reminder plan consistently', () => {
  const data = { ...emptyWellness(), medicines: [{ id: 'medicine', name: 'Fixture', enabled: true, notes: '', doses: [{ time: '10:00', amount: 'As prescribed' }, { time: '12:00', amount: 'As prescribed' }] }], medicineDoses: [
    { medicineId: 'medicine', day: '2026-11-14', time: '10:00', status: 'taken' as const, recordedAt: '2026-11-14T03:30:00Z', snoozedUntil: null },
    { medicineId: 'medicine', day: '2026-11-14', time: '12:00', status: 'pending' as const, recordedAt: '2026-11-14T03:30:00Z', snoozedUntil: '2026-11-14T03:45:00Z' },
  ] };
  const now = new Date('2026-11-14T03:30:00Z');
  const schedule = medicineSchedule(data, now);
  assert.equal(schedule[0].dose.time, '12:00');
  assert.equal(schedule[0].at, '2026-11-14T03:45:00Z');
  assert.equal(schedule[1].complete, true);
  const reminders = reminderPlan(data, now);
  assert.equal(reminders.some(item => item.id === 'medicine:medicine:2026-11-14:10:00'), false);
  assert.equal(reminders.find(item => item.id === 'medicine:medicine:2026-11-14:12:00')?.at, '2026-11-14T03:45:00Z');
  assert.equal(reminders.some(item => item.id === 'medicine:medicine:2026-11-15:10:00'), true);
});

test('snooze is limited to due, enabled, incomplete doses and stays within the IST day', () => {
  const data = { ...emptyWellness(), medicines: [{ id: 'medicine', name: 'Fixture', enabled: true, notes: '', doses: [{ time: '10:00', amount: 'As prescribed' }] }] };
  assert.equal(medicineSchedule(data, new Date('2026-11-14T04:00:00Z'))[0].canSnooze, false);
  assert.equal(medicineSchedule(data, new Date('2026-11-14T04:30:00Z'))[0].canSnooze, true);
  assert.equal(medicineSchedule(data, new Date('2026-11-14T18:20:00Z'))[0].canSnooze, false);
  data.medicines[0].enabled = false;
  assert.equal(medicineSchedule(data, new Date('2026-11-14T04:30:00Z'))[0].canSnooze, false);
});
