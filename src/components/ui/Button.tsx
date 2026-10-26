import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';
import { colors, fonts } from '../../theme/tokens';
import { useTouchTarget } from './TouchTarget';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function Button({ title, onPress, loading, disabled, variant = 'primary', leading, trailing }: Props) {
  const secondary = variant === 'secondary';
  const { control } = useTouchTarget();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      aria-disabled={disabled || loading} aria-busy={loading}
      disabled={disabled || loading} onPress={onPress}
      style={({ pressed }) => [styles.base, { minHeight: control }, secondary ? styles.secondary : styles.primary,
        pressed && (secondary ? styles.secondaryPressed : styles.primaryPressed),
        (disabled || loading) && styles.disabled]}>
      {loading ? <ActivityIndicator color={secondary ? colors.primary : colors.background} /> : <>
        {leading}<Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>{trailing}
      </>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 999,
    flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', width: '100%' },
  primary: { backgroundColor: colors.primary, boxShadow: '0px 6px 12px rgba(9,110,100,0.22)' },
  secondary: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(15,31,46,0.05)' },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  secondaryPressed: { backgroundColor: colors.subtle },
  text: { color: colors.background, fontFamily: fonts.semibold, fontSize: 14, lineHeight: 21 },
  secondaryText: { color: colors.ink, fontSize: 13 },
  disabled: { opacity: 0.55 },
});
