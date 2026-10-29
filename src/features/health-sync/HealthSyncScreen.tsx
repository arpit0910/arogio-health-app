import { DailyTargetProgress } from '../activity/DailyTargetProgress';
import { useWellness } from '../wellness/WellnessContext';
import type { ActivityMetric } from '../activity/model';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { AppIcon, type AppIconName } from '../../components/app/AppIcon';
import { CareDisclosure, CareRow, careStyles as c } from '../../components/app/CareUI';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { Button } from '../../components/ui/Button';
import { HealthSourcePicker } from './HealthSourcePicker';
import { useHealthSync } from './HealthSyncProvider';
import { HealthChart, WeeklyShare } from './HealthCharts';
import { colors, fonts } from '../../theme/tokens';
import { formatDateTime } from '../../lib/time';
import {
  installHealthConnect,
} from './healthConnect';
import {
  formatHealthValue,
  healthMetrics,
  metricAverage,
  type HealthMetric,
} from './model';

const icons: Record<HealthMetric, AppIconName> = {
  Steps: 'trend',
  SleepSession: 'clock',
  HeartRate: 'heart',
  Weight: 'weight',
  Distance: 'location',
  Nutrition: 'leaf',
  ActiveCaloriesBurned: 'bolt',
  TotalCaloriesBurned: 'bolt',
  ExerciseSession: 'trend',
  FloorsClimbed: 'trend',
  RestingHeartRate: 'heart',
  Hydration: 'drop',
};
export function HealthSyncScreen() {
  const { availability, snapshot, connected, hasConnected, ready, source, error: syncError, checkAvailability } = useHealthSync();
  const { data: wellness } = useWellness();
  const [error, setError] = useState('');
  const [metric, setMetric] = useState<HealthMetric>('Steps');
  const activeMetric = snapshot?.granted.includes(metric) ? metric : snapshot?.granted[0] ?? metric;
  const metricInfo = healthMetrics.find((m) => m.key === activeMetric)!;
  const today = snapshot?.days.at(-1);
  const connectionPanel = availability === 'available' ? (
    <View style={s.section}>{!ready ? <ActivityIndicator color={colors.primary} /> : !connected && !hasConnected ? <HealthSourcePicker /> :
      <CareRow title={source ? "Connected app" : "Choose your data source"} detail={source ? `${source.name} - ${connected ? 'automatic sync on' : 'manage access and sync'}` : 'Select one app in Settings to continue'} onPress={() => router.push('/connected-health-settings')} />}
    </View>
  ) : null;
  return (
    <AppScreen back title="Connected health">
      <View style={{ gap: 12 }}>
        {!connected && <AppIcon name="sync" size={32} />}
        <Text style={c.heading}>{connected ? 'Your health, at a glance.' : hasConnected ? 'Your connected health' : 'Bring your health data together.'}</Text>
        {!connected && !hasConnected && <Text style={c.text}>
          Explore activity, sleep, heart rate, weight and more shared with Health Connect by
          apps such as Samsung Health and Google Fit.
        </Text>}
        {!connected && !hasConnected && <Text style={c.text}>
          Your readings stay on this device. Arogio does not upload them, change
          your health profile, or write back to other apps.
        </Text>}
        {connected && <Text style={s.small}>{source?.name ?? 'Selected health app'}. Automatic refresh is on.</Text>}
      </View>
      {availability === null && (
        <ActivityIndicator
          accessibilityLabel="Checking Health Connect"
          color={colors.primary}
          style={s.section}
        />
      )}
      {availability === 'unsupported' && (
        <View style={s.section}>
          <Text style={c.title}>Health Connect is unavailable here</Text>
          <Text style={c.text}>
            {Platform.OS === 'android'
              ? 'This device does not support Health Connect. Android 9 or later and an available Health Connect provider are required.'
              : 'Open Arogio on Android to connect health apps. Apple Health and web sync are not connected.'}
          </Text>
        </View>
      )}
      {availability === 'rebuild-required' && (
        <View style={s.section}>
          <Text style={c.title}>An updated app build is needed</Text>
          <Text style={c.text}>
            Install an Arogio Android build that includes Health Connect, then
            return here.
          </Text>
        </View>
      )}
      {availability === 'update-required' && (
        <View style={s.section}>
          <Text style={c.title}>Install or update Health Connect</Text>
          <Text style={c.text}>
            Health Connect lets compatible apps share the data you allow.
          </Text>
          <Button
            title="Get Health Connect"
            onPress={() =>
              void installHealthConnect().catch(() =>
                setError('Open the Play Store and search for Health Connect.'),
              )
            }
          />
          <Button
            title="Check again"
            variant="secondary"
            onPress={() => void checkAvailability()}
          />
        </View>
      )}
      {!connected && connectionPanel}
      {!!(error || syncError) && (
        <Text
          accessibilityRole="alert"
          style={[c.text, s.section, { color: colors.error }]}
        >
          {error || syncError}
        </Text>
      )}
      {snapshot && snapshot.granted.length > 0 && (
        <>
          <View style={s.section}>
            <Text style={c.title}>Your latest overview</Text>
            <Text style={s.small}>
              Updated {formatDateTime(snapshot.syncedAt)}
            </Text>
            <Text style={s.small}>
              Daily boundaries use IST. Sleep is the duration recorded within
              each day.
            </Text>
            {healthMetrics
              .filter((item) => item.key === activeMetric && snapshot.granted.includes(item.key))
              .map((item) => {
                const value =
                  item.key === 'Weight'
                    ? snapshot.latestWeight?.kg
                    : today?.readings[item.key]?.value;
                const average = metricAverage(snapshot, item.key);
                return (
                  <View key={item.key} style={s.reading}>
                    <AppIcon name={icons[item.key]} size={22} />
                    <View style={s.flex}>
                      <Text style={s.label}>
                        {item.key === 'Weight'
                          ? 'Latest weight'
                          : `${item.title} today`}
                      </Text>
                      <Text style={s.small}>
                        {item.key === 'Weight'
                          ? snapshot.latestWeight
                            ? formatDateTime(snapshot.latestWeight.at)
                            : 'No measurement in the last 30 days'
                          : ['HeartRate', 'RestingHeartRate'].includes(item.key)
                            ? 'Average of recorded measurements'
                            : average
                              ? `7-day daily average: ${formatHealthValue(item.key, average.value)} / ${average.days} recorded days`
                              : 'No shared readings in the last 7 days'}
                      </Text>
                    </View>
                    <Text style={s.number}>
                      {formatHealthValue(item.key, value)}
                      {value != null && item.key !== 'SleepSession'
                        ? ` ${item.unit}`
                        : ''}
                    </Text>
                  </View>
                );
              })}
          </View>
          <View style={s.section}>
            <Text style={c.title}>Last 7 days</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator accessibilityRole="radiogroup" contentContainerStyle={s.tabs}>
              {healthMetrics
                .filter((item) => snapshot.granted.includes(item.key))
                .map((item) => (
                  <TouchTarget
                    key={item.key}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: activeMetric === item.key }}
                    onPress={() => setMetric(item.key)}
                    style={[s.tab, activeMetric === item.key && s.selected]}
                  >
                    <Text
                      style={[
                        s.label,
                        activeMetric === item.key && { color: colors.surface },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchTarget>
                ))}
            </ScrollView>
            <Text style={s.small}>
              {metricInfo.title} /{' '}
              {['HeartRate', 'RestingHeartRate', 'Weight'].includes(metricInfo.key)
                ? 'daily average'
                : 'daily total'}{' '}
              / {metricInfo.unit}
            </Text>
            {wellness.activityTracking?.goals[activeMetric as ActivityMetric] != null && <DailyTargetProgress value={today?.readings[activeMetric]?.value ?? null} goal={wellness.activityTracking.goals[activeMetric as ActivityMetric]} unit={metricInfo.unit} />}
            <CareRow title="Daily targets" detail="Set or change your Arogio targets" onPress={() => router.push('/activity')} />
            <HealthChart snapshot={snapshot} metric={activeMetric} />
            <WeeklyShare snapshot={snapshot} metric={activeMetric} />
            <CareDisclosure title="Daily readings">
              {[...snapshot.days].reverse().map((day) => (
                <View key={day.day} style={s.day}>
                  <Text style={c.text}>{new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(`${day.day}T12:00:00Z`))}</Text>
                  <Text style={s.label}>{formatHealthValue(activeMetric, day.readings[activeMetric]?.value)} {day.readings[activeMetric]?.value != null ? metricInfo.unit : ''}</Text>
                </View>
              ))}
            </CareDisclosure>
          </View>
          {snapshot.failed.length > 0 && (
            <Text style={[c.text, s.section]}>
              Some readings could not be refreshed:{' '}
              {healthMetrics
                .filter((item) => snapshot.failed.includes(item.key))
                .map((item) => item.title)
                .join(', ')}
              . Manage access or refresh in Connected health settings.
            </Text>
          )}
          <View style={s.section}>
            <Text style={c.title}>Your data source</Text>
            <Text style={c.text}>{source?.name ?? 'Choose a health app in Settings'}</Text>
            <Text style={s.small}>Only readings written by this app are included. Missing readings are shown as No data.</Text>
            <CareRow title="Change connected app" onPress={() => router.push('/connected-health-settings')} />
          </View>
        </>
      )}
      {connected && connectionPanel}
      <View style={s.section}>
        <CareDisclosure title="Connect Samsung Health or Google Fit">
          <Text style={c.text}>
            Open the source app and find its Health Connect setting. Allow it to
            write the data you want to see here. In Health Connect, allow Arogio
            to read those data types, then return to Arogio. Your data refreshes automatically.
          </Text>
          <Text style={c.text}>
            If a watch supplies your data, sync it with its companion app first.
            Arogio can only read records that reach Health Connect.
          </Text>
        </CareDisclosure>
        <CareDisclosure title="Your data and permissions">
          <Text style={c.text}>
            Readings stay in memory during your signed-in app session. If you enable
            background refresh, a recent overview is stored encrypted on this device. Disconnect clears them
            immediately and stops refreshes. Signing out clears the session. No
            health readings are sent to the Arogio API.
          </Text>
          <Text style={c.text}>
            Disconnect does not remove records from Samsung Health, Google Fit
            or Health Connect. Use Android Health Connect settings to revoke
            Arogio permissions.
          </Text>
          <Button
            title="View privacy information"
            variant="secondary"
            onPress={() => router.push('/privacy')}
          />
        </CareDisclosure>
      </View>
    </AppScreen>
  );
}
const s = StyleSheet.create({
  section: { marginTop: 28, gap: 12 },
  small: { ...c.text, fontSize: 13, lineHeight: 20 },
  flex: { flex: 1, minWidth: 120 },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 23,
    color: colors.ink,
  },
  number: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 26,
    color: colors.ink,
    flexShrink: 1,
  },
  reading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tabs: { flexDirection: 'row', gap: 8, paddingBottom: 10 },
  tab: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  day: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
});
