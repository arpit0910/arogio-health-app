import { useState } from 'react';
import { ActivityIndicator, Image, Text, View, useWindowDimensions } from 'react-native';
import { usePalette } from '../../theme/AppearanceProvider';
import { useCareStyles } from '../../components/app/CareUI';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { Button } from '../../components/ui/Button';
import { appHealthMetrics, connectableHealthApps } from './connection';
import { recordedHealthMetrics } from './model';
import { useHealthSync } from './HealthSyncProvider';

export function HealthSourcePicker({ inSettings: _inSettings = false }: { inSettings?: boolean }) {
  const c = useCareStyles(), colors = usePalette(), health = useHealthSync();
  const { fontScale } = useWindowDimensions();
  const [connecting, setConnecting] = useState<string | null>(null);
  const apps = health.availability === 'available' ? connectableHealthApps(health.apps) : [];
  return <View style={{ gap: 12 }}>
    {health.appsLoading && !apps.length && <ActivityIndicator color={colors.primary} accessibilityLabel="Finding health apps" />}
    {!!health.appsError && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{health.appsError}</Text>}
    {!health.appsLoading && !apps.length && <View style={{ gap: 12, paddingVertical: 16 }}>
      <Text style={c.title}>No compatible apps found</Text>
      <Text style={c.text}>Only installed apps that can share health readings appear here. Enable Health Connect sharing in your health app, then check again.</Text>
      <Button title="Check again" variant="secondary" disabled={health.busy} onPress={() => void health.refreshApps()} />
    </View>}
    {apps.map(app => {
      const active = health.source?.id === app.id && health.connected;
      const receiving = active && recordedHealthMetrics(health.snapshot).length > 0;
      return <View key={app.id} style={{ flexDirection: 'row', flexWrap: fontScale > 1.3 ? 'wrap' : 'nowrap', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, backgroundColor: colors.surface }}>
        {app.icon ? <Image source={{ uri: app.icon }} accessible={false} style={{ width: 40, height: 40, borderRadius: 10 }} /> : <AppIcon name="heart" size={32} />}
        <View style={{ flex: 1, minWidth: fontScale > 1.3 ? 120 : 0, gap: 3 }}><Text style={[c.text, { color: colors.ink }]}>{app.name}</Text><Text style={[c.text, { fontSize: 12, lineHeight: 18 }]}>{active ? receiving ? 'Syncing automatically' : 'Access allowed' : 'Ready to connect'}</Text></View>
        <TouchTarget accessibilityRole="button" accessibilityLabel={`${active ? 'Connected to' : 'Connect'} ${app.name}`} accessibilityState={{ disabled: health.busy || active, busy: connecting === app.id }} disabled={health.busy || active}
          onPress={() => { setConnecting(app.id); void health.connectSource(app, appHealthMetrics(app)).finally(() => setConnecting(null)); }}
          style={{ minWidth: 86, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.surface : colors.primary, opacity: health.busy && connecting !== app.id ? 0.55 : 1 }}>
          {connecting === app.id ? <ActivityIndicator color={colors.onPrimary} /> : active ? <AppIcon name="check" size={24} /> : <Text style={[c.text, { color: colors.onPrimary }]}>Connect</Text>}
        </TouchTarget>
      </View>;
    })}
  </View>;
}
