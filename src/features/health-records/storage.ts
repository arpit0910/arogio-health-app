import type { HealthRecord } from './model';
export const recordsAvailable = false;
const unavailable = async (): Promise<never> => { throw new Error('Document records are available in the Android and iPhone app.'); };
export const recordStore = { list: async (_owner: string): Promise<HealthRecord[]> => [], add: async (_owner: string, _record: HealthRecord, _uri: string) => unavailable(), remove: async (_owner: string, _id: string) => unavailable(), clear: async (_owner: string) => unavailable() };
export const readPickedRecord = async (_uri: string): Promise<{ mime: HealthRecord['mime']; size: number }> => unavailable();
export const openRecord = async (_owner: string, _record: HealthRecord, _share = false) => unavailable();
