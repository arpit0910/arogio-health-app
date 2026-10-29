import { usePalette } from '../../theme/AppearanceProvider';
import { HealthOverview } from './HealthOverview';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { AppIcon } from '../../components/app/AppIcon';
import { CareDisclosure, CareRow, useCareStyles } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { HealthSourcePicker } from './HealthSourcePicker';
import { useHealthSync } from './HealthSyncProvider';
import { fonts } from '../../theme/tokens';
import { formatDateTime } from '../../lib/time';
import {
  installHealthConnect,
} from './healthConnect';
import {
  healthMetrics,
} from './model';

export function HealthSyncScreen() {
  const c = useCareStyles();
  const colors = usePalette();
  const s = useStyles();

  const { availability, snapshot, connected, hasConnected, ready, source, error: syncError, busy, run, checkAvailability } = useHealthSync();
  const [error, setError] = useState('');
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
        {connected && <View style={{ gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><AppIcon name="sync" size={18} /><Text style={[s.small, { flex: 1 }]}>{source?.name ?? 'Selected health app'} - Automatic sync</Text></View>{snapshot && <Text style={s.small}>Last refreshed {formatDateTime(snapshot.syncedAt)}</Text>}<Button title="Refresh readings" variant="secondary" loading={busy} onPress={() => void run()} /></View>}
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
          <HealthOverview snapshot={snapshot} />
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
            <Text style={s.small}>Only readings shared by your selected health app are included. Missing readings are shown as No data.</Text>
            <CareRow title="Change connected app" onPress={() => router.push('/connected-health-settings')} />
          </View>
        </>
      )}

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
const useStyles = () => {
  const c = useCareStyles();
  const colors = usePalette();
return StyleSheet.create({
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
};
