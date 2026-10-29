import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareRow, careStyles as c } from '../../components/app/CareUI';
import { useHealthSync } from '../../features/health-sync/HealthSyncProvider';
import { openReminderSettings } from '../../features/wellness/notifications';
import { TrackingFeedback } from '../../features/wellness/TrackingFeedback';
import { useAuth } from '../../features/auth/context/AuthContext';

export default function SettingsRoute() {
  const { user } = useAuth();
  const health = useHealthSync();
  const [notificationError, setNotificationError] = useState('');
  return <AppScreen back title="Settings">
    <View style={{ gap: 8 }}><Text style={c.heading}>Make Arogio yours.</Text><Text style={c.text}>{user?.email || user?.mobileNumber}</Text></View>
    <View style={c.section}>
      <Text accessibilityRole="header" style={c.title}>Connections &amp; reminders</Text>
      <CareRow icon="goal" title="Daily targets" detail="Steps, active calories, food calories and more" onPress={() => router.push('/activity')} />
      <CareRow icon="sync" title="Connected health" detail={health.source?.name ?? 'Choose one health app and manage sync'} onPress={() => router.push('/connected-health-settings')} />
      {Platform.OS !== 'web' && <CareRow icon="bell" title="Water reminder sound" detail="Manage the droplet sound and notification permissions" onPress={() => void openReminderSettings().catch(() => setNotificationError('Open Arogio in device notification settings to change reminder sounds.'))} />}
      <TrackingFeedback value={notificationError ? { message: notificationError, tone: 'error' } : null} />
    </View>
    <View style={[c.section, c.line]}>
      <CareRow icon="book" title="Privacy policy" detail="How your information is handled" onPress={() => router.push('/privacy')} />
      <CareRow icon="report" title="Terms of service" onPress={() => router.push('/terms')} />
    </View>
  </AppScreen>;
}
