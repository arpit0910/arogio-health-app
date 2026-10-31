import { useTranslation } from "../../localization/LanguageProvider";
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { AppIcon, type AppIconName } from '../../components/app/AppIcon';
import { CareDisclosure, CareRow, useCareStyles } from '../../components/app/CareUI';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { useWellness } from '../wellness/WellnessContext';
import { useHealthSync } from '../health-sync/HealthSyncProvider';
import { HealthChart } from '../health-sync/HealthCharts';
import { hasHealthValue, formatHealthValue } from '../health-sync/model';
import { CalendarField } from '../wellness/CalendarField';
import { Field, TrackingStatus, confirmDelete } from '../wellness/TrackingUI';
import { TrackingFeedback, useTrackingFeedback } from '../wellness/TrackingFeedback';
import { useTrackingClock } from '../wellness/useTrackingClock';
import { addDays, localDay, validDay } from '../wellness/domain';
import { activityMetrics, activityMode, activityReading, emptyActivity, parseActivityValue, type ActivityMetric } from './model';
import { DailyTargetProgress } from './DailyTargetProgress';
import { usePhoneSteps } from './PhoneStepsProvider';
import { PhoneTrackingControl } from './PhoneTrackingControl';

const icons: Record<ActivityMetric, AppIconName> = { Steps: 'walk', ActiveCaloriesBurned: 'bolt', Nutrition: 'leaf', Distance: 'location', ExerciseSession: 'clock', SleepSession: 'moon' };
export function ActivityScreen() {
  const { t: tr, locale } = useTranslation();
  const c = useCareStyles(), colors = usePalette(), wellness = useWellness(), health = useHealthSync(), phone = usePhoneSteps();
  const { data, busy, save, refresh } = wellness;
  const tracking = data.activityTracking ?? emptyActivity(), today = localDay(useTrackingClock());
  const [selectedDay, setDay] = useState<string | null>(null), day = selectedDay ?? today;
  const params = useLocalSearchParams<{ source?: string; edit?: string }>();
  const [preferredMode, setMode] = useState<'manual' | 'connected' | null>(params.source === 'manual' ? 'manual' : params.source === 'connected' ? 'connected' : null);
  const mode = activityMode(preferredMode, health.connected);
  const [editor, setEditor] = useState<'goals' | 'entry' | null>(params.edit === 'goals' && wellness.ready ? 'goals' : null), [entryMetric, setEntryMetric] = useState<ActivityMetric | null>(null);
  const [entryDay, setEntryDay] = useState(day), [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(activityMetrics.map(item => [item.key, tracking.goals[item.key] == null ? '' : String(tracking.goals[item.key])]))), [changed, setChanged] = useState<ActivityMetric[]>([]);
  const [chosenTrend, setTrend] = useState<ActivityMetric>('Steps');
  const { feedback, setFeedback } = useTrackingFeedback();
  const lock = useRef(false), opened = useRef(editor === 'goals');
  function edit(kind: 'goals' | 'entry', metric: ActivityMetric | null = null) {
    const values = kind === 'goals' ? tracking.goals : tracking.days.find(entry => entry.day === day)?.values ?? {};
    setDraft(Object.fromEntries(activityMetrics.map(item => [item.key, values[item.key] == null ? '' : String(values[item.key])])));
    setChanged([]); setEntryMetric(metric); setEntryDay(day); setEditor(kind); setFeedback(null);
  }
  useEffect(() => {
    if (params.edit !== 'goals' || !wellness.ready || opened.current) return;
    const timer = setTimeout(() => {
      opened.current = true;
      setDraft(Object.fromEntries(activityMetrics.map(item => [item.key, tracking.goals[item.key] == null ? '' : String(tracking.goals[item.key])])));
      setEditor('goals');
    }, 0);
    return () => clearTimeout(timer);
  }, [params.edit, wellness.ready, tracking.goals]);
  async function commit() {
    if (lock.current || busy) return;
    if (!changed.length) { setEditor(null); return; }
    lock.current = true;
    try {
      const values = Object.fromEntries(changed.map(key => [key, parseActivityValue(key, draft[key] ?? '', editor === 'goals')]));
      if (await save(editor === 'goals' ? 'activity/goals' : `activity/days/${entryDay}`, editor === 'goals' ? { goals: values } : { values })) {
        setEditor(null); setFeedback(editor === 'goals' ? 'Targets saved. Your progress uses these goals throughout Arogio.' : 'Activity saved.', 'success');
      } else setFeedback('Your changes could not be confirmed. They are still here. Check your connection and try Save again.');
    } catch (e) { setFeedback(e instanceof Error ? e.message : 'Check the values and try again.'); }
    finally { lock.current = false; }
  }
  const rows = activityMetrics.flatMap(item => {
    const reading = activityReading(item.key, day, mode, tracking, health.snapshot, phone);
    return hasHealthValue(reading.value) ? [{ ...item, value: reading.value }] : [];
  });
  const trends = activityMetrics.filter(item => Array.from({ length: 7 }, (_, i) => activityReading(item.key, addDays(day, i - 6), mode, tracking, health.snapshot, phone).value).some(hasHealthValue));
  const trend = trends.some(item => item.key === chosenTrend) ? chosenTrend : trends[0]?.key;
  const history = { syncedAt: health.snapshot?.syncedAt ?? new Date().toISOString(), granted: trend ? [trend] : [], latestWeight: null, failed: [], days: Array.from({ length: 7 }, (_, i) => { const date = addDays(day, i - 6); return { day: date, readings: trend ? { [trend]: { value: activityReading(trend, date, mode, tracking, health.snapshot, phone).value, sources: [] } } : {} }; }) };
  const fieldItems = activityMetrics.filter(item => !entryMetric || item.key === entryMetric).filter(item => editor !== 'entry' || item.key !== 'Steps' || !phone.enabled);
  const field = (item: typeof activityMetrics[number]) => <Field key={item.key} label={`${item.title} (${item.unit})`} value={draft[item.key] ?? ''} placeholder={tr(editor === 'goals' ? 'Daily target' : 'Total for this day')} onChange={value => { setDraft(current => ({ ...current, [item.key]: value })); setChanged(current => current.includes(item.key) ? current : [...current, item.key]); }} numeric decimal={!item.whole} icon={icons[item.key]} />;
  return <AppScreen back title={tr(editor === 'goals' ? 'Daily targets' : editor === 'entry' ? 'Log activity' : 'Activity')} refreshing={wellness.loading || health.busy} onRefresh={() => void Promise.allSettled([refresh(), health.run()])}>
    <Text accessibilityRole="header" style={c.heading}>{tr(editor === 'goals' ? 'Your daily targets' : editor === 'entry' ? 'Log your activity' : 'Your activity')}</Text>
    <Text style={[c.text, { marginTop: 8 }]}>{tr(editor === 'goals' ? 'Set your goals once. They apply to both logged and connected readings.' : editor === 'entry' ? `Enter totals for ${entryDay}. Leave a field blank to clear it.` : mode === 'connected' ? `Readings from ${health.source?.name ?? 'your health app'}.` : 'Your logged totals and phone activity.')}</Text>
    <TrackingStatus /><TrackingFeedback value={feedback} />
    {!!health.error && mode === 'connected' && <Text accessibilityRole="alert" style={[c.text, { color: colors.error, marginTop: 12 }]}>{tr(health.error)}</Text>}
    {editor ? <View style={{ gap: 14, marginTop: 24 }}>
      {fieldItems.filter(item => entryMetric || ['Steps', 'ExerciseSession', 'SleepSession'].includes(item.key)).map(field)}
      {!entryMetric && <CareDisclosure title={tr("Calories and distance")}>{fieldItems.filter(item => !['Steps', 'ExerciseSession', 'SleepSession'].includes(item.key)).map(field)}</CareDisclosure>}
      {editor === 'goals' && <CareDisclosure title={tr("About connected app targets")}><Text style={c.text}>{tr("These are your Arogio targets. Samsung Health targets are not shared by the current connection. Enter the same values here to use matching goals.")}</Text></CareDisclosure>}
      <Button title={tr(editor === 'goals' ? 'Save targets' : 'Save activity')} loading={busy} onPress={() => void commit()} />
      <Button title={tr("Cancel")} variant="secondary" disabled={busy} onPress={() => { setEditor(null); setFeedback(null); }} />
    </View> : <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
        <View style={{ flexGrow: 1, flexBasis: 130 }}><Button title={tr("Log activity")} disabled={busy || !wellness.ready} onPress={() => { setMode('manual'); edit('entry'); }} /></View>
        <View style={{ flexGrow: 1, flexBasis: 130 }}><Button title={tr("Edit targets")} variant="secondary" disabled={busy || !wellness.ready} onPress={() => edit('goals')} /></View>
      </View>
      <View style={{ marginTop: 24, gap: 12 }}>
        <Text style={c.title}>{tr(day === today ? 'Today' : day)}</Text>
        {health.connected && <View accessibilityRole="radiogroup" accessibilityLabel={tr("Activity source")} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(['connected', 'manual'] as const).map(value => <TouchTarget key={value} accessibilityRole="radio" accessibilityState={{ checked: mode === value }} onPress={() => setMode(value)} style={{ paddingHorizontal: 14, justifyContent: 'center', borderBottomWidth: mode === value ? 2 : 0, borderColor: colors.primary }}><Text style={[c.text, { color: mode === value ? colors.primary : colors.muted }]}>{tr(value === 'connected' ? health.source?.name ?? 'Health app' : 'Logged by you')}</Text></TouchTarget>)}</View>}
        {rows.map(item => <View key={item.key} style={{ padding: 16, borderRadius: 16, backgroundColor: colors.surface, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><AppIcon name={icons[item.key]} size={22} /><Text style={[c.text, { color: colors.ink, flex: 1 }]}>{tr(item.title)}</Text><Text style={c.title}>{tr(item.key === 'SleepSession' ? formatHealthValue(item.key, item.value) : item.value.toLocaleString(locale, { maximumFractionDigits: 2 }))} {item.key !== 'SleepSession' && <Text style={c.text}>{item.unit}</Text>}</Text></View>
          {tracking.goals[item.key] != null && <DailyTargetProgress value={item.value} goal={tracking.goals[item.key]} unit={item.unit} />}
        </View>)}
        {!rows.length && !wellness.loading && <Text style={c.text}>{tr(mode === 'connected' ? 'No readings for this day. Other recorded days are available below.' : 'Log an activity or turn on phone steps to get started.')}</Text>}
      </View>
      {Object.keys(tracking.goals).length > 0 && <View style={{ marginTop: 24, gap: 8 }}><Text style={c.title}>{tr("Daily targets")}</Text>{activityMetrics.filter(item => tracking.goals[item.key] != null).map(item => <TouchTarget key={item.key} accessibilityRole="button" accessibilityLabel={tr(`Edit ${item.title} target`)} onPress={() => edit('goals', item.key)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}><Text style={[c.text, { flex: 1 }]}>{tr(item.title)}</Text><Text style={[c.text, { color: colors.ink }]}>{tracking.goals[item.key]?.toLocaleString(locale)} {item.unit}</Text><AppIcon name="right" size={16} /></TouchTarget>)}</View>}
      {trend && <View style={{ marginTop: 24, gap: 12 }}><Text style={c.title}>{tr("Last 7 days")}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{trends.map(item => <TouchTarget key={item.key} accessibilityRole="button" accessibilityState={{ selected: trend === item.key }} onPress={() => setTrend(item.key)} style={{ justifyContent: 'center', paddingHorizontal: 12, borderBottomWidth: trend === item.key ? 2 : 0, borderColor: colors.primary }}><Text style={[c.text, { color: trend === item.key ? colors.primary : colors.muted }]}>{tr(item.title)}</Text></TouchTarget>)}</View><HealthChart snapshot={history} metric={trend} /></View>}
      <View style={{ marginTop: 24 }}><CareDisclosure title={tr("Date and tracking options")}><CalendarField label={tr("Activity day")} mode="date" value={day} onChange={value => { if (!validDay(value) || value > today || value < addDays(today, -89)) { setFeedback('Choose a date within the last 90 days.'); return; } setDay(value); }} />{selectedDay && <Button title={tr("Back to today")} variant="secondary" onPress={() => setDay(null)} />}<PhoneTrackingControl /><CareRow icon="sync" title={tr("Health apps")} detail={tr(health.source?.name ?? 'Connect an app for automatic readings')} onPress={() => router.push('/connected-health')} /></CareDisclosure></View>
      <View style={{ marginTop: 16 }}><CareDisclosure title={tr("Manage activity data")}><Text style={c.text}>{tr("Targets and logged totals are saved to your account. Phone steps and imported readings stay on this device.")}</Text><Button title={tr("Delete activity data")} variant="danger" disabled={busy || phone.busy} onPress={() => confirmDelete('Delete activity data?', 'This removes Arogio targets, logged totals and phone counts.', () => void (async () => { if (await save('activity/data', undefined, 'DELETE')) { try { await phone.clear(); setFeedback('Activity data deleted.', 'success'); } catch { setFeedback('Account data was deleted. Phone counts could not be cleared. Try again.'); } } })(), tr)} /></CareDisclosure></View>
    </>}
  </AppScreen>;
}
