import { usePalette } from '../../theme/AppearanceProvider';
import { useFieldFocus } from '../../components/ui/FocusScrollView';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRef, useState, type PropsWithChildren } from 'react';
import { AppIcon, type AppIconName } from '../../components/app/AppIcon';
import { Checkbox } from '../auth/components/AuthPrimitives';
import { useCareStyles } from '../../components/app/CareUI';
import { fonts } from '../../theme/tokens';
import { useWellness } from './WellnessContext';
export const useTrackingStyles = () => {
  const c = useCareStyles();
  const colors = usePalette();
return StyleSheet.create({
  group: { gap: 12, marginTop: 24 }, row: { paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.border, gap: 9 },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontFamily: fonts.regular, fontSize: 16, color: colors.ink, backgroundColor: colors.surface },
  panel: { backgroundColor: colors.surface, padding: 16, borderRadius: 16, gap: 10, marginTop: 24 },
  error: { ...c.text, color: colors.error }, inline: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
};
export function Field({ label, value, onChange, numeric = false, decimal = false, multiline = false, placeholder, icon }: { label: string; value: string; onChange: (value: string) => void; numeric?: boolean; decimal?: boolean; multiline?: boolean; placeholder?: string; icon?: AppIconName }) {
  const c = useCareStyles();
  const colors = usePalette();
  const trackingStyles = useTrackingStyles();

  const reveal = useFieldFocus();
  const ref = useRef<import('react').ComponentRef<typeof TextInput>>(null), [focused, setFocused] = useState(false);
  const hint = placeholder ?? (label.includes('YYYY-MM-DD') ? 'e.g. 2026-10-28' : label.includes('target') ? 'e.g. 2000' : label.includes('serving') || label.includes('Amount') ? 'e.g. 250' : label.includes('cycle length') ? 'e.g. 28' : label.includes('period length') ? 'e.g. 5' : label.includes('days before') ? 'e.g. 2' : multiline ? 'Add anything you want to remember' : `Enter ${label.toLowerCase()}`);
  return <View style={{ gap: 7 }}><Text style={c.text}>{label}</Text><Pressable accessible={false} onPress={() => ref.current?.focus()} style={[trackingStyles.input, { flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', gap: 10, paddingVertical: 0, borderColor: focused ? colors.primary : colors.border }]}><View pointerEvents="none" style={{ paddingVertical: 14 }}><AppIcon name={icon ?? (label.includes('YYYY-MM-DD') ? 'calendar' : multiline ? 'report' : numeric ? 'trend' : 'pill')} size={21} /></View><TextInput ref={ref} accessibilityLabel={label} value={value} placeholder={hint} placeholderTextColor={colors.placeholder} selectionColor={colors.primary} onFocus={() => { setFocused(true); reveal(ref.current); }} onBlur={() => { setFocused(false); reveal(null); }} onChangeText={onChange} keyboardType={numeric ? decimal ? 'decimal-pad' : 'number-pad' : 'default'} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} maxLength={multiline ? 1000 : 80} style={{ flex: 1, minWidth: 0, minHeight: multiline ? 108 : 52, paddingVertical: 14, fontFamily: fonts.regular, fontSize: 16, color: colors.ink, outlineWidth: 0 }} /></Pressable></View>;
}
export function Check({ checked, onChange, label, disabled }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  const c = useCareStyles();
 return <Checkbox checked={checked} onChange={onChange} label={label} disabled={disabled}><Text style={c.text} onPress={disabled ? undefined : onChange}>{label}</Text></Checkbox>; }
export function Group({ title, children }: PropsWithChildren<{ title: string }>) {
  const c = useCareStyles();
  const trackingStyles = useTrackingStyles();
 return <View style={trackingStyles.group}><Text accessibilityRole="header" style={c.title}>{title}</Text>{children}</View>; }
export function TrackingStatus() {
  const c = useCareStyles();
  const colors = usePalette();
  const trackingStyles = useTrackingStyles();
 const { loading, ready, error } = useWellness(); return <View accessibilityLiveRegion="polite" style={{ gap: 10 }}>{loading && !ready && <ActivityIndicator accessibilityLabel="Loading tracking" color={colors.primary} />}{error && <><Text style={trackingStyles.error}>{error}</Text><Text style={c.text}>Arogio will retry automatically. Pull down on Home to check now.</Text></>}</View>; }
export function confirmDelete(title: string, message: string, action: () => void) { if (Platform.OS === 'web') { if (window.confirm(`${title}\n${message}`)) action(); } else Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: action }]); }
