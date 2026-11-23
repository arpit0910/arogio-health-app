import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readMedicineAction, medicineActionRequest } from '../src/features/personal-wellness/medicineNotificationAction.ts';
import { createMedicineActionQueue } from '../src/features/personal-wellness/medicineActionQueue.ts';

const owner = 'account-a', medicineId = '00000000-0000-4000-8000-000000000001';
const data = { owner, medicineId, day: '2026-11-16', time: '14:30', wellness: true, route: '/medicines' };
const identifier = `arogio-wellness:${owner}:medicine:${medicineId}:${data.day}:${data.time}`;
const action = (name = 'medicine_take', delivered = 1234) => readMedicineAction(owner, identifier, delivered, name, data)!;

test('notification buttons target the exact scheduled dose and the existing dose log API', () => {
  assert.deepEqual(medicineActionRequest(action()).body, { status: 'taken' });
  assert.deepEqual(medicineActionRequest(action('medicine_skip')).body, { status: 'skipped' });
  assert.deepEqual(medicineActionRequest(action('medicine_snooze')).body, { status: 'pending', snooze: true });
  assert.equal(medicineActionRequest(action()).path, `/wellness/medicines/${medicineId}/doses/2026-11-16/14:30`);
});

test('another account, refill notifications, malformed doses and ordinary taps cannot log a dose', () => {
  assert.equal(readMedicineAction('account-b', identifier, 1234, 'medicine_take', data), null);
  assert.equal(readMedicineAction(owner, identifier.replace('medicine:', 'refill:'), 1234, 'medicine_take', data), null);
  assert.equal(readMedicineAction(owner, identifier, 1234, 'default', data), null);
  assert.equal(readMedicineAction(owner, identifier, 1234, 'medicine_take', { ...data, time: '25:00' }), null);
  assert.equal(readMedicineAction(owner, identifier, 1234, 'medicine_take', { ...data, medicineId: '../../other' }), null);
});

test('durable outbox survives restart, serializes duplicate callbacks and isolates accounts', async () => {
  const values = new Map<string, string>();
  const storage = { get: async (key: string) => values.get(key) ?? null, set: async (key: string, value: string) => { values.set(key, value); } };
  const queue = createMedicineActionQueue(storage);
  await Promise.all([queue.enqueue(action()), queue.enqueue(action())]);
  assert.equal((await queue.list(owner)).length, 1);
  assert.equal((await queue.list('account-b')).length, 0);
  const restarted = createMedicineActionQueue(storage);
  assert.equal((await restarted.list(owner)).length, 1);
  await restarted.complete(owner, action().id);
  await restarted.enqueue(action());
  assert.equal((await restarted.list(owner)).length, 0);
  // A newly delivered snooze for the same dose is a distinct event.
  await restarted.enqueue(action('medicine_snooze', 5678));
  assert.equal((await restarted.list(owner)).length, 1);
});

test('a storage failure does not acknowledge or discard the action and can be retried', async () => {
  let fail = true, value: string | null = null;
  const queue = createMedicineActionQueue({ get: async () => value, set: async (_key, next) => { if (fail) throw new Error('storage full'); value = next; } });
  await assert.rejects(queue.enqueue(action()), /storage full/);
  fail = false;
  await queue.enqueue(action());
  assert.equal((await queue.list(owner)).length, 1);
});


test('full-screen snooze preserves the user-selected duration in the retry request', () => {
  assert.deepEqual(medicineActionRequest({ ...action('medicine_snooze'), snoozeMinutes: 30 }).body, { status: 'pending', snooze: true, snoozeMinutes: 30 });
  assert.deepEqual(medicineActionRequest({ ...action('medicine_take'), snoozeMinutes: 30 }).body, { status: 'taken' });
});
