import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CareIllustration, type IllustrationName } from '../../components/app/CareIllustration';
import { AppIcon, type AppIconName } from '../../components/app/AppIcon';
import { careStyles as c } from '../../components/app/CareUI';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { colors, fonts } from '../../theme/tokens';

export function TrackingIntro({ name, title, description }: { name: IllustrationName; title: string; description: string }) {
  const { fontScale, width } = useWindowDimensions();
  const stacked = fontScale > 1.2 || width < 350;
  return <View style={[styles.intro, stacked && styles.stacked]}><View style={styles.copy}><Text accessibilityRole="header" style={c.heading}>{title}</Text><Text style={c.text}>{description}</Text></View><CareIllustration name={name} size={stacked ? 88 : 104} /></View>;
}

export function LogChoice({ label, detail, icon, selected = false, disabled = false, onPress, multiple = false }: { label: string; detail?: string; icon: AppIconName; selected?: boolean; disabled?: boolean; onPress: () => void; multiple?: boolean }) {
  return <TouchTarget accessibilityRole={multiple ? 'checkbox' : 'button'} accessibilityLabel={detail ? `${label}, ${detail}` : label} accessibilityState={{ selected, checked: multiple ? selected : undefined, disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed, disabled && styles.disabled]}>
    <AppIcon name={selected ? 'check' : icon} size={22} color={selected ? colors.surface : colors.primary} />
    <View style={styles.choiceCopy}><Text style={[styles.label, selected && styles.selectedText]}>{label.charAt(0).toUpperCase() + label.slice(1)}</Text>{detail && <Text style={[styles.detail, selected && styles.selectedText]}>{detail}</Text>}</View>
  </TouchTarget>;
}

const styles = StyleSheet.create({
  intro: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, stacked: { flexDirection: 'column-reverse', alignItems: 'flex-start' },
  copy: { flex: 1, gap: 8 }, choiceCopy: { flexShrink: 1, gap: 3 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexGrow: 1, flexBasis: '43%' },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary }, selectedText: { color: colors.surface },
  label: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink }, detail: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted },
  pressed: { opacity: 0.8 }, disabled: { opacity: 0.55 },
});
