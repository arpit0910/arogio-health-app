import { Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useCareStyles } from '../../components/app/CareUI';
import { useAppearance } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { useWellness } from '../wellness/WellnessContext';
import { useHealthSync } from '../health-sync/HealthSyncProvider';
import { usePhoneSteps } from './PhoneStepsProvider';
import { activityReading, emptyActivity } from './model';
import { addDays, localDay } from '../wellness/domain';
import { useTrackingClock } from '../wellness/useTrackingClock';
import { formatHealthValue, hasHealthValue } from '../health-sync/model';

const metrics = [
  { key: 'Steps', title: 'Steps', icon: 'walk' },
  { key: 'ExerciseSession', title: 'Movement', icon: 'clock' },
  { key: 'SleepSession', title: 'Sleep', icon: 'moon' },
] as const;
export function TodayActivity() {
  const c = useCareStyles(), { colors } = useAppearance(), { fontScale } = useWindowDimensions();
  const { data } = useWellness(), health = useHealthSync(), phone = usePhoneSteps();
  const tracking = data.activityTracking ?? emptyActivity(), day = localDay(useTrackingClock());
  const mode = health.connected ? 'connected' : 'manual';
  const rows = metrics.flatMap(metric => {
    const value = activityReading(metric.key, day, mode, tracking, health.snapshot, phone).value;
    return hasHealthValue(value) ? [{ ...metric, value }] : [];
  });
  if (!rows.length) return null;
  const open = () => router.push({ pathname: '/activity', params: { source: mode } });
  return <View style={{ marginTop: 20 }}>
    <TouchTarget accessibilityRole="button" accessibilityLabel="View all activity" onPress={open} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text accessibilityRole="header" style={[c.title, { flex: 1 }]}>Today&apos;s activity</Text>
      <Text style={[c.text, { color: colors.primary, fontSize: 13 }]}>View all</Text><AppIcon name="right" size={17} />
    </TouchTarget>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
      {rows.map(row => {
        const goal = tracking.goals[row.key], ratio = goal ? Math.min(1, row.value / goal) : 0;
        const week = Array.from({ length: 7 }, (_, i) => activityReading(row.key, addDays(day, i - 6), mode, tracking, health.snapshot, phone).value);
        const max = Math.max(1, ...week.filter(hasHealthValue));
        return <TouchTarget key={row.key} accessibilityRole="button" accessibilityLabel={`${row.title}: ${formatHealthValue(row.key, row.value)}${goal ? `. Target ${goal}` : ''}. View activity`} onPress={open}
          style={({ pressed }) => ({ flexGrow: 1, flexBasis: fontScale > 1.25 ? '45%' : rows.length === 3 ? '29%' : '44%', minWidth: 100, padding: 14, borderRadius: 16, backgroundColor: pressed ? colors.subtle : colors.surface })}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><AppIcon name={row.icon} size={20} /><Text style={[c.text, { fontSize: 12, flexShrink: 1 }]}>{row.title}</Text></View>
          <Text style={{ fontFamily: fonts.semibold, color: colors.ink, fontSize: 24, lineHeight: 32, marginTop: 12, fontVariant: ['tabular-nums'] }}>{formatHealthValue(row.key, row.value)}</Text>
          {goal != null && <><Text style={[c.text, { fontSize: 12, marginTop: 2 }]}>of {row.key === 'SleepSession' ? `${goal}h` : `${goal.toLocaleString('en-IN')}${row.key === 'ExerciseSession' ? ' min' : ''}`}</Text><View style={{ height: 5, borderRadius: 3, backgroundColor: colors.border, marginTop: 10 }}><View style={{ height: 5, width: `${ratio * 100}%`, backgroundColor: colors.primary, borderRadius: 3 }} /></View></>}
          {week.some(hasHealthValue) && <View accessible accessibilityLabel="Last seven days; gaps mean no recorded value" style={{ height: 22, flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 14 }}>{week.map((value, i) => <View key={i} style={{ flex: 1, height: hasHealthValue(value) ? Math.max(3, value / max * 22) : 0, borderRadius: 3, backgroundColor: colors.primary }} />)}</View>}
        </TouchTarget>;
      })}
    </View>
    <Text style={[c.text, { fontSize: 12, marginTop: 8 }]}>{mode === 'connected' ? `From ${health.source?.name ?? 'your health app'}${health.busy ? ' ? Updating?' : ''}` : phone.enabled ? 'Phone activity' : 'Your logged activity'}</Text>
  </View>;
}
