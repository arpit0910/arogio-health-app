import { AccessibleText as Text } from './AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import { usePalette } from '../../theme/AppearanceProvider';
import { Platform, ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { typeStyles, ui } from '../../theme/tokens';
import { useTouchTarget } from './TouchTarget';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'social';
  size?: 'regular' | 'large';
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function Button({ title, onPress, loading, disabled, variant = 'primary', leading, trailing, size = 'regular' }: Props) {
  const { t: tr } = useTranslation();
  const colors = usePalette();
  const styles = useStyles();

  const secondary = variant !== 'primary';
  const danger = variant === 'danger';
  const { control } = useTouchTarget();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={tr(title)}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      aria-disabled={disabled || loading} aria-busy={loading}
      disabled={disabled || loading} onPress={onPress}
      style={({ pressed }) => [styles.base, { minHeight: Math.max(size === 'large' ? 64 : 52, control) }, danger ? styles.danger : secondary ? styles.secondary : styles.primary,
        pressed && styles.pressed,
        pressed && (danger ? styles.dangerPressed : secondary ? styles.secondaryPressed : styles.primaryPressed),
        variant === 'social' && styles.social,
        (disabled || loading) && styles.disabled]}>
      <View pointerEvents="none" {...(Platform.OS === 'web' ? { 'aria-hidden': true } : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' })} style={[styles.content, loading && styles.hidden]}>
        {leading && <View style={styles.iconSlot}>{leading}</View>}
        <Text style={[styles.text, secondary && styles.secondaryText, variant === 'social' && { color: colors.ink, fontSize: 18 }, danger && { color: colors.error }, size === 'large' && { fontSize: 18, lineHeight: 26 }]}>{tr(title)}</Text>
        {trailing && <View style={styles.iconSlot}>{trailing}</View>}
      </View>
      {loading && <View pointerEvents="none" style={styles.loading}><ActivityIndicator color={danger ? colors.error : secondary ? colors.primary : colors.onPrimary} /></View>}
    </Pressable>
  );
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  base: { minHeight: ui.control, paddingVertical: 14, paddingHorizontal: 20, borderRadius: ui.radius.field,
    alignItems: 'center', justifyContent: 'center', width: '100%', borderWidth: 1, borderColor: 'transparent' },
  content: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  iconSlot: { width: 24, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  hidden: { opacity: 0 },
  loading: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.subtle, borderWidth: 1, borderColor: 'transparent' },
  social: { minHeight: 56, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14 },
  danger: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.error },
  dangerPressed: { backgroundColor: colors.errorSurface },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  secondaryPressed: { backgroundColor: colors.subtle },
  text: { ...typeStyles.button, color: colors.onPrimary, flexShrink: 1, minWidth: 0, textAlign: 'center' },
  secondaryText: { color: colors.primary, fontSize: 16 },
  disabled: { opacity: 0.55 },
  pressed: { transform: [{ scale: 0.985 }] },
});
};
