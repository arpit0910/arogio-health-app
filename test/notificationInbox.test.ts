import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mergeInbox, type InboxItem } from '../src/features/notifications/model.ts';
const now = 1800000000000;
const item = (id: string, at = now - 1000, read = false): InboxItem => ({ id, at, read, title: 'Water', body: 'Drink water', route: '/water' });
describe('notification inbox history', () => {
  it('deduplicates scheduled and received reminders while read status can only advance', () => {
    const read = mergeInbox([item('same')], [item('same', now - 1000, true)], now);
    assert.equal(read.length, 1); assert.equal(read[0].read, true);
    assert.equal(mergeInbox(read, [item('same')], now)[0].read, true);
  });
  it('keeps future scheduling separate from 120 recent past reminders', () => {
    const past = Array.from({ length: 130 }, (_, i) => item(`past${i}`, now - i * 1000));
    const future = Array.from({ length: 60 }, (_, i) => item(`future${i}`, now + (i + 1) * 1000));
    const merged = mergeInbox(past, future, now);
    assert.equal(merged.filter(i => i.at <= now).length, 120);
    assert.equal(merged.filter(i => i.at > now).length, 60);
    assert.ok(merged.some(i => i.id === 'past0'));
    assert.ok(!merged.some(i => i.id === 'past129'));
  });
  it('drops reminders older than 90 days', () => {
    assert.equal(mergeInbox([item('old', now - 91 * 86400000)], [item('new')], now).length, 1);
  });
});
