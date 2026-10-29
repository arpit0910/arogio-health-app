import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareRow, useCareStyles } from '../../components/app/CareUI';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useAppearance, type AppearancePreference } from '../../theme/AppearanceProvider';
import { useHealthSync } from '../health-sync/HealthSyncProvider';

const modes = [
  { value: 'system', title: 'System', icon: 'device' },
  { value: 'light', title: 'Light', icon: 'sun' },
  { value: 'dark', title: 'Dark', icon: 'moon' },
] as const;
export function SettingsScreen() {
  const c = useCareStyles();
  const { colors, preference, scheme, setPreference, ready, saving, error } = useAppearance();
  const health = useHealthSync();
  return <AppScreen back title="Settings">
    <View style={{ gap: 8 }}><Text style={c.heading}>Preferences</Text><Text style={c.text}>Choose how Arogio looks, reminds you and records your day.</Text></View>
    <View style={{ marginTop: 32 }}>
      <Text accessibilityRole="header" style={c.title}>Reminders & connections</Text>
      <CareRow icon="bell" title="Notifications" detail="Reminder preferences, permissions and sounds" onPress={() => router.push('/notification-settings')} />
      <CareRow icon="sync" title="Health app connections" detail={health.source ? `${health.source.name} · ${health.connected ? 'Connected' : 'Needs attention'}` : 'Optional ? Arogio tracking works without another app'} onPress={() => router.push('/connected-health-settings')} />
    </View>
    <View style={{ marginTop: 32, gap: 12 }}>
      <Text accessibilityRole="header" style={c.title}>Appearance</Text>
      <Text style={c.text}>Choose a look that feels comfortable. System follows your device.</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Appearance" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {modes.map(mode => <TouchTarget key={mode.value} accessibilityRole="radio" accessibilityLabel={`${mode.title} appearance`} accessibilityState={{ checked: preference === mode.value, disabled: !ready || saving }} disabled={!ready || saving} onPress={() => void setPreference(mode.value as AppearancePreference)} style={({ pressed }) => ({ flexGrow: 1, flexBasis: 90, minHeight: 96, gap: 8, padding: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: preference === mode.value ? 2 : 1, borderColor: preference === mode.value ? colors.primary : colors.border, backgroundColor: preference === mode.value || pressed ? colors.subtle : colors.surface, opacity: saving ? 0.6 : 1 })}>
          <AppIcon name={mode.icon} size={24} /><View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Text style={[c.text, { color: colors.ink }]}>{mode.title}</Text>{preference === mode.value && <AppIcon name="check" size={14} />}</View>
        </TouchTarget>)}
      </View>
      <Text accessibilityLiveRegion="polite" style={[c.text, { fontSize: 13 }]}>{saving ? 'Saving appearance…' : preference === 'system' ? `Currently using ${scheme} mode` : `${scheme === 'dark' ? 'Dark' : 'Light'} mode selected`}</Text>
      {!!error && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{error}</Text>}
    </View>
    <View style={{ marginTop: 32 }}>
      <Text accessibilityRole="header" style={c.title}>Your preferences</Text>
      <CareRow icon="goal" title="Daily targets" detail="Steps, activity, food and water goals" onPress={() => router.push('/activity')} />
      <CareRow icon="leaf" title="Goals & preferences" detail="Wellness priorities, activity level and updates" onPress={() => router.push('/edit-health-goals')} />
    </View>
    <View style={{ marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderColor: colors.border }}>
      <Text accessibilityRole="header" style={c.title}>Privacy & information</Text>
      <CareRow icon="shield" title="Privacy policy" detail="How your information is handled" onPress={() => router.push('/privacy')} />
      <CareRow icon="book" title="Terms of service" onPress={() => router.push('/terms')} />
    </View>
  </AppScreen>;
}
