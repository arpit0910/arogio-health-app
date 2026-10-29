import { formatDateTime } from "../../lib/time";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "../../components/app/AppScreen";
import {
  CareDisclosure,
  CareRow,
  useCareStyles,
} from "../../components/app/CareUI";
import { usePalette } from "../../theme/AppearanceProvider";
import { Button } from "../../components/ui/Button";
import { PhoneTrackingControl } from "../activity/PhoneTrackingControl";
import { useHealthSync } from "./HealthSyncProvider";
import { installHealthConnect } from "./healthConnect";

export function StandaloneHealthScreen() {
  const c = useCareStyles(),
    colors = usePalette(),
    health = useHealthSync();
  const [error, setError] = useState("");
  return (
    <AppScreen back title="Health connections">
      <Text accessibilityRole="header" style={c.heading}>
        Arogio works on its own.
      </Text>
      <Text style={[c.text, { marginTop: 10 }]}>
        Keep your records here. A health app or watch can add readings later,
        whenever you want.
      </Text>
      <View style={{ marginTop: 28 }}>
        <PhoneTrackingControl />
      </View>
      <CareRow
        icon="pencil"
        title="Enter daily totals"
        detail="Steps, exercise, sleep, distance and calories"
        onPress={() => router.push("/activity")}
      />
      <CareRow
        icon="drop"
        title="Track daily routines"
        detail="Water, medicines and cycle check-ins"
        onPress={() => router.push("/health")}
      />
      <Text style={[c.text, { fontSize: 13, marginTop: 12 }]}>
        A phone alone cannot reliably measure heart rate or sleep. Enter your
        own totals, or connect a compatible device when you have one.
      </Text>
      <View style={{ marginTop: 32 }}>
        <CareDisclosure title="Connect a watch or health app (optional)">
          {health.snapshot && (
            <Text style={c.text}>
              Last sync: {formatDateTime(health.snapshot.syncedAt)}
            </Text>
          )}
          <Text style={c.text}>
            On Android, Health Connect can bring in readings shared by Samsung
            Health, Google Fit and other compatible apps. This is an extra
            source; it is never required for Arogio tracking.
          </Text>
          {!health.ready || health.availability === null ? (
            <ActivityIndicator
              accessibilityLabel="Checking optional health connections"
              color={colors.primary}
            />
          ) : health.availability === "available" ? (
            <CareRow icon="shield" title="Set up app access" detail="Choose your source and permissions in one place" onPress={() => router.push("/app-access")} />
          ) : health.availability === "update-required" ? (
            <>
              <Text style={c.text}>
                Health Connect is not installed or needs an update. You can keep
                tracking in Arogio, or install it if you want to sync another
                app.
              </Text>
              <Button
                title="Install Health Connect (optional)"
                variant="secondary"
                onPress={() =>
                  void installHealthConnect().catch(() =>
                    setError(
                      "Search for Health Connect in the Play Store to add optional syncing.",
                    ),
                  )
                }
              />
              <Button
                title="Check connection availability"
                variant="secondary"
                onPress={() => void health.checkAvailability()}
              />
            </>
          ) : (
            <Text style={c.text}>
              {health.availability === "rebuild-required"
                ? "Optional syncing needs an updated Android app build. Arogio tracking is available now."
                : "Optional Health Connect syncing is not supported on this device. You can still use Arogio tracking."}
            </Text>
          )}
          {!!(error || health.error) && (
            <Text
              accessibilityRole="alert"
              style={[c.text, { color: colors.error }]}
            >
              {error || health.error}
            </Text>
          )}
          {health.source && (
            <CareRow
              icon="settings"
              title="Manage the selected app"
              detail={health.source.name}
              onPress={() => router.push("/connected-health-settings")}
            />
          )}
        </CareDisclosure>
      </View>
    </AppScreen>
  );
}
