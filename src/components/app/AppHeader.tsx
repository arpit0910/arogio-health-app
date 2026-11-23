import { AccessibleText as Text } from '../ui/AccessibleText';
import { memo, type ReactNode } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { authAssets } from '../../features/authentication/assets/authAssets';
import { useAuth } from '../../features/authentication/context/AuthContext';
import { profilePhoto } from '../../features/profile/profileViewModel';
import { NotificationBell } from '../../features/notifications/NotificationBell';
import { useSidebar } from '../../navigation/AppSidebar';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts, typeStyles } from '../../theme/tokens';
import { TouchTarget } from '../ui/TouchTarget';
import { AppIcon } from './AppIcon';

export function AppHeader({ title, back = false, action, style, onBack }: { title?: string; back?: boolean; action?: ReactNode; style?: ViewStyle; onBack?: () => void }) {
  const router = useRouter(), c = usePalette(), { t } = useTranslation();
  return <View style={[s.header, { backgroundColor: c.surface, borderBottomColor: c.border }, style]}>
    {back ? <View style={s.detailRow}><TouchTarget accessibilityRole="button" accessibilityLabel={t('Back')} onPress={onBack ?? (() => router.canGoBack() ? router.back() : router.replace('/home'))} style={s.control}><AppIcon name="back" color={c.ink} size={22} /></TouchTarget><Text accessibilityRole="header" style={[typeStyles.title, s.flex, { color: c.ink }]}>{t(title)}</Text>{action ?? <EmergencyShortcut />}</View> : <>
      <NavigationRow />
      {(title || action) && <View style={s.pageRow}><Text accessibilityRole="header" style={[typeStyles.detail, s.flex, { color: c.muted }]}>{t(title)}</Text>{action}</View>}
    </>}
  </View>;
}

const NavigationRow = memo(function NavigationRow() {
  const router = useRouter(), c = usePalette(), { t } = useTranslation(), { user } = useAuth();
  const { openSidebar } = useSidebar();
  const photo = user ? profilePhoto(user) : undefined;
  return <View style={s.row}>
    <TouchTarget accessibilityRole="button" accessibilityLabel={t(user ? 'Arogio. Open navigation menu' : 'Home')} onPress={user ? openSidebar : () => router.navigate('/home')} style={s.brand}>
      <SvgXml xml={authAssets.brand} width={28} height={28} />
      <View style={s.flex}><Text style={[s.wordmark, { color: c.primary }]}>Arogio</Text><Text style={[s.tagline, { color: c.muted }]}>{t('Health. Help. Hope.')}</Text></View>
    </TouchTarget>
    {user ? <NotificationBell /> : <TouchTarget accessibilityRole="button" accessibilityLabel={t('Notifications. Sign in')} onPress={() => router.push('/login')} style={s.control}><AppIcon name="bell" size={22} color={c.ink} /></TouchTarget>}
    <TouchTarget accessibilityRole="button" accessibilityLabel={t('Profile')} onPress={() => router.navigate('/profile')} style={s.control}>
      <View style={[s.avatarRing, { borderColor: c.mintSurface }]}>{photo ? <Image source={{ uri: photo }} accessible={false} style={s.avatar} /> : <View style={[s.avatar, { backgroundColor: c.subtle, alignItems: 'center', justifyContent: 'center' }]}><AppIcon name="user" size={20} color={c.primary} /></View>}</View>
    </TouchTarget>
  </View>;
});

export function EmergencyShortcut() {
  const router = useRouter(), c = usePalette(), { t } = useTranslation();
  return <TouchTarget accessibilityRole="button" accessibilityLabel={t('Emergency contacts')} onPress={() => router.push('/emergency')} style={s.control}><AppIcon name="ambulance" color={c.error} size={22} /><Text style={[typeStyles.label, { color: c.error }]}>SOS</Text></TouchTarget>;
}
const s = StyleSheet.create({
  header: { width: '100%', borderBottomWidth: StyleSheet.hairlineWidth },
  row: { width: '100%', maxWidth: 880, alignSelf: 'center', minHeight: 68, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 2 },
  brand: { flex: 1, minWidth: 100, flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 6 },
  wordmark: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24 },
  tagline: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 14 },
  city: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 10, borderRadius: 28, minHeight: 48, flexShrink: 1 },
  control: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  avatarRing: { padding: 2, borderWidth: 2, borderRadius: 24 },
  avatar: { width: 32, height: 32, borderRadius: 16 }, flex: { flex: 1, minWidth: 0 },
  pageRow: { paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailRow: { width: '100%', maxWidth: 880, alignSelf: 'center', minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 4 },
});
