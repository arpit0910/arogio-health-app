import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useState } from 'react';
import { AppIcon, type AppIconName } from "../../../components/app/AppIcon";
import { TouchTarget } from "../../../components/ui/TouchTarget";
import { appTheme as t } from "../../../theme/appTheme";
type Props = {
  label: string;
  icon: AppIconName;
  value: string;
  placeholder: string;
  onPress?: () => void;
  suffix?: string;
} & Pick<
  TextInputProps,
  "onChangeText" | "keyboardType" | "editable" | "maxLength"
>;
export function ProfileInput({
  label,
  icon,
  value,
  placeholder,
  onPress,
  suffix,
  ...input
}: Props) {
  const [focused, setFocused] = useState(false);
  const content = (
    <>
      {input.keyboardType !== 'decimal-pad' && <AppIcon
        name={icon}
        size={21}
        color={icon === "user" && label === "Full name" ? "#7C85A4" : t.teal}
      />}
      {onPress ? (
        <Text style={[s.value, !value && s.placeholder]}>
          {value || placeholder}
        </Text>
      ) : (
        <TextInput
          accessibilityLabel={label}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={t.muted}
          style={s.input}
          selectionColor={t.teal}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...input}
        />
      )}
      {suffix && <Text style={s.suffix}>{suffix}</Text>}
      {onPress && <AppIcon name="down" size={16} color={t.muted} />}
    </>
  );
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      {onPress ? (
        <TouchTarget
          disabled={input.editable === false}
          accessibilityRole="button"
          accessibilityLabel={`${label}, ${value || "not selected"}`}
          onPress={onPress}
          style={s.field}
        >
          {content}
        </TouchTarget>
      ) : (
        <View style={[s.field, focused && { borderColor: t.teal }]}>{content}</View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  group: { gap: 9 },
  label: { fontFamily: t.fonts.regular, color: t.ink, fontSize: 13.5 },
  field: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    gap: 8,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 12,
    backgroundColor: t.white,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: t.fonts.regular,
    color: t.ink,
    fontSize: 15,
    paddingVertical: 12,
  },
  value: {
    flex: 1,
    fontFamily: t.fonts.regular,
    color: t.ink,
    fontSize: 15,
    paddingVertical: 12,
  },
  placeholder: { color: t.muted },
  suffix: { fontFamily: t.fonts.regular, color: t.muted, fontSize: 12 },
});
