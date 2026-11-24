import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '../personal-wellness/WellnessContext';
import { useHealthSync } from '../health-connections/HealthSyncProvider';
import { usePhoneSteps } from '../activity/PhoneStepsProvider';
import { emptyActivity } from '../activity/model';
import { localDay } from '../personal-wellness/domain';
import { useTrackingClock } from '../personal-wellness/useTrackingClock';
import { useAuth } from '../authentication/context/AuthContext';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';
import { fonts, typeStyles } from '../../theme/tokens';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { AppIcon } from '../../components/app/AppIcon';
import { homeVitals, sleepClock } from './vitalsModel';

export function HomeVitals() {
  const { user } = useAuth(), wellness = useWellness(), health = useHealthSync(), phone = usePhoneSteps(), now = useTrackingClock();
  const c = usePalette(), { t, locale } = useTranslation(), router = useRouter(), { fontScale } = useWindowDimensions();
  const tracking = wellness.data.activityTracking ?? emptyActivity();
  const connected = health.connected;
  const data = homeVitals(localDay(now), connected, tracking, health.snapshot, phone);
  const source = !user ? t('Sign in to track your day') : connected ? health.source?.name ?? t('Connected health app') : phone.enabled ? t('Phone steps & your journal') : t('Your daily health journal');
  const open = () => router.push('/activity');
  const cards = [
    { title: 'Steps', icon: 'walk' as const, value: data.steps, display: data.steps?.toLocaleString(locale), goal: tracking.goals.Steps, unit: 'steps', tint: c.mintSurface, color: c.primary, footer: data.calories != null ? `${Math.round(data.calories)} kcal${data.distance != null ? ` · ${data.distance.toFixed(1)} km` : ''}` : 'Log your movement' },
    { title: 'Sleep duration', icon: 'moon' as const, value: data.sleep, display: data.sleep != null ? sleepClock(data.sleep) : undefined, goal: tracking.goals.SleepSession, unit: 'hours', tint: c.secondarySurface, color: c.secondary, footer: 'Your recorded sleep' },
    { title: 'Heart rate', icon: 'heart' as const, value: data.heart, display: data.heart != null ? `${Math.round(data.heart)}` : undefined, goal: undefined, unit: 'bpm', tint: c.roseSurface, color: c.error, footer: 'Connected readings' },
  ];
  return <View style={s.section}>
    <View style={s.heading}><View style={[s.symbol, { backgroundColor: c.mintSurface }]}><AppIcon name="heart" size={19} color={c.primary} /></View><View style={s.copy}><Text accessibilityRole="header" style={[typeStyles.title, { color: c.ink }]}>{t('Daily Activity & Vitals')}</Text><Text style={[typeStyles.detail, { color: c.muted }]}>{source}</Text></View><TouchTarget accessibilityRole="button" accessibilityLabel={t('Open health connections')} onPress={() => router.push('/connected-health')} style={[s.source, { backgroundColor: c.subtle }]}><AppIcon name="sync" size={15} color={c.primary} /><Text style={[typeStyles.label, { color: c.primary }]}>{t(connected ? 'Sync' : 'Connect')}</Text></TouchTarget></View>
    <View style={s.cards}>{cards.map(card => {
      const progress = card.value != null && card.goal ? Math.min(1, card.value / card.goal) : null;
      return <TouchTarget key={card.title} accessibilityRole="button" accessibilityLabel={`${t(card.title)}: ${card.display ?? t('No reading today')}. ${source}`} onPress={card.title === 'Heart rate' ? () => router.push('/connected-health') : open} style={[s.card, { flexBasis: fontScale > 1.2 ? '100%' : '30%', backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={s.heading}><View style={[s.metricIcon, { backgroundColor: card.tint }]}><AppIcon name={card.icon} size={18} color={card.color} /></View>{progress != null && <Text style={[s.percent, { color: card.color }]}>{Math.round(progress * 100)}%</Text>}</View>
        <View style={{ gap: 3 }}><Text style={[s.value, { color: c.ink }]}>{card.display ?? '—'}{card.title === 'Heart rate' && card.value != null && <Text style={[typeStyles.detail, { color: c.muted }]}> bpm</Text>}</Text><Text style={[typeStyles.label, { color: c.muted }]}>{card.title === 'Steps' && card.goal ? `/ ${card.goal.toLocaleString(locale)} ${t('steps')}` : t(card.title)}</Text></View>
        <View style={[s.track, { backgroundColor: c.subtle }]}>{progress != null && <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: card.color, borderRadius: 4 }} />}</View>
        <Text style={[typeStyles.detail, s.footer, { color: c.muted, borderColor: c.border }]}>{t(card.value == null ? 'No reading today' : card.footer)}</Text>
      </TouchTarget>;
    })}</View>
    {!!health.error && user && <Text accessibilityRole="alert" style={[typeStyles.detail, { color: c.error }]}>{t(health.error)}</Text>}
  </View>;
}
const s = StyleSheet.create({
  section: { gap: 12 }, heading: { flexDirection: 'row', alignItems: 'center', gap: 8 }, copy: { flex: 1, minWidth: 0 },
  symbol: { width: 32, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, source: { paddingHorizontal: 8, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 4 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, card: { flexGrow: 1, minWidth: 88, padding: 10, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, minHeight: 152, gap: 12, justifyContent: 'space-between' },
  metricIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, percent: { marginLeft: 'auto', fontFamily: fonts.semibold, fontSize: 11 },
  value: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 26, fontVariant: ['tabular-nums'] }, track: { height: 6, borderRadius: 4, overflow: 'hidden' }, footer: { paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
});
