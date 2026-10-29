import type { Reminder } from './reminderPlan';
export async function requestReminderPermission(): Promise<boolean> { return false; }
export async function syncNotifications(_owner: string | null, _reminders: Reminder[]): Promise<string | null> { return 'Device reminders are available in the Android and iOS app.'; }
export function listenForReminder(_navigate: (route: '/water' | '/cycle' | '/medicines') => void): () => void { return () => {}; }

export async function openReminderSettings(_target: 'water' | 'all' = 'water'): Promise<void> { throw new Error('Notification settings are available in the Android and iOS app.'); }
