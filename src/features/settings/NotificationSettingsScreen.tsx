import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareRow, useCareStyles } from '../../components/app/CareUI';
import { AppIcon } from '../../components/app/AppIcon';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { useWellness } from '../wellness/WellnessContext';
import { getNotificationAccess, openReminderSettings, requestReminderPermission } from '../wellness/notifications';
import type { NotificationAccess } from '../wellness/notificationAccess';

export function NotificationSettingsScreen() {
  const c = useCareStyles(), colors = usePalette();
  const { data, loading, error: reminderError, refresh } = useWellness();
  const [access, setAccess] = useState<NotificationAccess | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const checkAccess = useCallback(async () => {
    try { setAccess(await getNotificationAccess()); setError(''); }
    catch { setError('Notification status could not be checked. Try again.'); }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void checkAccess(), 0);
    const sub = AppState.addEventListener('change', state => { if (state === 'active') { void checkAccess(); void refresh(); } });
    return () => { clearTimeout(timer); sub.remove(); };
  }, [checkAccess, refresh]);
  async function enable() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await requestReminderPermission(); await checkAccess(); await refresh(); }
    catch { setError('Notifications could not be enabled. Try again or open device settings.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function open(target: 'water' | 'all') {
    try { setError(''); await openReminderSettings(target); }
    catch { setError('Open Arogio in your device notification settings to manage permissions and sounds.'); }
  }
  const title = access === 'allowed' ? 'Notifications are allowed' : access === 'blocked' ? 'Notifications are off' : access === 'not-requested' ? 'Allow reminders when you’re ready' : access === 'unavailable' ? 'Reminders need the mobile app' : 'Checking notification access…';
  const enabledMedicines = data.medicines?.filter(m => m.enabled).length ?? 0;
  return <AppScreen back title="Notifications">
    <Text style={c.heading}>Reminder preferences</Text>
    <Text style={[c.text, { marginTop: 8 }]}>Manage reminder access here. Choose times and frequency inside each tracker.</Text>
    <View style={{ marginTop: 24, padding: 20, backgroundColor: colors.subtle, borderRadius: 16, gap: 12 }}>
      <AppIcon name="bell" size={28} /><Text accessibilityRole="header" style={c.title}>{title}</Text>
      <Text style={c.text}>{access === 'allowed' ? 'Only reminders you turn on in your trackers will be scheduled. Your device controls sound and delivery.' : access === 'unavailable' ? 'You can keep tracking here. Device reminders are available in the Android and iOS app.' : 'Tracking works with notifications off. You can allow access whenever you want reminders.'}</Text>
      {access === 'not-requested' && <Button title="Allow notifications" onPress={() => void enable()} loading={busy} />}
      {Platform.OS !== 'web' && access !== null && <Button title="Open device notification settings" variant="secondary" onPress={() => void open('all')} />}
      {!!error && <><Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{error}</Text><Button title="Check again" variant="secondary" onPress={() => void checkAccess()} /></>}
    </View>
    <View style={{ marginTop: 32 }}>
      <Text accessibilityRole="header" style={c.title}>Your reminders</Text>
      {!!reminderError && <View style={{ gap: 12, marginTop: 12 }}><Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>Reminder preferences could not be refreshed. Open a tracker to check your saved plan, or try again.</Text><Button title="Retry loading reminders" variant="secondary" loading={loading} onPress={() => void refresh()} /></View>}
      <CareRow icon="drop" title="Water" detail={reminderError ? 'Preferences unavailable - open tracker' : loading ? 'Loading preferences…' : data.waterPlan ? data.waterPlan.remindersEnabled ? 'On · Manage drinking hours and frequency' : 'Off · Manage your water plan' : 'Set up your water plan'} onPress={() => router.push('/water')} />
      <CareRow icon="pill" title="Medicines" detail={reminderError ? 'Preferences unavailable - open tracker' : loading ? 'Loading preferences…' : enabledMedicines ? `${enabledMedicines} medicine${enabledMedicines === 1 ? '' : 's'} with reminders on` : 'Add medicines and choose dose times'} onPress={() => router.push('/medicines')} />
      <CareRow icon="calendar" title="Cycle tracking" detail={reminderError ? 'Preferences unavailable - open tracker' : loading ? 'Loading preferences…' : data.cycleSettings ? `${data.cycleSettings.remindersEnabled ? 'On' : 'Off'} · Manage timing and discreet wording` : 'Optional · Set up cycle check-ins'} onPress={() => router.push('/cycle')} />
    </View>
    {Platform.OS !== 'web' && <View style={{ marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderColor: colors.border }}>
      <Text accessibilityRole="header" style={c.title}>Sound & delivery</Text>
      <CareRow icon="drop" title="Water reminder sound" detail="Manage the droplet sound in device settings" onPress={() => void open('water')} />
      <Text style={c.text}>Silent mode, Do Not Disturb and battery settings can affect reminders. Reopen Arogio regularly to keep upcoming reminders scheduled.</Text>
    </View>}
  </AppScreen>;
}
