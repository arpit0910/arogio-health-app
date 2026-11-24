import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareGroup, CareRow, useCareStyles } from '../../components/app/CareUI';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useAppearance } from '../../theme/AppearanceProvider';
import { useHealthSync } from '../health-connections/HealthSyncProvider';

export function SettingsScreen() {
  const router = useRouter();
  const { t: tr, language, setLanguage, ready: languageReady, saving: languageSaving, error: languageError } = useTranslation();
  const c = useCareStyles();
  const { colors } = useAppearance();
  const health = useHealthSync();
  return <AppScreen back title={tr('Settings')}>
    <View style={{ padding: 20, gap: 12, backgroundColor: colors.mintSurface, borderRadius: 24 }}>
      <Text accessibilityRole="header" style={c.title}>{tr('Language')}</Text>
      <Text style={c.text}>{tr('Choose your app language. You can change it anytime.')}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={tr('Language')} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {([{ value: 'en', title: 'English' }, { value: 'hi', title: 'Hindi' }] as const).map(option => <TouchTarget key={option.value} accessibilityRole="radio" accessibilityLabel={tr(option.title)} accessibilityState={{ checked: language === option.value, disabled: !languageReady || languageSaving }} disabled={!languageReady || languageSaving} onPress={() => void setLanguage(option.value)} style={({ pressed }) => ({ flexGrow: 1, flexBasis: 120, minHeight: 60, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: language === option.value ? colors.primary : colors.border, backgroundColor: language === option.value ? colors.surface : pressed ? colors.subtle : colors.mintSurface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 })}>
          <View style={{ width: 20 }} /><Text style={[c.text, { color: colors.ink, flex: 1, textAlign: 'center' }]}>{tr(option.title)}</Text><View style={{ width: 20 }}>{language === option.value && <AppIcon name="check" size={18} />}</View>
        </TouchTarget>)}
      </View>
      <Text accessibilityLiveRegion="polite" style={c.text}>{tr(languageSaving ? 'Saving language…' : language === 'hi' ? 'Hindi selected' : 'English selected')}</Text>
      {!!languageError && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{tr(languageError)}</Text>}
    </View>
    <CareGroup title="Reminders & connections">
      <CareRow icon="shield" title={tr("App access")} detail={tr("Motion and location permissions")} onPress={() => router.push('/app-access')} />
      <CareRow icon="bell" title={tr("Notifications")} detail={tr("Reminder preferences, permissions and sounds")} onPress={() => router.push('/notification-settings')} />
      <CareRow icon="sync" title={tr("Health app connections")} detail={health.source ? `${health.source.name} · ${tr(health.connected ? 'Connected' : 'Needs attention')}` : tr('Connect an app for automatic readings')} onPress={() => router.push('/connected-health')} />
    </CareGroup>
    <CareGroup title="Your preferences">
      <CareRow icon="goal" title={tr("Daily targets")} detail={tr("Steps, exercise, sleep and more")} onPress={() => router.push({ pathname: '/activity', params: { edit: 'goals' } })} />
      <CareRow icon="leaf" title={tr("Goals & preferences")} detail={tr("Wellness priorities, activity level and updates")} onPress={() => router.push('/edit-health-goals')} />
    </CareGroup>
    <CareGroup title="Privacy & information">
      <CareRow icon="shield" title={tr('Privacy controls')} detail={tr('Manage access to your information')} onPress={() => router.push('/privacy-controls')} />
      <CareRow icon="shield" title={tr('Export your saved data')} detail={tr('Prepare a private copy of your retained profile and routines')} onPress={() => router.push('/data-export')} />
      <CareRow icon="shield" title={tr("Privacy policy")} detail={tr("How your information is handled")} onPress={() => router.push('/privacy')} />
      <CareRow icon="book" title={tr("Terms of service")} onPress={() => router.push('/terms')} />
    </CareGroup>
  </AppScreen>;
}
