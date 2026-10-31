import { useTranslation } from "../../localization/LanguageProvider";
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
  const { t: tr, language, setLanguage, ready: languageReady, saving: languageSaving, error: languageError } = useTranslation();
  const c = useCareStyles();
  const { colors, preference, scheme, setPreference, ready, saving, error } = useAppearance();
  const health = useHealthSync();
  return <AppScreen back title={tr("Settings")}>
    <View style={{ gap: 8 }}><Text style={c.heading}>{tr("Preferences")}</Text><Text style={c.text}>{tr("Choose how Arogio looks, reminds you and records your day.")}</Text></View>
    <View style={{ marginTop: 32, gap: 12 }}>
      <Text accessibilityRole="header" style={c.title}>{tr('Language')}</Text>
      <Text style={c.text}>{tr('Choose your app language. You can change it anytime.')}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={tr('Language')} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {([{ value: 'en', title: 'English' }, { value: 'hi', title: 'हिन्दी' }] as const).map(option => <TouchTarget key={option.value} accessibilityRole="radio" accessibilityLabel={option.title} accessibilityState={{ checked: language === option.value, disabled: !languageReady || languageSaving }} disabled={!languageReady || languageSaving} onPress={() => void setLanguage(option.value)} style={({ pressed }) => ({ flexGrow: 1, flexBasis: 120, minHeight: 60, padding: 16, borderRadius: 12, borderWidth: language === option.value ? 2 : 1, borderColor: language === option.value ? colors.primary : colors.border, backgroundColor: language === option.value || pressed ? colors.subtle : colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 })}>
          <Text style={[c.text, { color: colors.ink }]}>{tr(option.title)}</Text>{language === option.value && <AppIcon name="check" size={18} />}
        </TouchTarget>)}
      </View>
      <Text accessibilityLiveRegion="polite" style={c.text}>{tr(languageSaving ? 'Saving language…' : language === 'hi' ? 'Hindi selected' : 'English selected')}</Text>
      {!!languageError && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{tr(languageError)}</Text>}
    </View>
    <View style={{ marginTop: 32 }}>
      <Text accessibilityRole="header" style={c.title}>{tr("Reminders & connections")}</Text>
      <CareRow icon="shield" title={tr("App access")} detail={tr("Notifications, motion, location and health source")} onPress={() => router.push('/app-access')} />
      <CareRow icon="bell" title={tr("Notifications")} detail={tr("Reminder preferences, permissions and sounds")} onPress={() => router.push('/notification-settings')} />
      <CareRow icon="sync" title={tr("Health app connections")} detail={health.source ? `${health.source.name} · ${tr(health.connected ? 'Connected' : 'Needs attention')}` : tr('Connect an app for automatic readings')} onPress={() => router.push('/connected-health')} />
    </View>
    <View style={{ marginTop: 32, gap: 12 }}>
      <Text accessibilityRole="header" style={c.title}>{tr("Appearance")}</Text>
      <Text style={c.text}>{tr("Choose a look that feels comfortable. System follows your device.")}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={tr("Appearance")} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {modes.map(mode => <TouchTarget key={mode.value} accessibilityRole="radio" accessibilityLabel={tr(`${mode.title} appearance`)} accessibilityState={{ checked: preference === mode.value, disabled: !ready || saving }} disabled={!ready || saving} onPress={() => void setPreference(mode.value as AppearancePreference)} style={({ pressed }) => ({ flexGrow: 1, flexBasis: 90, minHeight: 72, gap: 8, padding: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: preference === mode.value ? 2 : 1, borderColor: preference === mode.value ? colors.primary : colors.border, backgroundColor: preference === mode.value || pressed ? colors.subtle : colors.surface, opacity: saving ? 0.6 : 1 })}>
          <AppIcon name={mode.icon} size={24} /><View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Text style={[c.text, { color: colors.ink }]}>{tr(mode.title)}</Text>{preference === mode.value && <AppIcon name="check" size={14} />}</View>
        </TouchTarget>)}
      </View>
      <Text accessibilityLiveRegion="polite" style={[c.text, { fontSize: 13 }]}>{tr(saving ? 'Saving appearance…' : preference === 'system' ? `Currently using ${tr(scheme === 'dark' ? 'Dark' : 'Light')} mode` : `${tr(scheme === 'dark' ? 'Dark' : 'Light')} mode selected`)}</Text>
      {!!error && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{tr(error)}</Text>}
    </View>
    <View style={{ marginTop: 32 }}>
      <Text accessibilityRole="header" style={c.title}>{tr("Your preferences")}</Text>
      <CareRow icon="goal" title={tr("Daily targets")} detail={tr("Steps, exercise, sleep and more")} onPress={() => router.push({ pathname: '/activity', params: { edit: 'goals' } })} />
      <CareRow icon="leaf" title={tr("Goals & preferences")} detail={tr("Wellness priorities, activity level and updates")} onPress={() => router.push('/edit-health-goals')} />
    </View>
    <View style={{ marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderColor: colors.border }}>
      <Text accessibilityRole="header" style={c.title}>{tr("Privacy & information")}</Text>
      <CareRow icon="shield" title={tr("Privacy policy")} detail={tr("How your information is handled")} onPress={() => router.push('/privacy')} />
      <CareRow icon="book" title={tr("Terms of service")} onPress={() => router.push('/terms')} />
    </View>
  </AppScreen>;
}
