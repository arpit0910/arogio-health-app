import { AccessibleText as Text } from '../../../components/ui/AccessibleText';
import { createContext, useContext, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { FigmaAsset } from '../../../components/app/FigmaAsset';
import { AppIcon, type AppIconName } from '../../../components/app/AppIcon';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { usePalette } from '../../../theme/AppearanceProvider';
import { fonts } from '../../../theme/tokens';
import { useTranslation } from '../../../localization/LanguageProvider';

export const ProfileReadability = createContext(false);
export function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  const c = usePalette(), { t } = useTranslation();
  return <View style={s.section}><Text accessibilityRole="header" style={[s.sectionTitle, { color: c.muted }]}>{t(title)}</Text><View style={[s.panel, { backgroundColor: c.surface }]}>{children}</View></View>;
}
export function ProfileRow({ icon, title, detail, onPress, trailing, last = false, danger = false, unavailable = false }: {
  icon: AppIconName; title: string; detail?: string; onPress?: () => void; trailing?: ReactNode; last?: boolean; danger?: boolean; unavailable?: boolean;
}) {
  const c = usePalette(), { t } = useTranslation(), large = useContext(ProfileReadability);
  const asset = ({ 'Saved Hospitals & Clinics': 'imgContainer5', 'Saved Doctors & Specialists': 'imgContainer7', 'Recent Searches & Departments': 'imgContainer8', 'App Language / \u092d\u093e\u0937\u093e': 'imgContainer9', 'City & Medical Zone': 'imgContainer10', '108 SOS Dispatch Relay': 'imgContainer11', 'Senior / High Accessibility Mode': 'imgContainer12', 'Jan Aushadhi Kendra Locator': 'imgContainer14', 'Data Privacy & Consent Locker': 'imgContainer15', 'Arogio Support & Feedback': 'imgContainer18', 'Log Out': 'imgContainer19' } as Record<string, string>)[title];
  const content = <><View style={[s.icon, { backgroundColor: danger ? c.errorSurface : c.subtle }]}><View>{asset ? <FigmaAsset screen="1:1349" name={asset} width={18} /> : <AppIcon name={icon} size={21} color={danger ? c.error : c.primary} />}</View></View><View style={s.copy}><Text style={[s.title, large && s.largeTitle, { color: danger ? c.error : c.ink }]}>{t(title)}</Text>{!!detail && <Text style={[s.detail, large && s.largeDetail, { color: c.muted }]}>{t(detail)}</Text>}{unavailable && <ProfileBadge text="Not linked" />}</View>{trailing}{onPress && <AppIcon name="right" size={13} color={danger ? c.error : c.muted} />}</>;
  const style = [s.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }, large && s.largeRow];
  return onPress ? <TouchTarget accessibilityRole="button" accessibilityLabel={`${t(title)}${detail ? `. ${t(detail)}` : ''}`} onPress={onPress} style={({ pressed }) => [style, { opacity: pressed ? 0.65 : 1 }]}>{content}</TouchTarget> : <View style={style}>{content}</View>;
}
export function ProfileBadge({ text }: { text: string }) {
  const c = usePalette(), { t } = useTranslation();
  return <View style={[s.badge, { backgroundColor: c.mintSurface }]}><Text style={[s.status, { color: c.primary }]}>{t(text)}</Text></View>;
}
const s = StyleSheet.create({
  section: { gap: 8 }, sectionTitle: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, letterSpacing: 0.35 }, panel: { borderRadius: 16, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 94, paddingVertical: 16 }, largeRow: { flexWrap: 'wrap', minHeight: 108 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, copy: { flex: 1, minWidth: 100 },
  title: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 23, letterSpacing: -0.35 }, detail: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 3 },
  status: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 17 }, badge: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 9, flexShrink: 0 },
  largeTitle: { fontSize: 21, lineHeight: 29 }, largeDetail: { fontSize: 15, lineHeight: 22 },
});
