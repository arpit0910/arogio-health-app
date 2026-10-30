import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { AppIcon } from '../../components/app/AppIcon';
import { CareDisclosure, CareRow, useCareStyles } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { formatDateTime } from '../../lib/time';
import { useHealthSync } from './HealthSyncProvider';
import { HealthSourcePicker } from './HealthSourcePicker';
import { HealthOverview } from './HealthOverview';
import { recordedHealthMetrics } from './model';
import { installHealthConnect, openHealthSettings } from './healthConnect';
import { openHealthApp } from './healthApps';

export function HealthSyncScreen() {
  const c = useCareStyles(), colors = usePalette(), health = useHealthSync();
  const [error, setError] = useState('');
  const hasReadings = recordedHealthMetrics(health.snapshot).length > 0;
  async function act(work: () => Promise<unknown>) {
    setError('');
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not open settings. Try again.'); }
  }
  return <AppScreen back title="Health apps" refreshing={health.busy || health.appsLoading} onRefresh={() => void Promise.allSettled([health.checkAvailability(), health.run()])}>
    <View style={{ gap: 8, marginBottom: 20 }}>
      <Text accessibilityRole="header" style={c.heading}>Connect your health app</Text>
      <Text style={c.text}>Choose an app and allow read access. Your readings update automatically.</Text>
    </View>
    {!health.ready ? <ActivityIndicator color={colors.primary} accessibilityLabel="Checking health access" /> : health.availability === 'available' ? <HealthSourcePicker /> : <View style={{ gap: 12 }}>
      <Text style={c.text}>{health.availability === 'update-required' ? 'Update Health Connect to connect your health apps.' : health.availability === 'rebuild-required' ? 'Install the latest Arogio Android build to connect a health app.' : 'Health app connections are available on supported Android phones. You can still log activity in Arogio.'}</Text>
      {health.availability === 'update-required' && <Button title="Update Health Connect" onPress={() => void act(installHealthConnect)} />}
      <Button title="Check again" variant="secondary" onPress={() => void act(health.checkAvailability)} />
    </View>}
    {!!(error || health.error) && <Text accessibilityRole="alert" style={[c.text, { marginTop: 16, color: colors.error }]}>{error || health.error}</Text>}
    {health.connected && health.source && <View style={{ marginTop: 20, gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><AppIcon name={health.busy ? 'sync' : hasReadings ? 'check' : 'clock'} size={20} /><Text accessibilityLiveRegion="polite" style={[c.text, { flex: 1 }]}>{health.busy ? 'Updating readings...' : hasReadings && health.snapshot ? `Updated ${formatDateTime(health.snapshot.syncedAt)}` : `Waiting for ${health.source.name} to share readings`}</Text></View>
      {!hasReadings && !health.busy && <>
        <Text style={c.text}>Open {health.source.name}, enable its Health Connect data sharing, then return here. Your watch may need to sync with that app first.</Text>
        <Button title={`Open ${health.source.name}`} onPress={() => void act(() => openHealthApp(health.source!.id))} />
      </>}
    </View>}
    {hasReadings && health.snapshot && <HealthOverview snapshot={health.snapshot} />}
    <View style={{ marginTop: 24 }}><CareRow icon="goal" title="Daily targets" detail="Set the goals used across Arogio" onPress={() => router.push({ pathname: '/activity', params: { edit: 'goals' } })} /></View>
    <View style={{ marginTop: 24 }}><CareDisclosure title="Manage connection">
      <Text style={c.text}>Readings update while Arogio is open and when you return. Android controls background timing. Only the selected app supplies readings.</Text>
      {health.availability === 'available' && <Button title="Manage data access" variant="secondary" onPress={() => void act(openHealthSettings)} />}
      {health.connected && <Button title={health.background ? 'Turn off background updates' : 'Enable background updates'} variant="secondary" disabled={health.busy} onPress={() => void act(health.background ? health.disableBackground : health.enableBackground)} />}
      {health.source && <Button title="Disconnect app" variant="secondary" disabled={health.busy} onPress={() => void act(health.disconnect)} />}
      <Text style={c.text}>Readings stay on this device. Disconnecting clears imported readings and stops updates.</Text>
    </CareDisclosure></View>
  </AppScreen>;
}
