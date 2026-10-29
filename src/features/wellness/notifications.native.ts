import { replacePending } from '../notifications/storage';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, AndroidNotificationVisibility, clearLastNotificationResponse } from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Reminder } from './reminderPlan';
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
const prefix = 'arogio-wellness:';
let generation = 0;
let queue: Promise<string | null> = Promise.resolve(null);
export const WATER_SOUND = 'water_drop.wav';
export const WATER_CHANNEL = 'water-reminders-v1';
async function channel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('wellness', { name: 'Wellness reminders', importance: AndroidImportance.DEFAULT, lockscreenVisibility: AndroidNotificationVisibility.PRIVATE });
  // New stable ID: Android cannot replace the sound of the existing wellness channel.
  // Reusing this ID preserves the user's own mute and sound choices on later launches.
  await Notifications.setNotificationChannelAsync(WATER_CHANNEL, { name: 'Water reminders', description: 'Drinking reminders with a short water-drop sound', importance: AndroidImportance.DEFAULT, sound: WATER_SOUND, lockscreenVisibility: AndroidNotificationVisibility.PRIVATE });
}
export async function requestReminderPermission() {
  try { await channel(); const current = await Notifications.getPermissionsAsync(); return current.granted || (await Notifications.requestPermissionsAsync()).granted; }
  catch { return false; }
}
export async function openReminderSettings(target: 'water' | 'all' = 'water') {
  const packageName = Constants.expoConfig?.android?.package;
  if (target === 'water' && Platform.OS === 'android' && packageName) {
    await channel();
    try { await Linking.sendIntent('android.settings.CHANNEL_NOTIFICATION_SETTINGS', [
      { key: 'android.provider.extra.APP_PACKAGE', value: packageName },
      { key: 'android.provider.extra.CHANNEL_ID', value: WATER_CHANNEL },
    ]); return; } catch { /* Older device settings can fall back to app settings. */ }
  }
  await Linking.openSettings();
}
export function syncNotifications(owner: string | null, reminders: Reminder[]): Promise<string | null> {
  const turn = ++generation;
  queue = queue.catch(() => null).then(async () => {
    if (turn !== generation) return null;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const account of new Set(scheduled.filter(item => item.identifier.startsWith(prefix)).map(item => item.identifier.slice(prefix.length).split(':')[0]))) await replacePending(account, []);
    for (const item of scheduled) if (item.identifier.startsWith(prefix)) await Notifications.cancelScheduledNotificationAsync(item.identifier);
    if (!owner || turn !== generation) return null;
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return reminders.length ? 'Notifications are off. Enable them in your device settings, then reopen Arogio.' : null;
    await channel();
    await replacePending(owner, []);
    const planned: import('../notifications/model').InboxItem[] = [];
    for (const reminder of reminders) {
      if (turn !== generation) return null;
      await Notifications.scheduleNotificationAsync({ identifier: `${prefix}${owner}:${reminder.id}`, content: { title: reminder.title, body: reminder.body, sound: reminder.route === '/water' ? WATER_SOUND : 'default', data: { route: reminder.route, wellness: true } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(reminder.at), channelId: reminder.route === '/water' ? WATER_CHANNEL : 'wellness' } });
      planned.push({ id: `${prefix}${owner}:${reminder.id}`, title: reminder.title, body: reminder.body, at: new Date(reminder.at).getTime(), route: reminder.route, read: false });
    }
    await replacePending(owner, planned);
    return null;
  });
  return queue;
}
export function listenForReminder(navigate: (route: '/water' | '/cycle' | '/medicines') => void) {
  let last: string | undefined;
  const handle = (response: Notifications.NotificationResponse | null) => { if (!response || response.notification.request.identifier === last) return; const data = response.notification.request.content.data; if (data?.wellness && (data.route === '/water' || data.route === '/cycle' || data.route === '/medicines')) { last = response.notification.request.identifier; navigate(data.route); clearLastNotificationResponse(); } };
  void Notifications.getLastNotificationResponseAsync().then(handle);
  const subscription = Notifications.addNotificationResponseReceivedListener(handle); return () => subscription.remove();
}


export async function getNotificationAccess(): Promise<import('./notificationAccess').NotificationAccess> { const status = await Notifications.getPermissionsAsync(); return status.granted ? 'allowed' : status.canAskAgain ? 'not-requested' : 'blocked'; }
