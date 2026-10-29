import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useInbox } from './InboxProvider';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
export function NotificationBell() {
  const { items } = useInbox(), colors = usePalette();
  const unread = items.filter(item => !item.read).length;
  return <TouchTarget accessibilityRole="button" accessibilityLabel={`Notifications${unread ? `, ${unread} unread` : ''}`} onPress={() => router.navigate('/notifications')} style={{ width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
    <AppIcon name="bell" color={colors.ink} size={24} />
    {unread > 0 && <View style={{ position: 'absolute', right: 1, top: 2, minWidth: 18, paddingHorizontal: 3, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center' }}><Text style={{ color: colors.onPrimary, fontFamily: fonts.semibold, fontSize: 10, lineHeight: 18 }}>{unread > 99 ? '99+' : unread}</Text></View>}
  </TouchTarget>;
}
