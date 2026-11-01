import { useTranslation } from "../../localization/LanguageProvider";
import { canEnterApp } from '../../features/profile/setupStatus';
import { Text, View, StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import { memo, type ReactNode } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { SidebarButton } from '../../navigation/AppSidebar';
import { NotificationBell } from '../../features/notifications/NotificationBell';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { CareBrand } from './CareUI';
/** The same navigation positions on every signed-in screen. */
export function AppHeader({ title, back = false, action, style }: { title?: string; back?: boolean; action?: ReactNode; style?: ViewStyle }) {
  const { t: tr } = useTranslation();
  const { user } = useAuth(), colors = usePalette();
  const { width } = useWindowDimensions();
  const canOpenMenu = canEnterApp(user);
  if (!back && !canOpenMenu) return null;
  return <View style={[s.header, width >= 1024 && { maxWidth: 880 }, style]}>
    {canOpenMenu && <NavigationRow />}
    {(title || action) && <View style={s.pageRow}>
      <Text accessibilityRole="header" style={[s.title, { color: colors.ink }]}>{tr(title)}</Text>{action}
    </View>}
  </View>;
}
// Screen search/filter state must not invalidate the shared navigation drawing.
// Its children retain their own account, language, theme and notification updates.
const NavigationRow = memo(function NavigationRow() {
  return <View style={s.row}><SidebarButton /><View style={s.brand}><CareBrand /></View><NotificationBell /></View>;
});
const s = StyleSheet.create({
  header: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 56, paddingVertical: 4 },
  brand: { flex: 1, alignItems: 'center' },
  pageRow: { flexDirection: 'row', alignItems: 'center', minHeight: 40, paddingHorizontal: 20, gap: 12 },
  control: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, minWidth: 0, fontFamily: fonts.medium, fontSize: 13, lineHeight: 20 },
});
