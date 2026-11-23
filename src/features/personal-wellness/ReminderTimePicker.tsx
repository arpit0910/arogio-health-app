import { View } from "react-native";
import { useTranslation } from "../../localization/LanguageProvider";
import { ReminderText } from "./ReminderFormUI";
import { colors, fonts } from "../../theme/tokens";
export function ReminderTimePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 8 }}>
      <ReminderText>{label}</ReminderText>
      <input
        aria-label={t(label)}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          boxSizing: "border-box",
          width: "100%",
          minHeight: 68,
          padding: 16,
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
          color: colors.ink,
          background: colors.surface,
          fontFamily: fonts.medium,
          fontSize: 22,
          colorScheme: "light",
          outlineColor: colors.primary,
        }}
      />
    </View>
  );
}
