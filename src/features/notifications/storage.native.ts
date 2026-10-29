import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { mergeInbox, type InboxItem } from './model';
let queue: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();
const key = (owner: string) => `arogio.inbox.${owner}`;
async function load(owner: string): Promise<InboxItem[]> {
  const raw = await SecureStore.getItemAsync(key(owner));
  if (!raw) return [];
  try {
    const items: unknown = JSON.parse(raw);
    return Array.isArray(items) ? items.filter((i): i is InboxItem => i && typeof i.id === 'string' && typeof i.title === 'string' && typeof i.body === 'string' && Number.isFinite(i.at) && typeof i.read === 'boolean' && ['/water', '/cycle', '/medicines'].includes(i.route)) : [];
  } catch { return []; }
}
function mutate(owner: string, change: (items: InboxItem[]) => InboxItem[]) {
  const task = queue.catch(() => {}).then(async () => {
    const next = change(await load(owner));
    await SecureStore.setItemAsync(key(owner), JSON.stringify(next));
    listeners.forEach(fn => fn());
  });
  queue = task; return task;
}
export async function loadInbox(owner: string) {
  await queue.catch(() => {});
  return mergeInbox(await load(owner), []).filter(item => item.at <= Date.now());
}
export async function readInbox(owner: string, id?: string) {
  await mutate(owner, items => items.map(item => (id ? item.id === id : item.at <= Date.now()) ? { ...item, read: true } : item));
}
export async function replacePending(owner: string, pending: InboxItem[]) {
  await mutate(owner, items => mergeInbox(items.filter(item => item.at <= Date.now()), pending));
}
export function observeInbox(owner: string, changed: () => void) {
  let alive = true;
  listeners.add(changed);
  const accept = (notification: Notifications.Notification, read = false) => {
    const { identifier, content } = notification.request;
    const route = content.data?.route;
    if (!alive || !identifier.startsWith(`arogio-wellness:${owner}:`) || (route !== '/water' && route !== '/cycle' && route !== '/medicines')) return;
    void mutate(owner, items => {
      const prior = items.find(item => item.id === identifier);
      return mergeInbox(items, [{ id: identifier, title: content.title ?? 'Arogio reminder', body: content.body ?? '', route, at: prior?.at ?? notification.date, read: read || prior?.read || false }]);
    }).catch(() => {});
  };
  const received = Notifications.addNotificationReceivedListener(n => accept(n));
  const response = Notifications.addNotificationResponseReceivedListener(r => accept(r.notification, true));
  void Notifications.getPresentedNotificationsAsync().then(items => items.forEach(n => accept(n))).catch(() => {});
  void Notifications.getLastNotificationResponseAsync().then(r => { if (r) accept(r.notification, true); }).catch(() => {});
  return () => { alive = false; listeners.delete(changed); received.remove(); response.remove(); };
}
