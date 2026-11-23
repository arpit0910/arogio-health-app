import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import { usePalette } from '../../theme/AppearanceProvider';
import { StyleSheet, View } from 'react-native';
import { type IllustrationName } from '../../components/app/CareIllustration';
import { PageIntro } from '../../components/app/PageIntro';
import { AppIcon, type AppIconName } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { fonts } from '../../theme/tokens';

export function TrackingIntro({ name, title, description }: { name: IllustrationName; title: string; description: string }) {
  const icon: AppIconName = name === 'water' ? 'drop' : name === 'cycle' ? 'calendar' : 'pill';
  return <PageIntro title={title} description={description} icon={icon} tone={name === 'water' ? 'blue' : name === 'cycle' ? 'lavender' : 'rose'} />;
}

export function LogChoice({ label, detail, icon, selected = false, disabled = false, onPress, multiple = false }: { label: string; detail?: string; icon: AppIconName; selected?: boolean; disabled?: boolean; onPress: () => void; multiple?: boolean }) {
  const { t: tr } = useTranslation();
  const colors = usePalette();
  const styles = useStyles();

  return <TouchTarget accessibilityRole={multiple ? 'checkbox' : 'button'} accessibilityLabel={detail ? `${label}, ${detail}` : label} accessibilityState={{ selected, checked: multiple ? selected : undefined, disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed, disabled && styles.disabled]}>
    <AppIcon name={selected ? 'check' : icon} size={22} color={selected ? colors.onPrimary : colors.primary} />
    <View style={styles.choiceCopy}><Text style={[styles.label, selected && styles.selectedText]}>{label.charAt(0).toUpperCase() + label.slice(1)}</Text>{detail && <Text style={[styles.detail, selected && styles.selectedText]}>{tr(detail)}</Text>}</View>
  </TouchTarget>;
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  intro: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 }, stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  art: { width: 88, height: 96, borderRadius: 16, backgroundColor: colors.subtle, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 8 }, choiceCopy: { flexShrink: 1, gap: 3 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexGrow: 1, flexBasis: '43%' },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary }, selectedText: { color: colors.onPrimary },
  label: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink }, detail: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted },
  pressed: { opacity: 0.8 }, disabled: { opacity: 0.55 },
});
};
