import { MEDICINE_CATEGORY, medicineActions, readMedicineAction } from './medicineNotificationAction';
import { medicineActionQueue } from './medicineActionStorage';
import { replacePending } from '../notifications/storage';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, AndroidNotificationVisibility, clearLastNotificationResponse } from 'expo-notifications';
import { AppState, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Reminder } from './reminderPlan';
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
const prefix = 'arogio-wellness:';
let generation = 0;
let queue: Promise<string | null> = Promise.resolve(null);
export const WATER_SOUND = 'water_drop.wav';
export const WATER_CHANNEL = 'water-reminders-v1';
async function channel() {
  await Notifications.setNotificationCategoryAsync(MEDICINE_CATEGORY, medicineActions.map(action => ({ ...action, options: { opensAppToForeground: true, isAuthenticationRequired: true } })), { previewPlaceholder: 'Medicine reminder' });
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('medicine-gentle-v1', { name: 'Gentle medicine reminders', importance: AndroidImportance.DEFAULT, sound: 'default', enableVibrate: false, lockscreenVisibility: AndroidNotificationVisibility.PRIVATE });
  await Notifications.setNotificationChannelAsync('medicine-vibrate-v1', { name: 'Vibrating medicine reminders', importance: AndroidImportance.HIGH, sound: null, enableVibrate: true, vibrationPattern: [0, 250, 250, 250], lockscreenVisibility: AndroidNotificationVisibility.PRIVATE });
  await Notifications.setNotificationChannelAsync('wellness', { name: 'Wellness reminders', importance: AndroidImportance.HIGH, sound: 'default', lockscreenVisibility: AndroidNotificationVisibility.PRIVATE });
  // New stable ID: Android cannot replace the sound of the existing wellness channel.
  // Reusing this ID preserves the user's own mute and sound choices on later launches.
  await Notifications.setNotificationChannelAsync(WATER_CHANNEL, { name: 'Water reminders', description: 'Drinking reminders with a short water-drop sound', importance: AndroidImportance.HIGH, sound: WATER_SOUND, lockscreenVisibility: AndroidNotificationVisibility.PRIVATE });
}
export async function requestReminderPermission(request = true) {
  try { await channel(); const current = await Notifications.getPermissionsAsync(); return current.granted || (request && (await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } })).granted); }
  catch { return false; }
}
export async function openReminderSettings(target: 'water' | 'wellness' | 'all' = 'water') {
  const packageName = Constants.expoConfig?.android?.package;
  if (target !== 'all' && Platform.OS === 'android' && packageName) {
    await channel();
    try { await Linking.sendIntent('android.settings.CHANNEL_NOTIFICATION_SETTINGS', [
      { key: 'android.provider.extra.APP_PACKAGE', value: packageName },
      { key: 'android.provider.extra.CHANNEL_ID', value: target === 'water' ? WATER_CHANNEL : 'wellness' },
    ]); return; } catch { /* Older device settings can fall back to app settings. */ }
  }
  await Linking.openSettings();
}
export function syncNotifications(owner: string | null, reminders: Reminder[]): Promise<string | null> {
  const turn = ++generation;
  queue = queue.catch(() => null).then(async () => {
    if (turn !== generation) return null;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const account of new Set(scheduled.filter(item => item.identifier.startsWith(prefix)).map(item => item.identifier.slice(prefix.length).split(':')[0]))) await replacePending(account, []).catch(() => {});
    for (const item of scheduled) if (item.identifier.startsWith(prefix)) await Notifications.cancelScheduledNotificationAsync(item.identifier);
    if (!owner || turn !== generation) return null;
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return reminders.length ? 'Notifications are off. Enable them in your device settings, then reopen Arogio.' : null;
    await channel();
    await replacePending(owner, []).catch(() => {});
    const planned: import('../notifications/model').InboxItem[] = [];
    for (const reminder of reminders) {
      if (turn !== generation) return null;
      await Notifications.scheduleNotificationAsync({ identifier: `${prefix}${owner}:${reminder.id}`, content: { title: reminder.title, body: reminder.body, sound: reminder.route === '/water' ? WATER_SOUND : reminder.alertType === 'vibrate' ? false : 'default', categoryIdentifier: reminder.dose ? MEDICINE_CATEGORY : undefined, data: { route: reminder.route, wellness: true, owner, ...reminder.dose } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(reminder.at), channelId: reminder.route === '/water' ? WATER_CHANNEL : reminder.alertType === 'gentle' ? 'medicine-gentle-v1' : reminder.alertType === 'vibrate' ? 'medicine-vibrate-v1' : 'wellness' } });
      planned.push({ id: `${prefix}${owner}:${reminder.id}`, title: reminder.title, body: reminder.body, at: new Date(reminder.at).getTime(), route: reminder.route, read: false });
    }
    await replacePending(owner, planned).catch(() => {});
    return null;
  });
  return queue;
}
export function listenForReminder(navigate: (route: '/water' | '/cycle' | '/medicines') => void, owner: string, changed: () => void, failed: (message: string) => void, due?: (dose: import('./medicineNotificationAction').MedicineNotificationAction) => void) {
  let alive = true;
  let responses = Promise.resolve();
  const handle = (response: Notifications.NotificationResponse | null) => {
    if (!response) return;
    responses = responses.catch(() => {}).then(async () => {
      if (!alive) return;
      const request = response.notification.request, data = request.content.data;
      if (!request.identifier.startsWith(`${prefix}${owner}:`) || !data?.wellness || !['/water', '/cycle', '/medicines'].includes(String(data.route))) return;
      const action = readMedicineAction(owner, request.identifier, response.notification.date, response.actionIdentifier, data);
      if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER && !action) return;
      if (action) await medicineActionQueue.enqueue(action);
      // Do not clear a newer response that arrived while secure storage was writing.
      const latest = await Notifications.getLastNotificationResponseAsync();
      if (latest?.notification.request.identifier === request.identifier && latest.actionIdentifier === response.actionIdentifier && latest.notification.date === response.notification.date) clearLastNotificationResponse();
      if (!alive) return;
      const reminder = !action && due ? readMedicineAction(owner, request.identifier, response.notification.date, 'medicine_take', data) : null;
      if (reminder && due) due(reminder); else navigate(data.route as '/water' | '/cycle' | '/medicines');
      if (action) changed();
    }).catch(() => { if (alive) failed('Your medicine action could not be saved on this phone. Open the medicine log and try again.'); });
  };
  void Notifications.getLastNotificationResponseAsync().then(handle).catch(() => { if (alive) failed('Unable to read the reminder action. Check your medicine log.'); });
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  const received = Notifications.addNotificationReceivedListener(notification => {
    if (!alive || AppState.currentState !== 'active' || !due) return;
    const reminder = readMedicineAction(owner, notification.request.identifier, notification.date, 'medicine_take', notification.request.content.data ?? {});
    if (reminder) due(reminder);
  });
  return () => { alive = false; subscription.remove(); received.remove(); };
}


export async function getNotificationAccess(): Promise<import('./notificationAccess').NotificationAccess> { const status = await Notifications.getPermissionsAsync(); return status.granted ? 'allowed' : status.canAskAgain ? 'not-requested' : 'blocked'; }


export async function getReminderSoundStatus(): Promise<string> {
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return 'Notifications are off. Allow notifications in device settings.';
  if (Platform.OS === 'ios') return permission.ios?.allowsSound === false
    ? 'Notification sounds are off in iPhone settings. Enable Sounds for Arogio.'
    : 'Notification sounds are allowed. Check notification volume, silent mode and Focus if reminders are quiet.';
  if (Platform.OS !== 'android') return 'Sound settings are available in the mobile app.';
  await channel();
  const channels = await Promise.all([Notifications.getNotificationChannelAsync(WATER_CHANNEL), Notifications.getNotificationChannelAsync('wellness')]);
  const silent = channels.map((item, index) => !item || !item.sound || item.importance < AndroidImportance.DEFAULT ? index === 0 ? 'Water' : 'Medicine and cycle' : null).filter(Boolean);
  return silent.length ? `${silent.join(' and ')} reminders are set to silent or blocked. Open the matching sound settings below and choose an alert sound.`
    : 'Reminder channels have sound enabled. Check notification volume and Do Not Disturb if the test is quiet.';
}

export async function testReminderSound(target: 'water' | 'wellness' = 'water'): Promise<void> {
  if (!(await requestReminderPermission(false))) throw new Error('Allow notification access in device settings before testing sound.');
  await Notifications.scheduleNotificationAsync({
    identifier: `arogio-sound-test:${target}`,
    content: { title: 'Arogio sound test', body: 'This is a test reminder. You should hear your selected notification sound.', sound: target === 'water' ? WATER_SOUND : 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: target === 'water' ? WATER_CHANNEL : 'wellness' },
  });
}

export async function dismissMedicineNotification(identifier: string) { await Notifications.dismissNotificationAsync(identifier); }
