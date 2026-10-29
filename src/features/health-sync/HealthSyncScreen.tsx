import { StandaloneHealthScreen } from "./StandaloneHealthScreen";
import { usePalette } from "../../theme/AppearanceProvider";
import { HealthOverview } from "./HealthOverview";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "../../components/app/AppScreen";
import { AppIcon } from "../../components/app/AppIcon";
import {
  CareDisclosure,
  CareRow,
  useCareStyles,
} from "../../components/app/CareUI";
import { Button } from "../../components/ui/Button";
import { useHealthSync } from "./HealthSyncProvider";
import { fonts } from "../../theme/tokens";
import { formatDateTime } from "../../lib/time";
import { healthMetrics } from "./model";

export function HealthSyncScreen() {
  const c = useCareStyles();
  const colors = usePalette();
  const s = useStyles();

  const {
    snapshot,
    connected,
    source,
    error: syncError,
    busy,
    run,
  } = useHealthSync();
  if (!connected) return <StandaloneHealthScreen />;
  return (
    <AppScreen back title="Connected health">
      <View style={{ gap: 12 }}>
        <Text style={c.heading}>Connected readings</Text>
        {connected && (
          <View style={{ gap: 12 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <AppIcon name="sync" size={18} />
              <Text style={[s.small, { flex: 1 }]}>
                {source?.name ?? "Selected health app"} - Automatic sync
              </Text>
            </View>
            <Button
              title="Refresh readings"
              variant="secondary"
              loading={busy}
              onPress={() => void run()}
            />
          </View>
        )}
        {(source || snapshot || connected) && (
          <View
            accessibilityLiveRegion="polite"
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              marginTop: 4,
            }}
          >
            <AppIcon name="clock" size={20} color={colors.muted} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.label}>Last sync</Text>
              <Text style={c.text}>
                {snapshot
                  ? formatDateTime(snapshot.syncedAt)
                  : busy
                    ? "First sync in progress..."
                    : "Not synced yet"}
              </Text>
              {busy && snapshot && (
                <Text style={s.small}>Syncing new readings...</Text>
              )}
            </View>
          </View>
        )}
      </View>
      {!!syncError && (
        <Text
          accessibilityRole="alert"
          style={[c.text, s.section, { color: colors.error }]}
        >
          {syncError}
        </Text>
      )}
      {snapshot && snapshot.granted.length > 0 && (
        <>
          <View style={{ marginTop: 24 }}>
            <CareRow
              icon="device"
              title="Use Arogio tracking"
              detail="Your own totals and phone-counted steps"
              onPress={() => router.push("/activity")}
            />
          </View>
          <HealthOverview snapshot={snapshot} />
          {snapshot.failed.length > 0 && (
            <Text style={[c.text, s.section]}>
              Some readings could not be refreshed:{" "}
              {healthMetrics
                .filter((item) => snapshot.failed.includes(item.key))
                .map((item) => item.title)
                .join(", ")}
              . Manage access or refresh in Connected health settings.
            </Text>
          )}
          <View style={s.section}>
            <Text style={c.title}>Your data source</Text>
            <Text style={c.text}>
              {source?.name ?? "Choose a health app in Settings"}
            </Text>
            <Text style={s.small}>
              Only readings shared by your selected health app are included.
              Missing readings are shown as No data.
            </Text>
            <CareRow
              title="Change connected app"
              onPress={() => router.push("/connected-health-settings")}
            />
          </View>
        </>
      )}

      <View style={s.section}>
        <CareDisclosure title="Connect Samsung Health or Google Fit">
          <Text style={c.text}>
            Open the source app and find its Health Connect setting. Allow it to
            write the data you want to see here. In Health Connect, allow Arogio
            to read those data types, then return to Arogio. Your data refreshes
            automatically.
          </Text>
          <Text style={c.text}>
            If a watch supplies your data, sync it with its companion app first.
            Arogio can only read records that reach Health Connect.
          </Text>
        </CareDisclosure>
        <CareDisclosure title="Your data and permissions">
          <Text style={c.text}>
            Readings stay in memory during your signed-in app session. If you
            enable background refresh, a recent overview is stored encrypted on
            this device. Disconnect clears them immediately and stops refreshes.
            Signing out clears the session. No health readings are sent to the
            Arogio API.
          </Text>
          <Text style={c.text}>
            Disconnect does not remove records from Samsung Health, Google Fit
            or Health Connect. Use Android Health Connect settings to revoke
            Arogio permissions.
          </Text>
          <Button
            title="View privacy information"
            variant="secondary"
            onPress={() => router.push("/privacy")}
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
    section: { marginTop: 32, gap: 12 },
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
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    tabs: { flexDirection: "row", gap: 8, paddingBottom: 10 },
    tab: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      justifyContent: "center",
    },
    selected: { backgroundColor: colors.primary, borderColor: colors.primary },
    day: {
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
  });
};
