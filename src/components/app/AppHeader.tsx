import { Text, View, StyleSheet, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../features/auth/context/AuthContext';
import { SidebarButton } from '../../navigation/AppSidebar';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { TouchTarget } from '../ui/TouchTarget';
import { AppIcon } from './AppIcon';
import { CareBrand } from './CareUI';

/** Shared access to navigation on every signed-in destination. */
export function AppHeader({ title, back = false, action, style }: { title?: string; back?: boolean; action?: ReactNode; style?: ViewStyle }) {
  const { user } = useAuth();
  const colors = usePalette();
  const canOpenMenu = Boolean(user?.profileCompletedAt);
  if (!back && !canOpenMenu) return null;
  return <View style={[s.header, style]}>
    {back ? <TouchTarget accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace(user ? '/profile' : '/signup')} style={s.control}><AppIcon name="back" color={colors.ink} size={22} /></TouchTarget> : <SidebarButton />}
    <View style={s.title}>{title ? <Text accessibilityRole="header" style={[s.titleText, { color: colors.ink }]}>{title}</Text> : <CareBrand />}</View>
    <View style={s.actions}>{action}{back && canOpenMenu && <SidebarButton />}{!action && !(back && canOpenMenu) && <View style={s.control} />}</View>
  </View>;
}
const s = StyleSheet.create({
  header: { width: '100%', maxWidth: 440, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, minHeight: 56, gap: 4 },
  control: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 8 },
  titleText: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 26, textAlign: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', minWidth: 48 },
});
