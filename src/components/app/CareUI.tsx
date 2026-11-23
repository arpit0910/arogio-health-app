import { AccessibleText as Text } from '../ui/AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import { usePalette } from '../../theme/AppearanceProvider';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { authAssets } from '../../features/authentication/assets/authAssets';
import { fonts, typeStyles, ui } from '../../theme/tokens';
import { TouchTarget } from '../ui/TouchTarget';
import { AppIcon, type AppIconName } from './AppIcon';

export function CareBrand() {
  const { t: tr } = useTranslation();
  const s = useStyles();

  return <View style={s.brand} accessible accessibilityLabel={tr("Arogio")}><SvgXml xml={authAssets.brand} width={32} height={29} /><Text style={s.wordmark}>{tr("Arogio")}</Text></View>;
}
export function CareRow({ title, detail, onPress, icon }: { title: string; detail?: string; onPress: () => void; icon?: AppIconName }) {
  const { t: tr } = useTranslation();
  const s = useStyles();

  return <TouchTarget accessibilityRole="button" accessibilityLabel={`${title}${detail ? `. ${detail}` : ''}`} onPress={onPress} style={({ pressed }) => [s.row, pressed && s.pressed]}>
    {icon && <View style={s.rowIcon}><AppIcon name={icon} size={23} /></View>}<View style={s.copy}><Text style={s.rowTitle}>{tr(title)}</Text>{detail && <Text style={s.detail}>{tr(detail)}</Text>}</View><AppIcon name="right" size={16} />
  </TouchTarget>;
}
export function CareGroup({ title, children }: { title?: string; children: ReactNode }) {
  const c = usePalette();
  const { t } = useTranslation();
  return <View style={{ marginTop: 24, gap: 12 }}>
    {title && <Text accessibilityRole="header" style={{ ...typeStyles.title, color: c.ink }}>{t(title)}</Text>}
    <View style={{ backgroundColor: c.surface, borderRadius: ui.radius.card, paddingHorizontal: 16, paddingBottom: 8 }}>{children}</View>
  </View>;
}
export function CareDisclosure({ title, children, divider = true }: { title: string; children: ReactNode; divider?: boolean }) {
  const { t: tr } = useTranslation();
  const s = useStyles();

  const [open, setOpen] = useState(false);
  return <View style={divider && s.disclosure}><TouchTarget accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(value => !value)} style={({ pressed }) => [s.row, s.disclosureRow, pressed && s.pressed]}>
    <Text style={[s.rowTitle, s.copy]}>{tr(title)}</Text><AppIcon name={open ? 'down' : 'right'} size={18} />
  </TouchTarget>{open && <View style={s.disclosed}>{children}</View>}</View>;
}
export const useCareStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  heading: { ...typeStyles.heading, color: colors.ink },
  title: { ...typeStyles.title, color: colors.ink },
  text: { ...typeStyles.body, color: colors.muted },
  section: { marginTop: 24 },
  line: { borderTopWidth: 1, borderColor: colors.border },
});
};
const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  wordmark: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 32, includeFontPadding: false, color: colors.ink, letterSpacing: -0.7 },
  pressed: { backgroundColor: colors.subtle, borderRadius: 12 },
  row: { borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  rowIcon: { flexShrink: 0, width: 44, height: 44, borderRadius: 14, backgroundColor: colors.mintSurface, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  rowTitle: { ...typeStyles.rowTitle, color: colors.ink },
  detail: { ...typeStyles.detail, marginTop: 4, color: colors.muted },
  disclosureRow: { backgroundColor: 'transparent', marginTop: 0, paddingHorizontal: 0 },
  disclosure: { borderTopWidth: 1, borderColor: colors.border },
  disclosed: { paddingBottom: 20, gap: 8 },
});
};
