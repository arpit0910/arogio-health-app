import { Directory, File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { createRecordStore, recordExtension, recordMime, type HealthRecord } from './model';
const directory = (owner: string) => new Directory(Paths.document, 'health-records', owner);
const file = (owner: string, record: HealthRecord) => new File(directory(owner), `${record.id}.${recordExtension(record.mime)}`);
export const recordsAvailable = true;
const indexKey = (owner: string) => `arogio.record-index.${owner}`;
const metadataKey = (owner: string, id: string) => `arogio.record.${owner}.${id}`;
async function index(owner: string) { return z.array(z.string().uuid()).max(25).parse(JSON.parse(await SecureStore.getItemAsync(indexKey(owner)) ?? '[]')); }
export const recordStore = createRecordStore({
  read: async owner => (await Promise.all((await index(owner)).map(async id => {
    const raw = await SecureStore.getItemAsync(metadataKey(owner, id));
    return raw ? JSON.parse(raw) : null;
  }))).filter(Boolean),
  write: async (owner, records) => {
    const previous = await index(owner);
    for (const record of records) await SecureStore.setItemAsync(metadataKey(owner, record.id), JSON.stringify(record));
    await SecureStore.setItemAsync(indexKey(owner), JSON.stringify(records.map(record => record.id)));
    for (const id of previous.filter(id => !records.some(record => record.id === id))) await SecureStore.deleteItemAsync(metadataKey(owner, id));
  },
  copy: async (owner, record, uri) => {
    const source = new File(uri);
    if (!source.exists || source.size <= 0 || source.size > 20 * 1024 * 1024) throw new Error('Choose a document smaller than 20 MB.');
    if (recordMime(await source.bytes()) !== record.mime) throw new Error('This document type does not match its contents.');
    const target = directory(owner); target.create({ intermediates: true, idempotent: true });
    await source.copy(file(owner, record));
  },
  remove: async (owner, record) => { const target = file(owner, record); if (target.exists) target.delete(); await SecureStore.deleteItemAsync(metadataKey(owner, record.id)); },
});
export async function readPickedRecord(uri: string) {
  const source = new File(uri);
  if (!source.exists || source.size <= 0 || source.size > 20 * 1024 * 1024) throw new Error('Choose a document smaller than 20 MB.');
  return { mime: recordMime(await source.bytes()), size: source.size };
}
export async function openRecord(owner: string, record: HealthRecord, share = false) {
  const target = file(owner, record);
  if (!target.exists) throw new Error('This document is missing from this phone. Remove the record and add it again.');
  if (share) {
    const Sharing = await import('expo-sharing');
    if (!await Sharing.isAvailableAsync()) throw new Error('Sharing is not available on this phone.');
    await Sharing.shareAsync(target.uri, { mimeType: record.mime, dialogTitle: record.title });
  } else {
    if (!await target.canPreview({ mimeType: record.mime })) throw new Error('No document viewer is available. Use Share to open the file in another app.');
    await target.preview({ mimeType: record.mime, title: record.title });
  }
}
