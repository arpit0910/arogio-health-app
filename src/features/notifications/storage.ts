import type { InboxItem } from './model';
export async function loadInbox(_owner: string): Promise<InboxItem[]> { return []; }
export async function readInbox(_owner: string, _id?: string): Promise<void> {}
export async function replacePending(_owner: string, _items: InboxItem[]): Promise<void> {}
export function observeInbox(_owner: string, _changed: () => void) { return () => {}; }
