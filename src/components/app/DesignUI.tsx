import { useAccessibilityPreferences } from '../../features/accessibility/AccessibilityPreferences';
import { AccessibleText as Text, AccessibleTextInput as TextInput } from '../ui/AccessibleText';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type TextInputProps, type ViewStyle } from 'react-native';
import { useTranslation } from '../../localization/LanguageProvider';
import { fonts, colors } from '../../theme/tokens';
import { TouchTarget } from '../ui/TouchTarget';
import { AppIcon, type AppIconName } from './AppIcon';
import { FigmaAsset } from './FigmaAsset';

const headingAssets: Record<string, { screen: '1:2089' | '1:2943' | '1:570' | '3:97'; name: string }> = {
  'Cardio Rhythm': { screen: '1:2089', name: 'imgContainer5' },
  'Sleep Recovery': { screen: '1:2089', name: 'imgContainer6' },
  'Hydration Tracker': { screen: '1:2089', name: 'imgContainer8' },
  'Prescription Dosing': { screen: '1:2089', name: 'imgContainer11' },
  'My Medicine Schedule': { screen: '1:570', name: 'imgContainer7' },
  'Medicine Identity': { screen: '1:2943', name: 'imgContainer3' },
  'Schedule & Timing': { screen: '1:2943', name: 'imgContainer12' },
  'Course Duration': { screen: '1:2943', name: 'imgContainer24' },
  'Pill Count & Refill Sync': { screen: '1:2943', name: 'imgContainer26' },
  'Alert Type & Caretaker Safety Net': { screen: '1:2943', name: 'imgContainer29' },
  'Location & Vicinity': { screen: '3:97', name: 'imgContainer6' },
  'ABHA Health ID': { screen: '3:97', name: 'imgContainer9' },
};

export const design = { ink: colors.ink, muted: colors.muted, green: colors.primary, mint: colors.mintSurface, pale: colors.subtle, border: colors.border, blue: colors.secondary, background: colors.background };
export const ds = StyleSheet.create({
  title: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.5, color: design.ink },
  body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: design.muted },
  small: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, color: design.muted },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 19, color: design.ink },
  value: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, letterSpacing: -0.7, color: design.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 14 },
  section: { gap: 12, marginTop: 24 },
});
export function DText({ children, kind = 'body', color, style }: { children: ReactNode; kind?: keyof Pick<typeof ds, 'title' | 'body' | 'small' | 'label' | 'value'>; color?: string; style?: import('react-native').StyleProp<import('react-native').TextStyle> }) {
  const { t } = useTranslation();
  return <Text style={[ds[kind], color ? { color } : undefined, style]}>{typeof children === 'string' ? t(children) : children}</Text>;
}
export function DCard({ children, style }: { children: ReactNode; style?: import('react-native').StyleProp<ViewStyle> }) { return <View style={[ds.card, style]}>{children}</View>; }
export function DHeading({ title, subtitle, action, onPress, icon, inverse = false }: { title: string; subtitle?: string; action?: string; onPress?: () => void; icon?: AppIconName; inverse?: boolean }) {
  const asset = headingAssets[title];
  return <View style={ds.row}>{icon && (asset ? <FigmaAsset {...asset} width={22} /> : <AppIcon name={icon} color={design.green} size={22} />)}<View style={{ flex: 1, gap: 2 }}><DText kind="title" color={inverse ? '#FFFFFF' : undefined}>{title}</DText>{subtitle && <DText>{subtitle}</DText>}</View>{action && <DAction label={action} onPress={onPress} />}</View>;
}
export function DAction({ label, onPress, filled = false, disabled = false }: { label: string; onPress?: () => void; filled?: boolean; disabled?: boolean }) {
  return <TouchTarget accessibilityRole="button" disabled={disabled || !onPress} onPress={onPress} style={({ pressed }) => ({ minHeight: 40, paddingHorizontal: filled ? 15 : 4, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: filled ? design.green : 'transparent', opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}><DText kind="label" color={filled ? '#FFFFFF' : design.green}>{label}</DText></TouchTarget>;
}
export function DPill({ children, color = design.green }: { children: string; color?: string }) { return <View style={{ backgroundColor: design.pale, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start' }}><DText kind="small" color={color}>{children}</DText></View>; }
export function DTabs({ options, value, onChange, scroll = false, grid = false, columns = 2 }: { options: string[]; value: string; onChange: (value: string) => void; scroll?: boolean; grid?: boolean; columns?: 2 | 3 }) {
  const { width, fontScale } = useWindowDimensions(), { large } = useAccessibilityPreferences();
  const gridColumns = columns === 3 && width >= 360 && fontScale < 1.25 && !large ? 3 : 2;
  const tabs = <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: grid ? 'wrap' : 'nowrap', gap: scroll || grid ? 6 : 3, backgroundColor: scroll || grid ? 'transparent' : design.pale, borderRadius: 10, padding: scroll || grid ? 0 : 3 }}>{options.map(option => <TouchTarget key={option} accessibilityRole="radio" accessibilityLabel={option} accessibilityState={{ checked: value === option }} onPress={() => onChange(option)} style={{ flex: scroll || grid ? undefined : 1, width: grid ? gridColumns === 3 ? '31.5%' : '48%' : undefined, minHeight: 40, paddingHorizontal: scroll ? 12 : 7, borderRadius: scroll ? 22 : 8, alignItems: 'center', justifyContent: 'center', backgroundColor: value === option ? design.green : grid || scroll ? '#EFF6F3' : 'transparent' }}><DText kind="small" color={value === option ? '#FFFFFF' : design.muted}>{option}</DText></TouchTarget>)}</View>;
  return scroll ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>{tabs}</ScrollView> : tabs;
}
export function DField({ label, leading, ...props }: TextInputProps & { label: string; leading?: ReactNode }) {
  return <View style={{ gap: 7 }}><DText kind="label">{label}</DText><View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: design.pale, borderRadius: 12, paddingLeft: leading ? 12 : 0 }}>{leading}<TextInput {...props} accessibilityLabel={label} placeholderTextColor="#849A92" selectionColor={design.green} style={[{ flex: 1, minWidth: 0, minHeight: 50, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 14, color: design.ink }, props.style]} /></View></View>;
}
export function DProgress({ value, color = design.green }: { value: number; color?: string }) { return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(Math.max(0, Math.min(1, value)) * 100) }} style={{ height: 7, backgroundColor: design.pale, borderRadius: 5, overflow: 'hidden' }}><View style={{ height: '100%', width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color, borderRadius: 5 }} /></View>; }
