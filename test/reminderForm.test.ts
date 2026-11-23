import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newReminder, reminderStepError } from '../src/features/personal-wellness/reminderForm.ts';

test('a new reminder does not invent medicine names, doses or times', () => {
  const draft = newReminder('fixture');
  assert.equal(draft.name, '');
  assert.equal(draft.doses[0].time, '');
  assert.equal(draft.doses[0].amount, '');
  draft.name = 'Medicine from label';
  assert.equal(reminderStepError(draft, 0), null);
  assert.match(reminderStepError(draft, 1)!, /Choose a time/);
  draft.doses[0].time = '09:00';
  assert.match(reminderStepError(draft, 1)!, /amount/);
});
test('review catches duplicated times, incomplete recurring schedules and reversed dates', () => {
  const draft = newReminder('fixture');
  draft.name = 'Fixture'; draft.doses = [{ time: '09:00', amount: 'From label' }, { time: '09:00', amount: 'From label' }];
  assert.match(reminderStepError(draft, 1)!, /same time/);
  draft.doses.pop(); draft.recurrence = 'weekly';
  assert.match(reminderStepError(draft, 1)!, /at least one day/);
  draft.weekdays = [1];
  assert.equal(reminderStepError(draft, 1), null);
  draft.recurrence = 'cycle'; draft.cycleOnDays = 2; draft.cycleOffDays = 0;
  assert.match(reminderStepError(draft, 1)!, /pause days/);
  draft.cycleOffDays = 3; draft.startDate = '2026-11-20'; draft.endDate = '2026-11-19';
  assert.match(reminderStepError(draft, 2)!, /end date/);
});
