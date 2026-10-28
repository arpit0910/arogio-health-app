import type { ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { profileAssets } from '../assets/profileAssets';
import { colors, fonts } from '../../../theme/tokens';
import { TouchTarget, TouchTargetScale, useTouchTarget } from '../../../components/ui/TouchTarget';
import { Button } from '../../../components/ui/Button';

export function ProfileIcon({ name, white = false }: { name: string; white?: boolean }) {
  const key = name in profileAssets ? name as keyof typeof profileAssets : 'activity';
  const xml = white ? profileAssets[key].replace(/#096E64|#168C80/gi, '#FFFFFF') : profileAssets[key];
  return <SvgXml xml={xml} width={16} height={16} />;
}

export function ProfileProgress({ step }: { step: number }) {
  const active = step < 2 ? 0 : step === 2 ? 1 : step === 3 ? 2 : 3;
  return <View style={s.progress} accessibilityLabel={`Setup step ${step + 1} of 8`}>
    <View style={s.track}><View style={[s.trackDone, { width: `${active / 3 * 100}%` }]} /></View>
    {['Profile', 'Lifestyle', 'Health Goals', 'Done'].map((label, i) => <View key={label} style={s.stage}>
      <View style={[s.dot, i <= active && s.dotDone]} /><Text style={[s.stageLabel, i <= active && s.stageActive]}>{label}</Text>
    </View>)}
  </View>;
}
export function ProfileHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return <View style={s.heading}><Text accessibilityRole="header" style={s.title}>{title}</Text><Text style={s.subtitle}>{subtitle}</Text></View>;
}
export function ProfileField({ label, icon, value, placeholder, onChange, onPress, suffix, numeric }: {
  label: string; icon: string; value: string; placeholder: string; onChange?: (value: string) => void; onPress?: () => void; suffix?: string; numeric?: boolean;
}) {
  const { control } = useTouchTarget();
  const content = <><View style={s.fieldIcon}><ProfileIcon name={icon} /></View>
    {onChange ? <TextInput accessibilityLabel={label} value={value} placeholder={placeholder} placeholderTextColor={colors.placeholder} onChangeText={onChange} keyboardType={numeric ? 'decimal-pad' : 'default'} returnKeyType="done" onSubmitEditing={Keyboard.dismiss} style={s.input} selectionColor={colors.primary} /> : <Text style={[s.input, !value && { color: colors.placeholder }]}>{value || placeholder}</Text>}
    {suffix && <Text style={s.suffix}>{suffix}</Text>}{onPress && <ProfileIcon name="down" />}</>;
  return <View style={s.fieldGroup}><Text style={s.label}>{label}</Text>{onPress ? <TouchTarget accessibilityRole="button" accessibilityLabel={`${label}, ${value || 'not selected'}`} onPress={onPress} style={s.field}>{content}</TouchTarget> : <View style={[s.field, { minHeight: control }]}>{content}</View>}</View>;
}
export function UnitSelector({ units, value, onChange }: { units: string[]; value: string; onChange: (v: string) => void }) {
  return <View accessibilityRole="radiogroup" style={s.units}>{units.map(unit => <TouchTarget key={unit} accessibilityLabel={unit} accessibilityRole="radio" accessibilityState={{ checked: value === unit }} onPress={() => onChange(unit)} style={[s.unit, unit === value && s.unitSelected]}><Text style={[s.unitText, unit === value && s.unitTextSelected]}>{unit}</Text></TouchTarget>)}</View>;
}
export function ChoiceCard({ title, subtitle, selected, multiple, onPress, children }: {
  title: string; subtitle: string; icon: string; selected?: boolean; multiple?: boolean; onPress?: () => void; children?: ReactNode;
}) {
  return <TouchTarget accessibilityRole={children ? undefined : multiple ? 'checkbox' : 'radio'} accessibilityLabel={children ? undefined : `${title}. ${subtitle}`} accessibilityState={children ? undefined : { checked: selected }} onPress={onPress} disabled={!onPress} style={[s.card, selected && s.selected]}>
    <View style={s.cardCopy}><Text style={s.cardTitle}>{title}</Text><Text style={s.cardSubtitle}>{subtitle}</Text></View>
    {children ?? <View style={[s.mark, !multiple && { borderRadius: 20 }, selected && s.markSelected]}>{selected && (multiple ? <ProfileIcon name="check" white /> : <View style={s.radioDot} />)}</View>}
  </TouchTarget>;
}
export function ProfileDialog({ title, subtitle = '', placeholder, value, onChange, options, onClose, onSave, children, error }: {
  title: string; subtitle?: string; placeholder?: string; value: string; onChange: (v: string) => void; options?: { value: string; label: string }[]; onClose: () => void; onSave: () => void; children?: ReactNode; error?: string | null;
}) {
  return <TouchTargetScale value={1}><Modal transparent visible animationType="fade" onRequestClose={onClose}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.overlay}><ScrollView accessibilityViewIsModal style={s.dialog} contentContainerStyle={s.dialogContent} keyboardShouldPersistTaps="handled" bounces={false} overScrollMode="never">
    <ProfileHeading title={title} subtitle={subtitle} />
    {children ?? (options ? options.map(option => <TouchTarget key={option.value} accessibilityRole="radio" accessibilityState={{ checked: value === option.value }} onPress={() => onChange(option.value)} style={[s.option, value === option.value && s.selected]}><Text style={s.cardTitle}>{option.label}</Text></TouchTarget>) : <TextInput autoFocus maxLength={100} accessibilityLabel={title} value={value} placeholder={placeholder} placeholderTextColor={colors.placeholder} onChangeText={onChange} returnKeyType="done" onSubmitEditing={onSave} style={[s.field, s.input]} selectionColor={colors.primary} />)}
    {error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}
    <Button title="Save" onPress={onSave} /><TouchTarget onPress={onClose} accessibilityRole="button" style={s.cancel}><Text style={s.link}>Cancel</Text></TouchTarget>
  </ScrollView></KeyboardAvoidingView></Modal></TouchTargetScale>;
}
export const profileStyles = StyleSheet.create({
  body: { paddingHorizontal: 24, gap: 10 }, title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, color: colors.ink, textAlign: 'center' },
  centeredCopy: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center', marginTop: 10 },
  link: { fontFamily: fonts.semibold, fontSize: 12, color: colors.primary, textDecorationLine: 'underline' },
});
const s = StyleSheet.create({
  progress: { marginHorizontal: 28, flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, marginBottom: 26 },
  track: { position: 'absolute', height: 2, backgroundColor: '#D5DDE6', left: 7, right: 7, top: 6 }, trackDone: { height: 2, backgroundColor: colors.primary },
  stage: { alignItems: 'center', width: 42, marginHorizontal: -14 }, dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#CBD5E1' }, dotDone: { backgroundColor: colors.primary },
  stageLabel: { fontFamily: fonts.regular, fontSize: 9, color: colors.placeholder, marginTop: 8, width: 78, textAlign: 'center' }, stageActive: { color: colors.ink, fontFamily: fonts.semibold },
  heading: { marginBottom: 6 }, title: { fontFamily: fonts.bold, fontSize: 21, lineHeight: 28, letterSpacing: -0.6, color: colors.ink }, subtitle: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 5 },
  fieldGroup: { gap: 8, marginTop: 6 }, label: { fontFamily: fonts.semibold, color: colors.ink, fontSize: 11.5 },
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 13, minHeight: 44, backgroundColor: colors.background },
  fieldIcon: { width: 27, borderRightWidth: 1, borderColor: colors.border, marginRight: 12 }, input: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.ink, paddingVertical: 12, minWidth: 0 }, suffix: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginLeft: 6 },
  units: { flexDirection: 'row', gap: 6 }, unit: { flex: 1, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, unitSelected: { backgroundColor: colors.primary, borderColor: colors.primary }, unitText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted }, unitTextSelected: { color: '#FFFFFF' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 12, gap: 16, backgroundColor: colors.surface }, selected: { borderColor: colors.primary, backgroundColor: colors.subtle },
  badge: { width: 32, height: 32, backgroundColor: colors.subtle, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, cardCopy: { flex: 1 }, cardTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink, lineHeight: 22 }, cardSubtitle: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: 4 },
  mark: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }, markSelected: { backgroundColor: colors.primary, borderColor: colors.primary }, radioDot: { width: 5, height: 5, backgroundColor: '#FFFFFF', borderRadius: 3 },
  overlay: { flex: 1, backgroundColor: 'rgba(13,31,51,0.35)', justifyContent: 'center', padding: 24 }, dialog: { flexGrow: 0, flexShrink: 1, alignSelf: 'center', width: '100%', maxWidth: 400, maxHeight: '100%', borderRadius: 16, backgroundColor: colors.background }, dialogContent: { padding: 24, gap: 12 }, option: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border }, cancel: { alignItems: 'center', justifyContent: 'center' }, link: { fontFamily: fonts.semibold, color: colors.primary, textDecorationLine: 'underline' },
});
