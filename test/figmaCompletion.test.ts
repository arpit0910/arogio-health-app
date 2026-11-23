import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyWellness, type Medicine } from '../src/features/personal-wellness/domain.ts';
import { medicineDueOn, doseQuantity } from '../src/features/personal-wellness/medicineRules.ts';
import { reminderPlan } from '../src/features/personal-wellness/reminderPlan.ts';
import { medicineSchedule } from '../src/features/personal-wellness/doseSchedule.ts';
import { activityPeriodDays, adherenceForDay } from '../src/features/activity/periodSummary.ts';
import { vitalsReportHtml } from '../src/features/activity/vitalsReport.ts';

test('weekly, cyclic, as-needed and course boundaries apply to both reminders and dose lists', () => {
  const m: Medicine = { id: 'test', name: 'Fixture', notes: '', enabled: true, startDate: '2026-11-16', endDate: '2026-11-22', recurrence: 'weekly', weekdays: [1], doses: [{ time: '10:00', amount: '1 tablet', meal: 'after' }] };
  assert.equal(medicineDueOn(m, '2026-11-16'), true);
  assert.equal(medicineDueOn(m, '2026-11-17'), false);
  assert.equal(medicineDueOn(m, '2026-11-23'), false);
  const data = { ...emptyWellness(), medicines: [m] };
  assert.equal(medicineSchedule(data, new Date('2026-11-17T00:00:00Z')).length, 0);
  const reminders = reminderPlan(data, new Date('2026-11-16T00:00:00Z'));
  assert.equal(reminders.length, 1);
  assert.match(reminders[0].body, /after food/);
  m.recurrence = 'cycle'; m.cycleOnDays = 2; m.cycleOffDays = 1;
  assert.equal(medicineDueOn(m, '2026-11-17'), true);
  assert.equal(medicineDueOn(m, '2026-11-18'), false);
  assert.equal(medicineDueOn(m, '2026-11-19'), true);
  m.recurrence = 'sos';
  assert.equal(reminderPlan(data, new Date('2026-11-16T00:00:00Z')).length, 0);
  assert.equal(doseQuantity('0.5 tablet'), 0.5);
  assert.equal(doseQuantity('as prescribed'), null);
});
test('period and adherence summaries use the requested dates and recorded taken status', () => {
  assert.equal(activityPeriodDays('2026-11-16', 'Day').length, 1);
  assert.equal(activityPeriodDays('2026-11-16', 'Week')[0], '2026-11-10');
  assert.equal(activityPeriodDays('2026-11-16', 'Month').length, 30);
  const data = { ...emptyWellness(), medicines: [{ id: 'a', name: 'Fixture', notes: '', enabled: false, doses: [{ time: '10:00', amount: '1 tablet' }] }], medicineDoses: [{ medicineId: 'a', day: '2026-11-16', time: '10:00', status: 'skipped' as const, recordedAt: '2026-11-16T00:00:00Z', snoozedUntil: null }] };
  assert.deepEqual(adherenceForDay(data, '2026-11-16'), { day: '2026-11-16', planned: 1, taken: 0 });
});
test('report escapes personal data and omits absent readings rather than inventing zeros', () => {
  const html = vitalsReportHtml('<script>unsafe</script>', emptyWellness(), null, new Date('2026-11-16T00:00:00Z'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('No readings available'));
  assert.ok(html.includes('not a diagnosis'));
});
