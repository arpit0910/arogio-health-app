import { useTranslation } from "../../localization/LanguageProvider";
import { usePalette } from '../../theme/AppearanceProvider';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { authAssets } from '../../features/auth/assets/authAssets';
import { fonts } from '../../theme/tokens';
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
    {icon && <AppIcon name={icon} size={22} />}<View style={s.copy}><Text style={s.rowTitle}>{tr(title)}</Text>{detail && <Text style={s.detail}>{tr(detail)}</Text>}</View><AppIcon name="right" size={18} />
  </TouchTarget>;
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
  heading: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 34, color: colors.ink, letterSpacing: -0.5 },
  title: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 28, color: colors.ink },
  text: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.muted },
  section: { marginTop: 24 },
  line: { borderTopWidth: 1, borderColor: colors.border },
});
};
const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  wordmark: { fontFamily: fonts.semibold, fontSize: 24, color: colors.ink, letterSpacing: -0.7 },
  pressed: { backgroundColor: colors.subtle, borderRadius: 12 },
  row: { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  copy: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 23, color: colors.ink },
  detail: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, marginTop: 3, color: colors.muted },
  disclosureRow: { backgroundColor: 'transparent', marginTop: 0, paddingHorizontal: 0 },
  disclosure: { borderTopWidth: 1, borderColor: colors.border },
  disclosed: { paddingBottom: 20, gap: 8 },
});
};
