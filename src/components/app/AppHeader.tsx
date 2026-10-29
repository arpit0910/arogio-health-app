import { Text, View, StyleSheet, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../features/auth/context/AuthContext';
import { SidebarButton } from '../../navigation/AppSidebar';
import { NotificationBell } from '../../features/notifications/NotificationBell';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { TouchTarget } from '../ui/TouchTarget';
import { AppIcon } from './AppIcon';
import { CareBrand } from './CareUI';
/** The same navigation positions on every signed-in screen. */
export function AppHeader({ title, back = false, action, style }: { title?: string; back?: boolean; action?: ReactNode; style?: ViewStyle }) {
  const { user } = useAuth(), colors = usePalette();
  const canOpenMenu = Boolean(user?.profileCompletedAt);
  if (!back && !canOpenMenu) return null;
  const goBack = () => router.canGoBack() ? router.back() : router.replace(user ? '/profile' : '/signup');
  return <View style={[s.header, style]}>
    {canOpenMenu && <View style={s.row}><SidebarButton /><View style={s.brand}><CareBrand /></View><NotificationBell /></View>}
    {(back || title || action) && <View style={s.pageRow}>
      {back && <TouchTarget accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={s.control}><AppIcon name="back" color={colors.ink} size={20} /></TouchTarget>}
      <Text accessibilityRole="header" style={[s.title, { color: colors.ink }]}>{title}</Text>{action}
    </View>}
  </View>;
}
const s = StyleSheet.create({
  header: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 56, paddingVertical: 4 },
  brand: { flex: 1, alignItems: 'center' },
  pageRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: 12, gap: 4 },
  control: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, minWidth: 0, fontFamily: fonts.semibold, fontSize: 17, lineHeight: 25, paddingHorizontal: 8 },
});
