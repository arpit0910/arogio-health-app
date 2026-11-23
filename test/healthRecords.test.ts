import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRecordStore, recordMime, recordSchema, type HealthRecord } from '../src/features/health-records/model.ts';
const owner = '00000000-0000-4000-8000-000000000001', other = '00000000-0000-4000-8000-000000000002';
const record: HealthRecord = { id: '00000000-0000-4000-8000-000000000003', title: 'My report', kind: 'Lab report', day: '2026-11-17', notes: '', name: 'report.pdf', mime: 'application/pdf', size: 100, createdAt: '2026-11-17T12:00:00Z' };
test('document storage keeps accounts separate, persists records and removes saved files', async () => {
  const data = new Map<string, HealthRecord[]>(), files = new Set<string>();
  const store = createRecordStore({ read: async key => data.get(key) ?? [], write: async (key, value) => { data.set(key, value); }, copy: async (key, row) => { files.add(`${key}/${row.id}`); }, remove: async (key, row) => { files.delete(`${key}/${row.id}`); } });
  await store.add(owner, record, 'file://picker/report.pdf');
  assert.equal((await store.list(owner)).length, 1);
  assert.equal((await store.list(other)).length, 0);
  await store.remove(other, record.id);
  assert.equal(files.size, 1);
  await assert.rejects(store.add(owner, record, 'file://picker/report.pdf'), /already saved/);
  await assert.rejects(store.add('../other-account', record, 'file://picker/report.pdf'), /Sign in again/);
  await store.remove(owner, record.id);
  assert.equal((await store.list(owner)).length, 0);
  assert.equal(files.size, 0);
});
test('a metadata write failure rolls back the copied health document', async () => {
  let copied = false;
  const store = createRecordStore({ read: async () => [], write: async () => { throw new Error('Storage full'); }, copy: async () => { copied = true; }, remove: async () => { copied = false; } });
  await assert.rejects(store.add(owner, record, 'file://picker/report.pdf'), /Storage full/);
  assert.equal(copied, false);
});
test('files are classified by content and invalid documents, oversized files and impossible dates are rejected', () => {
  assert.equal(recordMime(new TextEncoder().encode('%PDF-1.7')), 'application/pdf');
  assert.equal(recordMime(new Uint8Array([255, 216, 255])), 'image/jpeg');
  assert.throws(() => recordMime(new TextEncoder().encode('<html>pretend PDF</html>')), /Choose a PDF/);
  assert.equal(recordSchema.safeParse({ ...record, size: 21 * 1024 * 1024 }).success, false);
  assert.equal(recordSchema.safeParse({ ...record, day: '2026-02-30' }).success, false);
  assert.equal(recordSchema.safeParse({ ...record, day: '2026-13-01' }).success, false);
});
