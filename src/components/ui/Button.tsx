import { usePalette } from '../../theme/AppearanceProvider';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';
import { fonts } from '../../theme/tokens';
import { useTouchTarget } from './TouchTarget';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function Button({ title, onPress, loading, disabled, variant = 'primary', leading, trailing }: Props) {
  const colors = usePalette();
  const styles = useStyles();

  const secondary = variant !== 'primary';
  const danger = variant === 'danger';
  const { control } = useTouchTarget();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      aria-disabled={disabled || loading} aria-busy={loading}
      disabled={disabled || loading} onPress={onPress}
      style={({ pressed }) => [styles.base, { minHeight: Math.max(52, control) }, danger ? styles.danger : secondary ? styles.secondary : styles.primary,
        pressed && (danger ? styles.dangerPressed : secondary ? styles.secondaryPressed : styles.primaryPressed),
        (disabled || loading) && styles.disabled]}>
      {loading ? <ActivityIndicator color={danger ? colors.error : secondary ? colors.primary : colors.background} /> : <>
        {leading}<Text style={[styles.text, secondary && styles.secondaryText, danger && { color: colors.error }]}>{title}</Text>{trailing}
      </>}
    </Pressable>
  );
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  base: { minHeight: 52, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12,
    flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', width: '100%' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.error },
  dangerPressed: { backgroundColor: colors.errorSurface },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  secondaryPressed: { backgroundColor: colors.subtle },
  text: { color: colors.onPrimary, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 23, flexShrink: 1, textAlign: 'center' },
  secondaryText: { color: colors.ink, fontSize: 16 },
  disabled: { opacity: 0.55 },
});
};
