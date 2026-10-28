import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import type { PropsWithChildren } from 'react';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../auth/components/AuthPrimitives';
import { careStyles as c } from '../../components/app/CareUI';
import { colors, fonts } from '../../theme/tokens';
import { useWellness } from './WellnessContext';
export const trackingStyles = StyleSheet.create({
  group: { gap: 12, marginTop: 24 }, row: { paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.border, gap: 9 },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontFamily: fonts.regular, fontSize: 16, color: colors.ink, backgroundColor: colors.surface },
  panel: { backgroundColor: colors.subtle, padding: 20, borderRadius: 16, gap: 10, marginTop: 24 },
  error: { ...c.text, color: colors.error }, inline: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
export function Field({ label, value, onChange, numeric = false, multiline = false }: { label: string; value: string; onChange: (value: string) => void; numeric?: boolean; multiline?: boolean }) {
  return <View style={{ gap: 7 }}><Text style={c.text}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChange} keyboardType={numeric ? 'number-pad' : 'default'} multiline={multiline} maxLength={multiline ? 1000 : 80} style={trackingStyles.input} /></View>;
}
export function Check({ checked, onChange, label, disabled }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean }) { return <Checkbox checked={checked} onChange={onChange} label={label} disabled={disabled}><Text style={c.text} onPress={disabled ? undefined : onChange}>{label}</Text></Checkbox>; }
export function Group({ title, children }: PropsWithChildren<{ title: string }>) { return <View style={trackingStyles.group}><Text accessibilityRole="header" style={c.title}>{title}</Text>{children}</View>; }
export function TrackingStatus() { const { loading, error, refresh } = useWellness(); return <View accessibilityLiveRegion="polite" style={{ gap: 10 }}>{loading && <ActivityIndicator accessibilityLabel="Loading tracking" color={colors.primary} />}{error && <><Text style={trackingStyles.error}>{error}</Text><Button title="Reload tracking" variant="secondary" onPress={() => void refresh()} /></>}</View>; }
export function confirmDelete(title: string, message: string, action: () => void) { if (Platform.OS === 'web') { if (window.confirm(`${title}\n${message}`)) action(); } else Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: action }]); }
export const deviceTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
export const displayTime = (iso: string, timezone: string) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: timezone }).format(new Date(iso));
