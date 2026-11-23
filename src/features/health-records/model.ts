import { z } from 'zod';
export const recordKinds = ['Lab report', 'Prescription', 'Discharge summary', 'Other'] as const;
export const recordSchema = z.object({
  id: z.string().uuid(), title: z.string().trim().min(1).max(100), kind: z.enum(recordKinds),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(day => Number.isFinite(Date.parse(`${day}T12:00:00Z`)) && new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10) === day),
  notes: z.string().trim().max(300), name: z.string().max(150),
  mime: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  size: z.number().int().positive().max(20 * 1024 * 1024), createdAt: z.string().datetime(),
});
export type HealthRecord = z.infer<typeof recordSchema>;
export const recordListSchema = z.array(recordSchema).max(25);
export const recordExtension = (mime: HealthRecord['mime']) => ({ 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' })[mime];
export function recordMime(bytes: Uint8Array): HealthRecord['mime'] {
  const starts = (values: number[], offset = 0) => values.every((value, index) => bytes[index + offset] === value);
  if (starts([37, 80, 68, 70, 45])) return 'application/pdf';
  if (starts([255, 216, 255])) return 'image/jpeg';
  if (starts([137, 80, 78, 71, 13, 10, 26, 10])) return 'image/png';
  if (starts([82, 73, 70, 70]) && starts([87, 69, 66, 80], 8)) return 'image/webp';
  throw new Error('Choose a PDF, JPG, PNG or WebP document.');
}

export function createRecordStore(adapter: {
  read: (owner: string) => Promise<unknown>; write: (owner: string, records: HealthRecord[]) => Promise<void>;
  copy: (owner: string, record: HealthRecord, source: string) => Promise<void>;
  remove: (owner: string, record: HealthRecord) => Promise<void>;
}) {
  let serial: Promise<unknown> = Promise.resolve();
  const ownerKey = (owner: string) => { if (!z.string().uuid().safeParse(owner).success) throw new Error('Sign in again to manage your records.'); return owner; };
  const list = async (owner: string) => recordListSchema.parse(await adapter.read(ownerKey(owner)));
  function mutate<T>(action: () => Promise<T>) { const task = serial.catch(() => {}).then(action); serial = task; return task; }
  return {
    list: async (owner: string) => { await serial.catch(() => {}); return list(owner); },
    add: (owner: string, input: HealthRecord, source: string) => mutate(async () => {
      const record = recordSchema.parse(input), records = await list(owner);
      if (records.length >= 25) throw new Error('You can keep up to 25 records on this device. Remove an old record first.');
      if (records.some(item => item.id === record.id)) throw new Error('This record is already saved.');
      try { await adapter.copy(owner, record, source); await adapter.write(owner, [record, ...records]); }
      catch (error) { await adapter.remove(owner, record).catch(() => {}); throw error; }
      return record;
    }),
    remove: (owner: string, id: string) => mutate(async () => {
      const records = await list(owner), record = records.find(item => item.id === id);
      if (!record) return;
      await adapter.remove(owner, record);
      await adapter.write(owner, records.filter(item => item.id !== id));
    }),
    clear: (owner: string) => mutate(async () => {
      const records = await list(owner);
      for (const record of records) await adapter.remove(owner, record);
      await adapter.write(owner, []);
    }),
  };
}
