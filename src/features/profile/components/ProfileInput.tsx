import { useTranslation } from "../../../localization/LanguageProvider";
import { useAppTheme } from '../../../theme/AppearanceProvider';
import { useFieldFocus } from '../../../components/ui/FocusScrollView';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useRef, useState } from 'react';
import { AppIcon, type AppIconName } from "../../../components/app/AppIcon";
import { TouchTarget } from "../../../components/ui/TouchTarget";

type Props = {
  label: string;
  icon: AppIconName;
  value: string;
  placeholder: string;
  onPress?: () => void;
  suffix?: string;
} & Pick<
  TextInputProps,
  "onChangeText" | "keyboardType" | "editable" | "maxLength" | "autoCapitalize" | "autoCorrect"
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
  const { t: tr } = useTranslation();
  const t = useAppTheme();
  const s = useStyles();

  const reveal = useFieldFocus();
  const ref = useRef<import('react').ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const content = (
    <>
      <AppIcon
        name={icon}
        size={21}
        color={icon === "user" && label === "Full name" ? "#7C85A4" : t.teal}
      />
      {onPress ? (
        <Text style={[s.value, !value && s.placeholder]}>
          {value || tr(placeholder)}
        </Text>
      ) : (
        <TextInput ref={ref}
          accessibilityLabel={tr(label)}
          value={value}
          placeholder={tr(placeholder)}
          placeholderTextColor={t.muted}
          style={s.input}
          selectionColor={t.teal}
          onFocus={() => { setFocused(true); reveal(ref.current); }}
          onBlur={() => { setFocused(false); reveal(null); }}
          {...input}
        />
      )}
      {suffix && <Text style={s.suffix}>{suffix}</Text>}
      {onPress && <AppIcon name="down" size={16} color={t.muted} />}
    </>
  );
  return (
    <View style={s.group}>
      <Text style={s.label}>{tr(label)}</Text>
      {onPress ? (
        <TouchTarget
          disabled={input.editable === false}
          accessibilityRole="button"
          accessibilityLabel={tr(`${label}, ${value || "not selected"}`)}
          onPress={onPress}
          style={s.field}
        >
          {content}
        </TouchTarget>
      ) : (
        <Pressable accessible={false} onPress={() => ref.current?.focus()} style={[s.field, focused && { borderColor: t.teal }]}>{content}</Pressable>
      )}
    </View>
  );
}
const useStyles = () => {
  const t = useAppTheme();
return StyleSheet.create({
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
};
