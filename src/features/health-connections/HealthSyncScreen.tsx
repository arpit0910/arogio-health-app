import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from '../../localization/LanguageProvider';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppScreen } from '../../components/app/AppScreen';
import { AppIcon } from '../../components/app/AppIcon';
import { CareDisclosure, useCareStyles } from '../../components/app/CareUI';
import { PageIntro } from '../../components/app/PageIntro';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { formatDateTime } from '../../shared/date-time';
import { useHealthSync } from './HealthSyncProvider';
import { HealthSourcePicker } from './HealthSourcePicker';
import { recordedHealthMetrics, formatHealthValue, type SourceRecordCheck } from './model';
import { checkSourceRecords, installHealthConnect, openHealthSettings } from './healthConnect';
import { openHealthApp } from './healthApps';
import { sourceSharingInstructions } from './connection';
import { readingDiagnostics } from './diagnostics';

export function HealthSyncScreen() {
  const { t: tr } = useTranslation();
  const c = useCareStyles(), colors = usePalette(), health = useHealthSync();
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [sourceRecords, setSourceRecords] = useState<SourceRecordCheck[]>([]);
  const hasReadings = recordedHealthMetrics(health.snapshot).length > 0;
  const source = health.source;
  const installedSource = health.apps.find(app => app.id === source?.id) ?? source;
  const diagnostics = installedSource ? readingDiagnostics(installedSource, health.selectedMetrics, health.snapshot) : [];
  async function act(work: () => Promise<unknown>) {
    setError('');
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not open settings. Try again.'); }
  }
  return <AppScreen back refreshing={health.busy || health.appsLoading} onRefresh={() => void Promise.allSettled([health.checkAvailability(), health.run()])}>
    <PageIntro title="Health connections" description="Choose where your readings come from. Manage access and solve sharing issues here." icon="sync" tone="blue" />
    {!health.ready ? <ActivityIndicator color={colors.primary} accessibilityLabel={tr('Checking health access')} /> : health.availability !== 'available' ? <View style={{ gap: 12 }}>
      <Text style={c.text}>{tr(health.availability === 'update-required' ? 'Update Health Connect to connect your health apps.' : health.availability === 'rebuild-required' ? 'Install the latest Arogio Android build to connect a health app.' : 'Health app connections are available on supported Android phones. You can still log activity in Arogio.')}</Text>
      {health.availability === 'update-required' && <Button title={tr('Update Health Connect')} onPress={() => void act(installHealthConnect)} />}
      <Button title={tr('Check again')} variant="secondary" onPress={() => void act(health.checkAvailability)} />
    </View> : source && health.connected ? <>
      <View style={{ padding: 20, backgroundColor: colors.subtle, borderRadius: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><AppIcon name={hasReadings ? 'check' : 'clock'} /><Text style={[c.title, { flex: 1 }]}>{source.name}</Text></View>
        <Text accessibilityLiveRegion="polite" style={c.text}>{tr(health.busy ? 'Updating readings...' : hasReadings ? 'Receiving shared readings' : 'Access allowed. Waiting for shared readings.')}</Text>
        {health.snapshot && <Text style={c.text}>{tr('Last checked ')}{formatDateTime(health.snapshot.syncedAt)}</Text>}
        <Button title={tr(health.busy ? 'Refreshing readings...' : 'Check for new readings')} disabled={health.busy} onPress={() => void health.run()} />
      </View>
      <View style={{ marginTop: 24, gap: 10 }}>
        <Text accessibilityRole="header" style={c.title}>{tr('Sharing status')}</Text>
        {diagnostics.map(item => <View key={item.key} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}>
          <View style={{ flexGrow: 1, flexBasis: 100, gap: 4 }}><Text style={[c.text, { color: colors.ink }]}>{tr(item.title)}</Text><Text style={[c.text, { fontSize: 12 }]}>{tr(item.status)}</Text></View>
          {item.latest && <View style={{ alignItems: 'flex-end', gap: 4 }}><Text style={[c.text, { color: colors.ink }]}>{formatHealthValue(item.key, item.latest.value)} {item.key !== 'SleepSession' ? item.unit : ''}</Text><Text style={[c.text, { fontSize: 12 }]}>{item.latest.day} · {tr(['HeartRate', 'RestingHeartRate', 'Weight'].includes(item.key) ? 'Daily average' : 'Daily total')}</Text></View>}
        </View>)}
      </View>
      {!hasReadings && <View style={{ gap: 12, marginTop: 24 }}>
        <Text style={c.title}>{tr('Get readings flowing')}</Text>
        <Text style={c.text}>{tr(sourceSharingInstructions(source.id, source.name))}</Text>
        <Button title={tr(`Open ${source.name}`)} variant="secondary" onPress={() => void act(() => openHealthApp(source.id))} />
        <Button title={tr('Check Health Connect access')} variant="secondary" onPress={() => void act(openHealthSettings)} />
      </View>}
      <View style={{ marginTop: 24 }}><CareDisclosure title={tr('Change source or review access')}><HealthSourcePicker /><Button title={tr('Check Health Connect access')} variant="secondary" onPress={() => void act(openHealthSettings)} /></CareDisclosure></View>
      <View style={{ marginTop: 16 }}><CareDisclosure title={tr('Readings look old or incorrect?')}>
        <Text style={c.text}>{tr('Arogio reads the records shared to Health Connect. Daily totals and averages can differ from the latest measurement shown in your wearable app.')}</Text>
        <Button title={tr('Check source records')} loading={checking} disabled={health.busy} variant="secondary" onPress={() => {
          setChecking(true); setSourceRecords([]);
          void act(async () => setSourceRecords(await checkSourceRecords(health.selectedMetrics, source.id))).finally(() => setChecking(false));
        }} />
        {sourceRecords.filter(item => item.source === source.id).map(item => <View key={item.metric} style={{ gap: 5, paddingVertical: 10 }}>
          <Text style={[c.text, { color: colors.ink }]}>{tr(diagnostics.find(metric => metric.key === item.metric)?.title ?? item.metric)}</Text>
          <Text style={c.text}>{tr(item.failed ? 'Could not check source records. Try again.' : item.recordedAt ? 'Latest source record: ' : 'No source records in the last 29 days.')}{item.recordedAt ? formatDateTime(item.recordedAt) : ''}</Text>
          {item.modifiedAt && <Text style={c.text}>{tr('Written to Health Connect: ')}{formatDateTime(item.modifiedAt)}</Text>}
        </View>)}
        <Text style={c.text}>{tr('If these timestamps stay old after syncing your wearable, open its app and check Health Connect sharing. Refreshing Arogio cannot make the wearable publish new records.')}</Text>
      </CareDisclosure></View>
    </> : <HealthSourcePicker />}
    {!!(error || health.error) && <Text accessibilityRole="alert" style={[c.text, { marginTop: 16, color: colors.error }]}>{tr(error || health.error)}</Text>}
    {source && <View style={{ marginTop: 24 }}><CareDisclosure title={tr('Connection options')}>
      <Text style={c.text}>{tr('Readings update while Arogio is open and when you return. Android controls background timing. Only the selected app supplies readings.')}</Text>
      {hasReadings && <Button title={tr(`Open ${source.name}`)} variant="secondary" onPress={() => void act(() => openHealthApp(source.id))} />}
      {health.connected && <Button title={tr(health.background ? 'Turn off background updates' : 'Enable background updates')} variant="secondary" disabled={health.busy} onPress={() => void act(health.background ? health.disableBackground : health.enableBackground)} />}
      <Button title={tr('Disconnect app')} variant="secondary" disabled={health.busy} onPress={() => void act(health.disconnect)} />
      <Text style={c.text}>{tr('Readings stay on this device. Disconnecting clears imported readings and stops updates.')}</Text>
    </CareDisclosure></View>}
  </AppScreen>;
}
