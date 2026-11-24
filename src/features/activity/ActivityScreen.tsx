import { activityPeriodDays, adherenceForDay } from './periodSummary';
import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { AppScreen } from '../../components/app/AppScreen';
import { AppIcon } from '../../components/app/AppIcon';
import { DAction, DCard, DHeading, DPill, DProgress, DTabs, DText, design, ds } from '../../components/app/DesignUI';
import { useWellness } from '../personal-wellness/WellnessContext';
import { useHealthSync } from '../health-connections/HealthSyncProvider';
import { usePhoneSteps } from './PhoneStepsProvider';
import { activityMode, activityReading, emptyActivity } from './model';
import { homeVitals, sleepClock } from '../home-dashboard/vitalsModel';
import { homeWater } from '../home-dashboard/homeModel';
import { localDay } from '../personal-wellness/domain';
import { medicineSchedule } from '../personal-wellness/doseSchedule';
import { useTrackingClock } from '../personal-wellness/useTrackingClock';
import { HealthChart } from '../health-connections/HealthCharts';
import { PhoneTrackingControl } from './PhoneTrackingControl';
import { TrackingStatus } from '../personal-wellness/TrackingUI';
import { ActivityEditorScreen } from './ActivityEditorScreen';

export function ActivityScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  return edit ? <ActivityEditorScreen key={edit} /> : <ActivityDashboard />;
}
function ActivityDashboard() {
  const router = useRouter(), wellness = useWellness(), health = useHealthSync(), phone = usePhoneSteps(), now = useTrackingClock();
  const [period, setPeriod] = useState('Day'), [error, setError] = useState('');
  const [preferredMode, setMode] = useState<'manual' | 'connected' | null>(null);
  const { data, save, busy } = wellness, tracking = data.activityTracking ?? emptyActivity(), today = localDay(now);
  const connected = activityMode(preferredMode ?? (health.connected ? 'connected' : 'manual'), health.enabled || health.connected) === 'connected', values = homeVitals(today, connected, tracking, health.snapshot, phone), water = homeWater(data, now);
  const dates = activityPeriodDays(today, period);
  const adherence = activityPeriodDays(today, 'Week').map(day => adherenceForDay(data, day));
  const days = dates.map(day => ({ day, value: activityReading('Steps', day, connected ? 'connected' : 'manual', tracking, health.snapshot, phone).value }));
  const known = days.filter(day => day.value != null), average = known.length ? Math.round(known.reduce((sum, day) => sum + (day.value ?? 0), 0) / known.length) : null;
  const max = Math.max(tracking.goals.Steps ?? 0, ...days.map(day => day.value ?? 0), 1);
  const schedule = medicineSchedule(data, now), remaining = schedule.filter(row => !row.complete);
  const editActivity = () => router.push({ pathname: '/activity', params: { edit: 'entry' } });
  async function addWater() { if (!data.waterPlan) { router.push('/water'); return; } if (busy) return; setError(''); if (!await save(`water/logs/${Crypto.randomUUID()}`, { amountMl: 250, loggedAt: new Date().toISOString(), taskId: null })) setError('Could not log water. Please try again.'); }
  const display = (value: number | null, suffix = '') => value == null ? '\u2014' : `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}${suffix}`;
  return <AppScreen navigation="health" refreshing={wellness.loading || health.busy} onRefresh={() => void Promise.allSettled([wellness.refresh(), health.run()])}>
    <TrackingStatus />
    <DCard style={{ backgroundColor: design.mint, marginBottom: 12 }}>
      <DHeading title="Activity" icon="walk" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <DAction filled label="Log activity" onPress={editActivity} />
        <DAction label="Edit targets" onPress={() => router.push({ pathname: '/activity', params: { edit: 'goals' } })} />
      </View>
      <PhoneTrackingControl />
      {(health.enabled || health.connected) && <DTabs grid options={['Logged by you', 'Health app']}
        value={connected ? 'Health app' : 'Logged by you'} onChange={value => setMode(value === 'Health app' ? 'connected' : 'manual')} />}
      <DAction label="Health history" onPress={() => router.push({ pathname: '/health-history', params: { filter: 'Activity' } })} />
    </DCard>
    <View style={{ gap: 16 }}><DHeading title="Daily Activity & Vitals" subtitle={health.source?.name ?? 'Your daily health journal'} action="Sync" onPress={() => void health.run()} /><DTabs options={['Day', 'Week', 'Month', 'Trends']} value={period} onChange={setPeriod} />
    <DCard style={{ backgroundColor: '#DDF3E6', padding: 20 }}><View style={ds.row}><View style={{ flex: 1, gap: 8 }}><DText kind="small" color={design.green}>DAILY WELLNESS</DText><DText kind="title">Your health, in sync</DText><DText>{connected ? 'Connected readings and your daily routines.' : 'Your logged activity and daily routines.'}</DText></View><AppIcon name="heart" size={44} color={design.green} /></View><View style={[ds.row, { borderTopWidth: 1, borderColor: '#C2E4D4', paddingTop: 10 }]}><AppIcon name="sync" size={14} color={design.green} /><DText kind="small">{health.snapshot ? `Last synced ${new Date(health.snapshot.syncedAt).toLocaleTimeString()}` : 'Connect your health app to sync readings'}</DText></View></DCard>
    <DCard><DHeading title="Steps & Movement" subtitle={period === 'Day' ? 'Today' : `Last ${days.length} days`} icon="walk" action="Edit" onPress={editActivity} /><View style={[ds.row, { alignItems: 'flex-end' }]}><View style={{ flex: 1 }}><DText kind="value">{display(values.steps)}</DText><DText>{`/ ${tracking.goals.Steps?.toLocaleString() ?? '\u2014'} steps`}</DText></View><View><DText kind="small">{`${days.length}-day Avg`}</DText><DText kind="label">{`${display(average)} /day`}</DText></View></View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 132, gap: period === 'Month' ? 3 : 12 }}>{days.map((day, i) => <View key={day.day} style={{ flex: 1, alignItems: 'center', gap: 6 }}><View style={{ width: '100%', height: Math.max(3, ((day.value ?? 0) / max) * 96), backgroundColor: day.day === today ? design.green : '#B7DFD0', borderRadius: 5 }} />{period !== 'Month' && <DText kind="small">{i === days.length - 1 ? 'Today' : new Date(day.day + 'T12:00:00Z').toLocaleDateString('en', { weekday: 'narrow' })}</DText>}</View>)}</View>
      <View style={[ds.row, { borderTopWidth: 1, borderColor: design.border, paddingTop: 12 }]}>{[{ label: 'Distance', value: display(values.distance, ' km') }, { label: 'Active Cal', value: display(values.calories, ' kcal') }, { label: 'Active Time', value: display(activityReading('ExerciseSession', today, connected ? 'connected' : 'manual', tracking, health.snapshot, phone).value, ' min') }].map(item => <View key={item.label} style={{ flex: 1, alignItems: 'center', gap: 4 }}><DText kind="small">{item.label}</DText><DText kind="label">{item.value}</DText></View>)}</View>
    </DCard>
    <DCard><DHeading title="Cardio Rhythm" subtitle="Heart rate" icon="heart" /><View style={ds.row}><View style={{ flex: 1 }}><DText kind="small">Recorded Heart Rate</DText><DText kind="value">{display(values.heart)}<DText> bpm</DText></DText></View><DPill>{values.heart == null ? 'No reading' : 'Recorded'}</DPill></View>{health.snapshot && <HealthChart snapshot={health.snapshot} metric="HeartRate" />}<DText kind="small">Weekly Heart Rate Trend</DText></DCard>
    <DCard><DHeading title="Sleep Recovery" subtitle="Last night" icon="moon" action="Edit" onPress={editActivity} /><View style={ds.row}><View style={{ flex: 1 }}><DText kind="small">Last Night Duration</DText><DText kind="value">{values.sleep == null ? '\u2014' : sleepClock(values.sleep)}</DText></View><View><DText kind="small">Sleep Target</DText><DText kind="label">{tracking.goals.SleepSession == null ? '\u2014' : sleepClock(tracking.goals.SleepSession)}</DText></View></View><DProgress value={values.sleep != null && tracking.goals.SleepSession ? values.sleep / tracking.goals.SleepSession : 0} color="#087B86" />{health.snapshot && period === 'Trends' && <HealthChart snapshot={health.snapshot} metric="SleepSession" />}</DCard>
    <DCard><DHeading title="Hydration Tracker" subtitle={`Target: ${data.waterPlan?.targetMl.toLocaleString() ?? '\u2014'} ml/day`} icon="drop" /><DText kind="small">Intake Today</DText><View style={ds.row}><DText kind="value" style={{ flex: 1 }}>{water ? water.totalMl.toLocaleString() : '\u2014'}<DText> ml</DText></DText><DAction filled label="+250 ml" disabled={busy} onPress={() => void addWater()} /></View><DProgress value={water?.progress ?? 0} color="#087B86" /><View style={[ds.row, { justifyContent: 'space-between' }]}>{Array.from({ length: 8 }, (_, i) => <AppIcon key={i} name="glass" size={24} color={water && water.totalMl >= (i + 1) * 250 ? design.blue : '#D8E8E2'} />)}</View><DAction label="Manage Hydration >" onPress={() => router.push('/water')} /></DCard>
    <DCard><DText kind="small">Past-day targets use the current schedule; edits can change those targets.</DText><DHeading title="Prescription Dosing" subtitle={`${schedule.filter(row => row.record?.status === 'taken').length} / ${schedule.length} Taken Today`} icon="pill" /><View style={[ds.row, { justifyContent: 'space-between' }]}>{adherence.map(day => <View key={day.day} accessible accessibilityLabel={`${day.day}: ${day.taken} of ${day.planned} planned doses taken`} style={{ gap: 7, alignItems: 'center' }}><DText kind="small">{new Date(day.day + 'T12:00:00Z').toLocaleDateString('en', { weekday: 'narrow' })}</DText><DText kind="small">{day.planned ? `${day.taken}/${day.planned}` : '?'}</DText></View>)}</View>{remaining[0] && Array.isArray(data.medicineDoses) ? <View style={[ds.row, { backgroundColor: design.pale, padding: 12, borderRadius: 12 }]}><View style={{ flex: 1 }}><DText kind="label">{remaining[0].medicine.name}</DText><DText kind="small">{`Due at ${remaining[0].dose.time}`}</DText></View><DAction filled label="Mark Taken" disabled={busy} onPress={() => void save(`medicines/${remaining[0].medicine.id}/doses/${remaining[0].day}/${remaining[0].dose.time}`, { status: 'taken' })} /></View> : <DText>{remaining.length ? 'Open medicines to view your schedule' : schedule.length ? 'All doses logged today' : 'No medicines scheduled'}</DText>}</DCard>
    {!!error && <DText color="#BD3038">{error}</DText>}<DAction label="Export Wellness Summary (PDF)" onPress={() => router.push('/vitals-report')} />
    <DCard style={{ backgroundColor: design.green }}><DHeading title="Ask Jeeva AI" icon="sparkles" inverse /><DText color="#FFFFFF">Understand your daily activity and wellness patterns.</DText><DAction filled label="Ask Jeeva >" onPress={() => router.navigate('/jeeva')} /></DCard>
    </View>
  </AppScreen>;
}
