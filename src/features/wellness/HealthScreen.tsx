import { Text, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "../../components/app/AppScreen";
import { CareRow, useCareStyles } from "../../components/app/CareUI";
import { usePalette } from "../../theme/AppearanceProvider";
import { useWellness } from "./WellnessContext";
import { useHealthSync } from "../health-sync/HealthSyncProvider";
import { homeWater } from "../home/homeModel";
import { useTrackingClock } from "./useTrackingClock";
import { TrackingStatus } from "./TrackingUI";
import { TodayActivity } from "../activity/TodayActivity";
export function HealthScreen() {
  const c = useCareStyles(),
    colors = usePalette();
  const { data, loading, refresh } = useWellness(),
    health = useHealthSync();
  const water = homeWater(data, useTrackingClock());
  const medicines = data.medicines ?? [];
  return (
    <AppScreen refreshing={loading || health.busy} onRefresh={() => Promise.allSettled([refresh(),health.run()])}>
      <Text accessibilityRole="header" style={c.heading}>
        Your health journal
      </Text>
      <Text style={[c.text, { marginTop: 8 }]}>
        Activity, daily routines and the records you choose to keep.
      </Text>
      <TrackingStatus />
      <TodayActivity />
      <View
        style={{
          marginTop: 32,
          paddingTop: 24,
          borderTopWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text accessibilityRole="header" style={c.title}>
          Daily routines
        </Text>
        <CareRow
          icon="drop"
          title="Water"
          detail={
            water
              ? `${water.totalMl.toLocaleString("en-IN")} ml logged today`
              : loading
                ? "Loading your plan..."
                : "Set a target and log drinks"
          }
          onPress={() => router.push("/water")}
        />
        <CareRow
          icon="pill"
          title="Medicines"
          detail={
            loading
              ? "Loading your medicines..."
              : medicines.length
                ? `${medicines.length} saved · View doses and times`
                : "Keep dose times and instructions together"
          }
          onPress={() => router.push("/medicines")}
        />
        <CareRow
          icon="calendar"
          title="Cycle"
          detail={
            data.cycleSettings
              ? "Calendar and private check-ins"
              : "Optional period and symptom tracking"
          }
          onPress={() => router.push("/cycle")}
        />
      </View>
      <View
        style={{
          marginTop: 24,
          paddingTop: 24,
          borderTopWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text accessibilityRole="header" style={c.title}>
          More about your health
        </Text>
        <CareRow
          icon="user"
          title="Body details"
          detail="Your saved weight, height and profile"
          onPress={() => router.push("/profile")}
        />
        <CareRow
          icon="sync"
          title={
            health.connected
              ? "Connected readings"
              : "Connect another health app"
          }
          detail={
            health.connected
              ? health.source?.name
              : "Optional · Add readings from a watch or another app"
          }
          onPress={() => router.push("/connected-health")}
        />
      </View>
    </AppScreen>
  );
}
