import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors, fonts } from '../../../theme/tokens';
import { useTouchTarget } from '../../../components/ui/TouchTarget';

export function FormError({ message }: { message?: string | null }) {
  return message ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null;
}

export function AuthHeading({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }) {
  const { fontScale } = useWindowDimensions();
  return <View style={[styles.heading, compact && styles.compactHeading]}><Text accessibilityRole="header" style={styles.title}
    numberOfLines={fontScale <= 1.05 ? 1 : undefined} adjustsFontSizeToFit={fontScale <= 1.05} minimumFontScale={0.85}>{title}</Text>
    <Text style={[styles.subtitle, compact && styles.compactSubtitle]}>{subtitle}</Text></View>;
}

export function Checkbox({ checked, onChange, label, children, disabled }: {
  checked: boolean; onChange: () => void; label: string; children?: ReactNode; disabled?: boolean;
}) {
  const { minimum } = useTouchTarget();
  return <View style={styles.checkRow}>
    <Pressable accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked, disabled }} aria-checked={checked} aria-disabled={disabled}
      disabled={disabled} onPress={onChange} hitSlop={{ top: 2, bottom: 2, left: 10, right: 10 }} style={[styles.checkTarget, { minHeight: minimum }]}>
      <View style={[styles.check, checked && styles.checked]}>{checked && <View style={styles.tick} />}</View>
    </Pressable>
    {children ?? <Text onPress={disabled ? undefined : onChange} style={styles.small}>{label}</Text>}
  </View>;
}

export function SocialDivider({ compact = false }: { compact?: boolean }) {
  return <View style={[styles.divider, compact && styles.compactDivider]}><View style={styles.line} /><Text style={styles.dividerText}>or continue with</Text><View style={styles.line} /></View>;
}

export const authStyles = StyleSheet.create({
  form: { gap: 12 },
  link: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 11.5, textDecorationLine: 'underline' },
  small: { color: colors.muted, fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 17 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  footerLink: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 5 },
  footerLinkText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 11.5 },
});

const styles = StyleSheet.create({
  heading: { alignItems: 'center', marginBottom: 20 },
  title: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 36, color: colors.ink, textAlign: 'center', includeFontPadding: false },
  subtitle: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted, textAlign: 'center', marginTop: 6, includeFontPadding: false },
  compactHeading: { marginBottom: 8 },
  compactSubtitle: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17.4, marginTop: 4 },
  error: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.error, marginVertical: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  checkTarget: { minHeight: 48, width: 48, marginRight: -20, justifyContent: 'center' },
  check: { width: 18, height: 18, borderWidth: 1, borderColor: colors.primary, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: colors.primary },
  tick: { width: 9, height: 5, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: '#FFFFFF', transform: [{ rotate: '-45deg' }], marginTop: -2 },
  small: { color: colors.muted, fontFamily: fonts.medium, fontSize: 11.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 12 },
  compactDivider: { marginVertical: 6 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.muted, fontSize: 11, fontFamily: fonts.medium },
});
