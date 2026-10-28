import * as Notifications from 'expo-notifications';
import { AndroidImportance, AndroidNotificationVisibility, clearLastNotificationResponse } from 'expo-notifications';
import { Platform } from 'react-native';
import type { Reminder } from './reminderPlan';
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
const prefix = 'arogio-wellness:';
let generation = 0;
let queue: Promise<string | null> = Promise.resolve(null);
async function channel() { if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('wellness', { name: 'Wellness reminders', importance: AndroidImportance.DEFAULT, lockscreenVisibility: AndroidNotificationVisibility.PRIVATE }); }
export async function requestReminderPermission() { await channel(); const current = await Notifications.getPermissionsAsync(); return current.granted || (await Notifications.requestPermissionsAsync()).granted; }
export function syncNotifications(owner: string | null, reminders: Reminder[]): Promise<string | null> {
  const turn = ++generation;
  queue = queue.catch(() => null).then(async () => {
    if (turn !== generation) return null;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of scheduled) if (item.identifier.startsWith(prefix)) await Notifications.cancelScheduledNotificationAsync(item.identifier);
    if (!owner || turn !== generation) return null;
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return reminders.length ? 'Notifications are off. Enable them in your device settings, then reopen Arogio.' : null;
    await channel();
    for (const reminder of reminders) {
      if (turn !== generation) return null;
      await Notifications.scheduleNotificationAsync({ identifier: `${prefix}${owner}:${reminder.id}`, content: { title: reminder.title, body: reminder.body, sound: 'default', data: { route: reminder.route, wellness: true } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(reminder.at), channelId: 'wellness' } });
    }
    return null;
  });
  return queue;
}
export function listenForReminder(navigate: (route: '/water' | '/cycle') => void) {
  let last: string | undefined;
  const handle = (response: Notifications.NotificationResponse | null) => { if (!response || response.notification.request.identifier === last) return; const data = response.notification.request.content.data; if (data?.wellness && (data.route === '/water' || data.route === '/cycle')) { last = response.notification.request.identifier; navigate(data.route); clearLastNotificationResponse(); } };
  void Notifications.getLastNotificationResponseAsync().then(handle);
  const subscription = Notifications.addNotificationResponseReceivedListener(handle); return () => subscription.remove();
}

