import { useTranslation } from "../../localization/LanguageProvider";
import { Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useCareStyles } from '../../components/app/CareUI';
import { useAppearance } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { formatDateTime } from '../../lib/time';
import { useWellness } from '../wellness/WellnessContext';
import { useHealthSync } from '../health-sync/HealthSyncProvider';
import { usePhoneSteps } from './PhoneStepsProvider';
import { activityReading, emptyActivity } from './model';
import { addDays, localDay } from '../wellness/domain';
import { useTrackingClock } from '../wellness/useTrackingClock';
import { formatHealthValue, hasHealthValue } from '../health-sync/model';

const metrics = [
  { key: 'Steps', title: 'Steps', icon: 'walk', unit: 'steps' },
  { key: 'ExerciseSession', title: 'Movement', icon: 'clock', unit: 'min' },
  { key: 'SleepSession', title: 'Sleep', icon: 'moon', unit: 'hours' },
] as const;
export function TodayActivity() {
  const { t: tr, locale } = useTranslation();
  const c = useCareStyles(), { colors } = useAppearance(), { fontScale, width } = useWindowDimensions();
  const wellness = useWellness(), health = useHealthSync(), phone = usePhoneSteps();
  const tracking = wellness.data.activityTracking ?? emptyActivity(), day = localDay(useTrackingClock());
  const mode = health.connected || (health.busy && health.source) ? 'connected' : 'manual';
  const open = () => router.push({ pathname: '/activity', params: { source: mode } });
  return <View style={{ marginTop: 20, gap: 12 }}>
    <TouchTarget accessibilityRole="button" accessibilityLabel={tr("View health and activity")} onPress={open} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text accessibilityRole="header" style={[c.title, { flex: 1 }]}>{tr("Health & activity")}</Text>
      <Text style={[c.text, { color: colors.primary, fontSize: 13 }]}>{tr("View all")}</Text><AppIcon name="right" size={17} />
    </TouchTarget>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {metrics.map(metric => {
        const value = activityReading(metric.key, day, mode, tracking, health.snapshot, phone).value;
        const available = hasHealthValue(value), goal = tracking.goals[metric.key];
        const week = Array.from({ length: 7 }, (_, index) => activityReading(metric.key, addDays(day, index - 6), mode, tracking, health.snapshot, phone).value);
        const max = Math.max(1, ...week.filter(hasHealthValue));
        const reading = mode === 'connected' ? health.snapshot?.days.find(item => item.day === day)?.readings[metric.key] : null;
        const checked = available && mode === 'connected' ? reading?.checkedAt ?? health.snapshot?.syncedAt : null;
        const source = mode === 'connected' ? health.source?.name ?? 'Connected app' : metric.key === 'Steps' && phone.enabled ? 'Phone counter' : 'Your logged activity';
        const missing = health.busy || !health.ready || !wellness.ready ? 'Checking readings...' : mode === 'connected' ?
          !health.selectedMetrics.includes(metric.key) ? 'Not selected for sync' : !health.snapshot?.granted.includes(metric.key) ? 'Check read access' : health.snapshot.failed.includes(metric.key) ? 'Could not refresh' : 'No reading today' : 'No reading today';
        return <TouchTarget key={metric.key} accessibilityRole="button" accessibilityLabel={tr(`${metric.title}: ${available ? formatHealthValue(metric.key, value) : missing}. ${source}. View activity`)} onPress={open}
          style={({ pressed }) => ({ flexGrow: 1, flexBasis: fontScale > 1.25 || width < 390 ? '45%' : '29%', minWidth: 100, padding: 14, borderRadius: 16, backgroundColor: pressed ? colors.subtle : colors.surface, gap: 8 })}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ flexShrink: 0 }}><AppIcon name={metric.icon} size={20} /></View><Text style={[c.text, { fontSize: 12, flexShrink: 1 }]}>{tr(metric.title)}</Text></View>
          <Text style={{ fontFamily: fonts.semibold, color: colors.ink, fontSize: 24, lineHeight: 32, fontVariant: ['tabular-nums'] }}>{available ? formatHealthValue(metric.key, value) : '--'}</Text>
          <Text style={[c.text, { fontSize: 12, lineHeight: 18 }]}>{available ? metric.unit : missing}</Text>
          {goal != null && <Text style={[c.text, { fontSize: 12, lineHeight: 18 }]}>{tr("Target ")}{goal.toLocaleString(locale)}{tr(metric.key === 'SleepSession' ? 'h' : metric.key === 'ExerciseSession' ? ' min' : '')}</Text>}
          {available && goal != null && <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.border }}><View style={{ height: 5, width: `${Math.min(1, value / goal) * 100}%`, backgroundColor: colors.primary, borderRadius: 3 }} /></View>}
          {week.some(hasHealthValue) && <View accessible accessibilityLabel={tr("Last seven days; gaps mean no recorded value")} style={{ height: 22, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>{week.map((entry, index) => <View key={index} style={{ flex: 1, height: hasHealthValue(entry) ? Math.max(3, entry / max * 22) : 0, borderRadius: 3, backgroundColor: colors.primary }} />)}</View>}
          <Text style={[c.text, { fontSize: 11, lineHeight: 17 }]}>{source}</Text>
          {checked && Number.isFinite(Date.parse(checked)) && <Text style={[c.text, { fontSize: 11, lineHeight: 17 }]}>{tr("Checked ")}{formatDateTime(checked)}</Text>}
        </TouchTarget>;
      })}
    </View>
    {health.snapshot && Number.isFinite(Date.parse(health.snapshot.syncedAt)) && <Text style={[c.text, { fontSize: 12 }]}>{tr(health.busy ? 'Refreshing - ' : 'Last checked ')}{formatDateTime(health.snapshot.syncedAt)}</Text>}
    {Boolean(health.error) && <Text accessibilityLiveRegion="polite" style={[c.text, { fontSize: 13, color: colors.error }]}>{tr(health.error)}</Text>}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      <TouchTarget accessibilityRole="button" onPress={() => router.push('/connected-health')} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={[c.text, { color: colors.primary }]}>{tr("Manage health apps")}</Text></TouchTarget>
      {health.connected && <TouchTarget accessibilityRole="button" accessibilityState={{ disabled: health.busy }} disabled={health.busy} onPress={() => void health.run()} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={[c.text, { color: colors.primary }]}>{tr(health.busy ? 'Refreshing...' : 'Refresh readings')}</Text></TouchTarget>}
    </View>
  </View>;
}
