import { usePalette } from '../../theme/AppearanceProvider';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useCareStyles, CareDisclosure } from '../../components/app/CareUI';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { Button } from '../../components/ui/Button';
import { Check } from '../wellness/TrackingUI';
import { fonts } from '../../theme/tokens';
import { healthMetrics, type HealthMetric } from './model';
import { useHealthSync } from './HealthSyncProvider';

export function HealthSourcePicker({ inSettings = false }: { inSettings?: boolean }) {
  const c = useCareStyles();
  const colors = usePalette();
  const s = useStyles();

  const { apps, appsLoading, appsError, refreshApps, source, selectedMetrics, connected, busy, connectSource } = useHealthSync();
  const [choice, setChoice] = useState<string | null>(null);
  const [selected, setSelected] = useState<HealthMetric[]>(selectedMetrics);
  const chosen = apps.find((app) => app.id === (choice ?? source?.id));
  return <View style={s.panel}>
    <Text style={c.title}>{inSettings ? 'Available health apps' : 'Choose one health app'}</Text>
    <Text style={c.text}>{inSettings ? 'Select one app below to supply your charts. Apply the change to start using it.' : 'Only the selected app supplies your charts. You can change it later in Settings > Connected health.'}</Text>
    {appsLoading && <ActivityIndicator color={colors.primary} accessibilityLabel="Finding installed health apps" />}
    {!!appsError && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{appsError}</Text>}
    {!appsLoading && !appsError && apps.length === 0 && <Text style={c.text}>No compatible health apps found. Install an app that shares measurements with Health Connect, enable sharing in that app, then check again.</Text>}
    <View accessibilityRole="radiogroup" accessibilityLabel="Installed health apps">
      {apps.map((app) => <TouchTarget key={app.id} accessibilityRole="radio" accessibilityLabel={app.name}
        accessibilityState={{ checked: chosen?.id === app.id, disabled: busy }} disabled={busy}
        onPress={() => setChoice(app.id)} style={s.row}>
        <AppIcon name="heart" size={22} />
        <View style={s.copy}><Text style={s.rowTitle}>{app.name}</Text><Text style={s.small}>{source?.id === app.id ? connected ? 'Connected app' : 'Previously selected' : 'Available on this device'}</Text></View>
        <View style={[s.radio, chosen?.id === app.id && { borderColor: colors.primary }]}>{chosen?.id === app.id && <View style={s.dot} />}</View>
      </TouchTarget>)}
    </View>
    <Button title="Check for health apps" variant="secondary" disabled={appsLoading || busy} onPress={() => void refreshApps()} />
    {!!apps.length && <>
      <CareDisclosure title="Data types to read">
        {healthMetrics.map((item) => <Check key={item.key} label={item.title} checked={selected.includes(item.key)} disabled={busy}
          onChange={() => setSelected((current) => current.includes(item.key) ? current.filter((key) => key !== item.key) : [...current, item.key])} />)}
      </CareDisclosure>
      <Text style={s.small}>{source && chosen && source.id !== chosen.id ? 'Changing apps clears the previous overview before reading the new source. Your original records stay in Health Connect.' : 'Android will ask for read access if needed. Only data shared by this app and allowed by you appears here.'}</Text>
      <Button title={chosen ? `${connected ? 'Use' : 'Connect'} ${chosen.name}` : 'Choose an app to continue'}
        disabled={!chosen || !selected.length || (connected && chosen.id === source?.id && [...selected].sort().join() === [...selectedMetrics].sort().join())} loading={busy}
        onPress={() => { if (chosen) void connectSource(chosen, selected); }} />
    </>}
  </View>;
}
const useStyles = () => {
  const c = useCareStyles();
  const colors = usePalette();
return StyleSheet.create({
  panel: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 18, borderBottomWidth: 1, borderColor: colors.border },
  copy: { flex: 1, gap: 4 },
  rowTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 23, color: colors.ink },
  small: { ...c.text, fontSize: 13, lineHeight: 20 },
  radio: { width: 22, height: 22, borderWidth: 2, borderRadius: 11, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
};
