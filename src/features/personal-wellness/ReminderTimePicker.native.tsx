import { useState } from "react";
import { Keyboard, Platform, View } from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { AccessibleText as Text } from "../../components/ui/AccessibleText";
import { AppIcon } from "../../components/app/AppIcon";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "../../localization/LanguageProvider";
import { colors } from "../../theme/tokens";
import { formatClock } from "../../shared/date-time";
import { r } from "./ReminderFormUI";
export function ReminderTimePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation(),
    [open, setOpen] = useState(false);
  const date = () => {
    const d = new Date();
    const [h, m] = (value || "08:00").split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const [pending, setPending] = useState(date);
  const save = (d: Date) =>
    onChange(
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    );
  function choose() {
    Keyboard.dismiss();
    if (Platform.OS === "android")
      DateTimePickerAndroid.open({
        value: date(),
        mode: "time",
        is24Hour: false,
        display: "spinner",
        positiveButton: { label: t("Set time"), textColor: colors.primary },
        negativeButton: { label: t("Cancel"), textColor: colors.muted },
        onValueChange: (_event, selected) => save(selected),
      });
    else {
      setPending(date());
      setOpen(true);
    }
  }
  return (
    <View style={{ gap: 10 }}>
      <Text style={r.label}>{t(label)}</Text>
      <TouchTarget
        accessibilityRole="button"
        accessibilityLabel={`${t(label)}. ${value ? formatClock(value) : t("Choose a time")}`}
        onPress={choose}
        style={[
          r.input,
          { flexDirection: "row", alignItems: "center", gap: 12 },
        ]}
      >
        <AppIcon name="clock" color={colors.primary} size={26} />
        <Text style={[r.label, { flex: 1, fontSize: 22, lineHeight: 30 }]}>
          {value ? formatClock(value) : t("Choose a time")}
        </Text>
        <AppIcon name="down" color={colors.primary} size={20} />
      </TouchTarget>
      {open && (
        <>
          <DateTimePicker
            value={pending}
            mode="time"
            display="spinner"
            themeVariant="light"
            textColor={colors.ink}
            onValueChange={(_event, selected) => setPending(selected)}
            style={{ alignSelf: "center" }}
          />
          <Button
            title={t("Set time")}
            onPress={() => {
              save(pending);
              setOpen(false);
            }}
          />
          <Button
            title={t("Cancel")}
            variant="secondary"
            onPress={() => setOpen(false)}
          />
        </>
      )}
    </View>
  );
}
