import { useEffect, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { AppIcon } from "../../components/app/AppIcon";
import { useCareStyles } from "../../components/app/CareUI";
import { usePalette } from "../../theme/AppearanceProvider";
import {
  getNotificationAccess,
  requestReminderPermission,
} from "../wellness/notifications";
import type { NotificationAccess } from "../wellness/notificationAccess";

export function NotificationPermissionStep({
  disabled,
  onBusyChange,
}: {
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const c = useCareStyles(),
    colors = usePalette();
  const [access, setAccess] = useState<NotificationAccess | null>(null),
    [busy, setBusy] = useState(false),
    [skipped, setSkipped] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    let alive = true;
    void getNotificationAccess()
      .then((value) => {
        if (alive) setAccess(value);
      })
      .catch(() => {
        if (alive)
          setError(
            "Permission status is unavailable. You can continue and check it in Settings later.",
          );
      });
    return () => {
      alive = false;
    };
  }, []);
  async function allow() {
    if (lock.current || disabled) return;
    lock.current = true;
    setBusy(true);
    onBusyChange(true);
    setError("");
    try {
      await requestReminderPermission();
      setAccess(await getNotificationAccess());
    } catch {
      setError(
        "Notifications could not be enabled. You can finish setup and try again in Settings.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
      onBusyChange(false);
    }
  }
  if (Platform.OS === "web")
    return (
      <View style={{ marginTop: 24, gap: 12 }}>
        <Text style={c.title}>Reminders in the Arogio app</Text>
        <Text style={c.text}>
          Install Arogio on your phone to receive device reminders. You can
          finish setup and keep your records here.
        </Text>
      </View>
    );
  return (
    <View
      style={{
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderColor: colors.border,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <AppIcon name="bell" size={23} />
        <Text style={c.title}>Would you like reminders?</Text>
      </View>
      <Text style={c.text}>
        Allow notifications for medicine, water and cycle reminders you choose
        to turn on. No reminders are created until you set them up.
      </Text>
      <Text accessibilityLiveRegion="polite" style={c.text}>
        {access === "allowed"
          ? "Notifications are allowed. You control which reminders to use."
          : access === "blocked"
            ? "Notifications are off on this device. You can enable them later in Settings."
            : skipped
              ? "You can turn on notifications later in Settings."
              : "You can finish setup with notifications off."}
      </Text>
      {!skipped && access !== "allowed" && access !== "blocked" && (
        <>
          <Button
            title="Allow notifications"
            onPress={() => void allow()}
            loading={busy}
            disabled={disabled}
          />
          <Button
            title="Not now"
            variant="secondary"
            disabled={busy || disabled}
            onPress={() => setSkipped(true)}
          />
        </>
      )}
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={[c.text, { color: colors.error }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
