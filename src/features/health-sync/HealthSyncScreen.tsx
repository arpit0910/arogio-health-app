import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { AppIcon, type AppIconName } from '../../components/app/AppIcon';
import { CareDisclosure, careStyles as c } from '../../components/app/CareUI';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { Button } from '../../components/ui/Button';
import { Check } from '../wellness/TrackingUI';
import { useAuth } from '../auth/context/AuthContext';
import { colors, fonts } from '../../theme/tokens';
import { formatDateTime } from '../../lib/time';
import {
  connectHealth,
  healthAvailability,
  installHealthConnect,
  openHealthSettings,
  syncHealth,
} from './healthConnect';
import {
  formatHealthValue,
  healthMetrics,
  healthSourceName,
  metricAverage,
  type HealthAvailability,
  type HealthMetric,
  type HealthSnapshot,
} from './model';

const icons: Record<HealthMetric, AppIconName> = {
  Steps: 'trend',
  SleepSession: 'clock',
  HeartRate: 'heart',
  Weight: 'weight',
};
export function HealthSyncScreen() {
  const { user } = useAuth();
  return <HealthSyncSession key={user?.id ?? 'signed-out'} />;
}
function HealthSyncSession() {
  const [availability, setAvailability] = useState<HealthAvailability | null>(
    null,
  );
  const [selected, setSelected] = useState<HealthMetric[]>(
    healthMetrics.map((m) => m.key),
  );
  const [snapshot, setSnapshot] = useState<HealthSnapshot | null>(null);
  const [busy, setBusy] = useState(false),
    [connected, setConnected] = useState(false);
  const [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [metric, setMetric] = useState<HealthMetric>('Steps');
  const lock = useRef(false),
    revision = useRef(0),
    connectedRef = useRef(false),
    focused = useRef(false);
  const invalidate = useCallback(() => {
    ++revision.current;
    connectedRef.current = false;
  }, []);
  useEffect(() => {
    let alive = true;
    void healthAvailability().then((value) => {
      if (alive) setAvailability(value);
    });
    return () => {
      alive = false;
      invalidate();
    };
  }, [invalidate]);
  async function run(connect = false) {
    if (lock.current) return;
    lock.current = true;
    const request = ++revision.current;
    setBusy(true);
    setError('');
    setNotice('');
    setSnapshot(null);
    try {
      const status = await healthAvailability();
      if (request !== revision.current) return;
      setAvailability(status);
      if (status !== 'available') {
        setConnected(false);
        connectedRef.current = false;
        return;
      }
      if (connect) {
        const granted = await connectHealth(selected);
        if (request !== revision.current) return;
        if (!granted.length) {
          setNotice(
            'No access was granted. Choose data types and allow access in Health Connect to sync.',
          );
          setConnected(false);
          connectedRef.current = false;
          return;
        }
      }
      const next = await syncHealth(selected);
      if (request !== revision.current) return;
      if (!next.granted.includes(metric) && next.granted[0])
        setMetric(next.granted[0]);
      setSnapshot(next);
      setConnected(next.granted.length > 0);
      connectedRef.current = next.granted.length > 0;
      if (!next.granted.length)
        setNotice(
          'Access is off. Connect again to choose which data to share.',
        );
      else if (next.granted.length < selected.length)
        setNotice(
          'Only the data types you allowed are shown. You can change access in Health Connect.',
        );
    } catch {
      if (request === revision.current)
        setError(
          'Unable to sync health data. Check Health Connect permissions and try again. Your previous readings have been cleared.',
        );
    } finally {
      lock.current = false;
      if (request === revision.current) setBusy(false);
    }
  }
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      if (connectedRef.current) void runRef.current();
      return () => {
        focused.current = false;
      };
    }, []),
  );
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active' && focused.current && connectedRef.current)
        void runRef.current();
    });
    return () => listener.remove();
  }, []);
  async function openSettings() {
    try {
      await openHealthSettings();
    } catch {
      setError(
        'Health Connect settings could not open. Open Health Connect from Android Settings.',
      );
    }
  }
  const metricInfo = healthMetrics.find((m) => m.key === metric)!;
  const today = snapshot?.days.at(-1);
  const sources = [
    ...new Set(
      snapshot?.days.flatMap((day) =>
        Object.values(day.readings).flatMap(
          (reading) => reading?.sources ?? [],
        ),
      ) ?? [],
    ),
  ];
  if (
    snapshot?.latestWeight?.source &&
    !sources.includes(snapshot.latestWeight.source)
  )
    sources.push(snapshot.latestWeight.source);
  return (
    <AppScreen back title="Connected health">
      <View style={{ gap: 12 }}>
        <AppIcon name="sync" size={32} />
        <Text style={c.heading}>Bring your health data together.</Text>
        <Text style={c.text}>
          Read steps, sleep, heart rate and weight shared with Health Connect by
          apps such as Samsung Health and Google Fit.
        </Text>
        <Text style={c.text}>
          Your readings stay on this device. Arogio does not upload them, change
          your health profile, or write back to other apps.
        </Text>
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
            onPress={() => void healthAvailability().then(setAvailability)}
          />
        </View>
      )}
      {availability === 'available' && (
        <View style={s.section}>
          <Text style={c.title}>Choose data to read</Text>
          {!connected ? (
            <>
              {healthMetrics.map((item) => (
                <Check
                  key={item.key}
                  label={item.title}
                  checked={selected.includes(item.key)}
                  disabled={busy}
                  onChange={() =>
                    setSelected((current) =>
                      current.includes(item.key)
                        ? current.filter((key) => key !== item.key)
                        : [...current, item.key],
                    )
                  }
                />
              ))}
              <Text style={c.text}>
                Next, Android asks for access. You can allow some data types and
                decline others.
              </Text>
              <Button
                title="Connect and sync"
                loading={busy}
                disabled={!selected.length}
                onPress={() => void run(true)}
              />
            </>
          ) : (
            <>
              <Text style={c.text}>
                Connected for this session. Data refreshes when you return to
                this screen or tap Sync now.
              </Text>
              <Button
                title="Sync now"
                loading={busy}
                onPress={() => void run()}
              />
              <Button
                title="Manage data access"
                variant="secondary"
                disabled={busy}
                onPress={() => void openSettings()}
              />
              <Button
                title="Disconnect and clear readings"
                variant="secondary"
                disabled={busy}
                onPress={() => {
                  ++revision.current;
                  connectedRef.current = false;
                  setConnected(false);
                  setSnapshot(null);
                  setError('');
                  setNotice(
                    'Disconnected. Readings have been cleared from Arogio. To revoke Android permissions too, open Health Connect settings.',
                  );
                }}
              />
            </>
          )}
          {!connected && (
            <Button
              title="Health Connect settings"
              variant="secondary"
              disabled={busy}
              onPress={() => void openSettings()}
            />
          )}
        </View>
      )}
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={[c.text, s.section, { color: colors.error }]}
        >
          {error}
        </Text>
      )}
      {!!notice && (
        <Text accessibilityLiveRegion="polite" style={[c.text, s.section]}>
          {notice}
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
              .filter((item) => snapshot.granted.includes(item.key))
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
                          : item.key === 'HeartRate'
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
            <View accessibilityRole="radiogroup" style={s.tabs}>
              {healthMetrics
                .filter((item) => snapshot.granted.includes(item.key))
                .map((item) => (
                  <TouchTarget
                    key={item.key}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: metric === item.key }}
                    onPress={() => setMetric(item.key)}
                    style={[s.tab, metric === item.key && s.selected]}
                  >
                    <Text
                      style={[
                        s.label,
                        metric === item.key && { color: colors.surface },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchTarget>
                ))}
            </View>
            <Text style={s.small}>
              {metricInfo.title} /{' '}
              {metricInfo.key === 'HeartRate' || metricInfo.key === 'Weight'
                ? 'daily average'
                : 'daily total'}{' '}
              / {metricInfo.unit}
            </Text>
            {[...snapshot.days].reverse().map((day) => (
              <View key={day.day} style={s.day}>
                <Text style={c.text}>
                  {new Intl.DateTimeFormat('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    timeZone: 'Asia/Kolkata',
                  }).format(new Date(`${day.day}T12:00:00Z`))}
                </Text>
                <Text style={s.label}>
                  {formatHealthValue(metric, day.readings[metric]?.value)}
                </Text>
              </View>
            ))}
          </View>
          {snapshot.failed.length > 0 && (
            <Text style={[c.text, s.section]}>
              Some readings could not be refreshed:{' '}
              {healthMetrics
                .filter((item) => snapshot.failed.includes(item.key))
                .map((item) => item.title)
                .join(', ')}
              . Check access and try Sync now.
            </Text>
          )}
          <View style={s.section}>
            <Text style={c.title}>Data sources</Text>
            <Text style={c.text}>
              {sources.length
                ? sources.map(healthSourceName).join(', ')
                : 'No shared records found. Connect a source app to Health Connect and sync again.'}
            </Text>
            <Text style={s.small}>
              Source app sharing and available data determine what appears here.
              Missing readings are shown as No data.
            </Text>
          </View>
        </>
      )}
      <View style={s.section}>
        <CareDisclosure title="Connect Samsung Health or Google Fit">
          <Text style={c.text}>
            Open the source app and find its Health Connect setting. Allow it to
            write the data you want to see here. In Health Connect, allow Arogio
            to read those data types, then return and sync.
          </Text>
          <Text style={c.text}>
            If a watch supplies your data, sync it with its companion app first.
            Arogio can only read records that reach Health Connect.
          </Text>
        </CareDisclosure>
        <CareDisclosure title="Your data and permissions">
          <Text style={c.text}>
            Readings are held in memory while this screen is open. Leaving the
            screen clears them when it is closed. Disconnect clears them
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
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
