import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { AppIcon } from '../../components/app/AppIcon';
import { CareRow, useCareStyles } from '../../components/app/CareUI';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { usePalette } from '../../theme/AppearanceProvider';
import { formatDateTime } from '../../lib/time';
import { useInbox } from './InboxProvider';
export function NotificationsScreen() {
  const { items, loading, error, markRead } = useInbox(), c = useCareStyles(), colors = usePalette();
  return <AppScreen back title="Notifications">
    <View style={{ gap: 8 }}><Text style={c.heading}>Your updates</Text><Text style={c.text}>Arogio reminders on this device, up to 120 recent reminders from the last 90 days. A reminder appearing here does not mean it was completed.</Text></View>
    <CareRow icon="settings" title="Notification settings" detail="Permissions, sound and reminders" onPress={() => router.push('/notification-settings')} />
    {!!error && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{error}</Text>}
    {loading ? <ActivityIndicator color={colors.primary} /> : items.length === 0 ? <View style={{ paddingVertical: 48, gap: 16, alignItems: 'center' }}><AppIcon name="bell" size={36} /><Text style={c.title}>You’re all caught up</Text><Text style={[c.text, { textAlign: 'center' }]}>Your water, medicine and cycle reminders will appear here when they’re due.</Text></View> : <View style={{ marginTop: 24 }}>
      {items.some(item => !item.read) && <TouchTarget accessibilityRole="button" onPress={() => void markRead()} style={{ paddingVertical: 12 }}><Text style={[c.text, { color: colors.primary }]}>Mark all as read</Text></TouchTarget>}
      {items.map(item => <TouchTarget key={item.id} accessibilityRole="button" accessibilityLabel={`${item.read ? '' : 'Unread. '}${item.title}. ${item.body}. ${formatDateTime(new Date(item.at))}`} onPress={() => { void markRead(item.id); router.push(item.route); }} style={{ flexDirection: 'row', gap: 14, paddingVertical: 20, borderTopWidth: 1, borderColor: colors.border }}><AppIcon name={item.route === '/water' ? 'drop' : item.route === '/medicines' ? 'pill' : 'calendar'} /><View style={{ flex: 1, gap: 6 }}><Text style={c.title}>{item.title}</Text><Text style={c.text}>{item.body}</Text><Text style={[c.text, { fontSize: 12 }]}>{formatDateTime(new Date(item.at))}{!item.read ? ' - Unread' : ''}</Text></View></TouchTarget>)}
    </View>}
  </AppScreen>;
}
