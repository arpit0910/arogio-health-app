import { useRef, type ComponentRef, type ReactNode } from "react";
import { StyleSheet, View, type TextInputProps } from "react-native";
import {
  AccessibleText as Text,
  AccessibleTextInput as TextInput,
} from "../../components/ui/AccessibleText";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { useFieldFocus } from "../../components/ui/FocusScrollView";
import { AppIcon, type AppIconName } from "../../components/app/AppIcon";
import { useTranslation } from "../../localization/LanguageProvider";
import { colors as c, fonts } from "../../theme/tokens";

export function ReminderText({
  children,
  title = false,
}: {
  children: ReactNode;
  title?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Text
      accessibilityRole={title ? "header" : undefined}
      style={title ? r.title : r.body}
    >
      {typeof children === "string" ? t(children) : children}
    </Text>
  );
}
export function ReminderField({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  const { t } = useTranslation(),
    reveal = useFieldFocus(),
    ref = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <View style={{ gap: 8 }}>
      <Text style={r.label}>{t(label)}</Text>
      {hint && <Text style={r.hint}>{t(hint)}</Text>}
      <TextInput
        {...props}
        ref={ref}
        accessibilityLabel={t(label)}
        accessibilityHint={hint ? t(hint) : undefined}
        placeholder={t(props.placeholder)}
        onFocus={(event) => {
          reveal(ref.current);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          reveal(null);
          props.onBlur?.(event);
        }}
        placeholderTextColor={c.placeholder}
        selectionColor={c.primary}
        style={[
          r.input,
          props.multiline && { minHeight: 112, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function ReminderChoice({
  label,
  detail,
  selected,
  onPress,
  icon,
  role = "radio",
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
  icon?: AppIconName;
  role?: "radio" | "checkbox";
}) {
  const { t } = useTranslation();
  return (
    <TouchTarget
      accessibilityRole={role}
      accessibilityLabel={t(label)}
      accessibilityHint={detail ? t(detail) : undefined}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        r.choice,
        selected && r.selected,
        pressed && { opacity: 0.75 },
      ]}
    >
      {icon && (
        <AppIcon name={icon} size={26} color={selected ? c.primary : c.muted} />
      )}
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Text style={[r.label, selected && { color: c.primary }]}>
          {t(label)}
        </Text>
        {detail && <Text style={r.hint}>{t(detail)}</Text>}
      </View>
      <View
        style={[
          r.radio,
          selected && { backgroundColor: c.primary, borderColor: c.primary },
        ]}
      >
        {selected && <AppIcon name="check" size={18} color={c.onPrimary} />}
      </View>
    </TouchTarget>
  );
}
export function ReminderDisclosure({
  title,
  open,
  onPress,
  children,
}: {
  title: string;
  open: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ borderTopWidth: 1, borderColor: c.border }}>
      <TouchTarget
        accessibilityRole="button"
        accessibilityLabel={t(title)}
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={r.disclosure}
      >
        <Text style={[r.label, { flex: 1, color: c.primary }]}>{t(title)}</Text>
        <AppIcon name={open ? "up" : "down"} size={20} color={c.primary} />
      </TouchTarget>
      {open && <View style={{ gap: 20, paddingBottom: 16 }}>{children}</View>}
    </View>
  );
}
export const r = StyleSheet.create({
  page: { gap: 26, paddingBottom: 8 },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 34,
    color: c.ink,
    letterSpacing: -0.4,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 26,
    color: c.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: c.ink,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: c.muted,
  },
  input: {
    minHeight: 64,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 26,
    color: c.ink,
  },
  choice: {
    minHeight: 72,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  selected: {
    borderWidth: 2,
    borderColor: c.primary,
    padding: 15,
    backgroundColor: c.mintSurface,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: c.muted,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  disclosure: {
    minHeight: 64,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reminder: {
    gap: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderColor: c.border,
  },
  review: {
    padding: 20,
    backgroundColor: c.surface,
    borderRadius: 16,
    gap: 18,
  },
  footer: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    color: c.error,
  },
});
