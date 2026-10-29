import { router } from "expo-router";
import { usePalette } from "../../theme/AppearanceProvider";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { AppScreen } from "../../components/app/AppScreen";
import { CareRow, useCareStyles } from "../../components/app/CareUI";
import { Button } from "../../components/ui/Button";

import { HealthSourcePicker } from "./HealthSourcePicker";
import { useHealthSync } from "./HealthSyncProvider";
import { openHealthSettings } from "./healthConnect";

export function HealthSourceSettingsScreen() {
  const c = useCareStyles();
  const colors = usePalette();

  const health = useHealthSync();
  const [error, setError] = useState("");
  return (
    <AppScreen back title="Connected health settings">
      <View style={{ gap: 12 }}>
        <Text style={c.heading}>Health app connections</Text>
        <CareRow
          icon="device"
          title="Use Arogio tracking"
          detail="Count phone steps or enter totals without a connection"
          onPress={() => router.push("/activity")}
        />
        {health.source && (
          <Text style={c.text}>
            {health.source.name}
            {health.connected
              ? " is your active source."
              : " is selected. Refreshes are currently off or unavailable."}
          </Text>
        )}
        <Text style={c.text}>
          Optionally choose one app for synced readings. Your Arogio journal and
          phone tracking remain available separately.
        </Text>
        {!!(error || health.error) && (
          <Text
            accessibilityRole="alert"
            style={[c.text, { color: colors.error }]}
          >
            {error || health.error}
          </Text>
        )}
        {!health.ready ? (
          <ActivityIndicator color={colors.primary} />
        ) : health.availability === "available" ? (
          <HealthSourcePicker inSettings />
        ) : (
          <View style={{ gap: 12 }}>
            <Text style={c.text}>
              Optional syncing is not available here. You can continue tracking
              directly in Arogio.
            </Text>
            <CareRow
              icon="sync"
              title="Explore optional connections"
              detail="Check compatibility and setup options"
              onPress={() => router.push("/connected-health")}
            />
          </View>
        )}
      </View>
      <View style={{ marginTop: 32, gap: 12 }}>
        <Text style={c.title}>Sync &amp; permissions</Text>
        <Text style={c.text}>
          Refreshes run every 5 minutes while Arogio is open and when you
          return.
        </Text>
        {health.connected && (
          <>
            <Text style={c.text}>
              {health.background
                ? "Background refresh is on. Android schedules updates at intervals of at least 15 minutes and may delay them."
                : "Background refresh is optional on supported Android devices."}
            </Text>
            <Button
              title={
                health.background
                  ? "Turn off background refresh"
                  : "Enable background refresh"
              }
              variant="secondary"
              disabled={health.busy}
              onPress={() =>
                void (health.background
                  ? health.disableBackground()
                  : health.enableBackground())
              }
            />
            <Button
              title="Refresh now"
              variant="secondary"
              loading={health.busy}
              onPress={() => void health.run()}
            />
          </>
        )}
        {health.availability === "available" && (
          <Button
            title="Manage Health Connect access"
            variant="secondary"
            disabled={health.busy}
            onPress={() =>
              void openHealthSettings().catch(() =>
                setError(
                  "Open Health Connect in Android Settings to manage Arogio access.",
                ),
              )
            }
          />
        )}
        {health.source && (
          <Button
            title="Disconnect and clear readings"
            variant="secondary"
            disabled={health.busy}
            onPress={() => void health.disconnect()}
          />
        )}
      </View>
    </AppScreen>
  );
}
