import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { AppScreen } from '../../components/app/AppScreen';
import { careStyles as c } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/tokens';
import { HealthSourcePicker } from './HealthSourcePicker';
import { useHealthSync } from './HealthSyncProvider';
import { openHealthSettings } from './healthConnect';

export function HealthSourceSettingsScreen() {
  const health = useHealthSync();
  const [error, setError] = useState('');
  return <AppScreen back title="Connected health settings">
    <View style={{ gap: 12 }}>
      <Text style={c.heading}>Your health app</Text>
      {health.source && <Text style={c.text}>{health.source.name}{health.connected ? ' is your active source.' : ' is selected. Refreshes are currently off or unavailable.'}</Text>}
      <Text style={c.text}>Choose one source for all your health analytics. Data from other apps is excluded.</Text>
      {!!(error || health.error) && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{error || health.error}</Text>}
      {!health.ready ? <ActivityIndicator color={colors.primary} /> : health.availability === 'available' ? <HealthSourcePicker inSettings /> : <Text style={c.text}>Open an updated Android build with Health Connect available to choose a source app.</Text>}
    </View>
    <View style={{ marginTop: 28, gap: 12 }}>
      <Text style={c.title}>Sync &amp; permissions</Text>
      <Text style={c.text}>Refreshes run every 5 minutes while Arogio is open and when you return.</Text>
      {health.connected && <>
        <Text style={c.text}>{health.background ? 'Background refresh is on. Android schedules updates at intervals of at least 15 minutes and may delay them.' : 'Background refresh is optional on supported Android devices.'}</Text>
        <Button title={health.background ? 'Turn off background refresh' : 'Enable background refresh'} variant="secondary" disabled={health.busy}
          onPress={() => void (health.background ? health.disableBackground() : health.enableBackground())} />
        <Button title="Refresh now" variant="secondary" loading={health.busy} onPress={() => void health.run()} />
      </>}
      <Button title="Manage Health Connect access" variant="secondary" disabled={health.busy} onPress={() => void openHealthSettings().catch(() => setError('Open Health Connect in Android Settings to manage Arogio access.'))} />
      {health.source && <Button title="Disconnect and clear readings" variant="secondary" disabled={health.busy} onPress={() => void health.disconnect()} />}
    </View>
  </AppScreen>;
}
