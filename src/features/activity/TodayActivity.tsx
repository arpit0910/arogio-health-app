import { useHealthSync } from "../health-sync/HealthSyncProvider";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { AppIcon } from "../../components/app/AppIcon";
import { useCareStyles } from "../../components/app/CareUI";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { usePalette } from "../../theme/AppearanceProvider";
import { fonts } from "../../theme/tokens";
import { useWellness } from "../wellness/WellnessContext";
import { usePhoneSteps } from "./PhoneStepsProvider";
import { activityReading, emptyActivity } from "./model";
import { useTrackingClock } from "../wellness/useTrackingClock";
import { localDay } from "../wellness/domain";
import { formatHealthValue } from "../health-sync/model";
export function TodayActivity() {
  const c = useCareStyles(),
    colors = usePalette();
  const { data, loading, error } = useWellness(),
    phone = usePhoneSteps();
  const day = localDay(useTrackingClock()),
    tracking = data.activityTracking ?? emptyActivity();
  const health = useHealthSync();
  const mode = health.connected ? "connected" : "manual";
  const openActivity = () => router.push({ pathname: "/activity", params: { source: mode } });
  const steps = activityReading("Steps", day, mode, tracking, health.snapshot, phone);
  const rows = [
    { key: "Steps", title: "Steps", unit: "steps", icon: "trend" },
    { key: "ExerciseSession", title: "Movement", unit: "min", icon: "clock" },
    { key: "SleepSession", title: "Sleep", unit: "", icon: "moon" },
  ] as const;
  return (
    <View
      style={{
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderColor: colors.border,
      }}
    >
      <TouchTarget
        accessibilityRole="button"
        accessibilityLabel="Open daily activity"
        onPress={openActivity}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingBottom: 12,
        }}
      >
        <Text accessibilityRole="header" style={[c.title, { flex: 1 }]}>
          Today’s activity
        </Text>
        <AppIcon name="right" size={20} />
      </TouchTarget>
      <View style={{ gap: 0 }}>
        {rows.map((row) => {
          const reading =
            row.key === "Steps"
              ? steps
              : activityReading(row.key, day, mode, tracking, health.snapshot, phone);
          const usesPhone =
            mode === "manual" && row.key === "Steps" && phone.enabled;
          const unavailable =
            mode === "manual" && !usesPhone && (loading || !!error);
          return (
            <TouchTarget
              key={row.key}
              accessibilityRole="button"
              accessibilityLabel={`${row.title}, ${unavailable ? "unavailable" : formatHealthValue(row.key, reading.value)}. Open activity`}
              onPress={openActivity}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                columnGap: 12,
                rowGap: 8,
                paddingVertical: 14,
                backgroundColor: pressed ? colors.subtle : "transparent",
              })}
            >
              <AppIcon name={row.icon} size={20} />
              <Text
                style={[c.text, { flex: 1, minWidth: 88, color: colors.ink }]}
              >
                {row.title}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.semibold,
                  fontSize: 20,
                  lineHeight: 28,
                  color: colors.ink,
                }}
              >
                {unavailable
                  ? "—"
                  : reading.value == null
                    ? mode === "connected" ? "Not shared" : "Not logged"
                    : formatHealthValue(row.key, reading.value)}
                {!unavailable && reading.value != null && row.unit ? (
                  <Text style={c.text}> {row.unit}</Text>
                ) : null}
              </Text>
            </TouchTarget>
          );
        })}
      </View>
      <Text style={[c.text, { fontSize: 12, marginTop: 8 }]}>
        {mode === "connected" ? `From ${health.source?.name ?? "your connected app"} - View trends` : phone.enabled
          ? "Steps counted on this phone. Other totals entered by you"
          : "Your Arogio journal. Enter totals or enable phone steps"}
      </Text>
    </View>
  );
}
