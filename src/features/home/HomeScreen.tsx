import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useAuth } from '../auth/context/AuthContext';
import { useWellness } from '../wellness/WellnessContext';
import { homeWater } from './homeModel';
import { Avatar } from '../../components/app/Avatar';
import { AppIcon, type AppIconName } from '../../components/app/AppIcon';
import { CareBrand } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { colors, fonts } from '../../theme/tokens';
import { profilePhoto } from '../profile/profileViewModel';

const shortcuts: { title: string; icon: AppIconName; route: '/water' | '/cycle' | '/profile' | '/edit-health-goals' }[] = [
  { title: 'Water', icon: 'drop', route: '/water' },
  { title: 'Cycle', icon: 'calendar', route: '/cycle' },
  { title: 'My profile', icon: 'user', route: '/profile' },
  { title: 'My goals', icon: 'goal', route: '/edit-health-goals' },
];
export function HomeScreen() {
  const { user } = useAuth();
  const { data, loading, busy, error, refresh, save } = useWellness();
  const { fontScale, width, height } = useWindowDimensions();
  const expanded = width >= 768;
  const compact = height < 720 || fontScale > 1.2;
  const [now, setNow] = useState(() => new Date());
  const [feedback, setFeedback] = useState<{ text: string; logId?: string } | null>(null);
  const [retryLog, setRetryLog] = useState(false);
  const pending = useRef<{ id: string; loggedAt: string; amountMl: number } | null>(null);
  const logLock = useRef(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') setNow(new Date()); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  if (!user) return null;
  const water = homeWater(data, now), plan = data.waterPlan;
  const name = user.fullName?.trim().split(/\s+/)[0] || user.username;
  const time = (value: string) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: plan?.timezone }).format(new Date(value));
  async function logDrink() {
    if (!plan || busy || logLock.current) return;
    logLock.current = true;
    try {
      if (pending.current && data.waterLogs.some(log => log.id === pending.current?.id)) { setFeedback({ text: 'Your drink was saved.', logId: pending.current.id }); pending.current = null; setRetryLog(false); return; }
      pending.current ??= { id: randomUUID(), loggedAt: new Date().toISOString(), amountMl: plan.servingMl };
      const request = pending.current;
      if (await save(`water/logs/${request.id}`, { amountMl: request.amountMl, loggedAt: request.loggedAt, taskId: null })) {
        pending.current = null; setRetryLog(false); setNow(new Date()); setFeedback({ text: `${request.amountMl} ml logged`, logId: request.id });
      } else setRetryLog(true);
    } finally { logLock.current = false; }
  }
  return <SafeAreaView edges={['top', 'left', 'right']} style={s.screen}>
    <View style={[s.appBar, expanded && s.expandedContent]}><CareBrand /><TouchTarget accessibilityRole="button" accessibilityLabel="Open your profile" onPress={() => router.navigate('/profile')} style={s.avatar}><Avatar photo={profilePhoto(user)} size={38} /></TouchTarget></View>
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={colors.primary} colors={[colors.primary]} />}>
      <View style={[s.content, expanded && s.expandedContent]}>
        <View style={[s.greeting, compact && s.compactGreeting]}><Text accessibilityRole="header" numberOfLines={2} style={[s.heading, compact && s.compactHeading]}>{name ? `Hi, ${name}` : 'Your day'}</Text><Text style={s.body}>{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</Text></View>
        <View style={expanded && s.columns}><View style={expanded && s.primaryColumn}>
        <Text accessibilityRole="header" style={s.sectionTitle}>Today</Text>
        {error && <View style={s.error} accessibilityLiveRegion="polite"><Text style={s.errorText}>{retryLog ? 'Your drink could not be confirmed. Retry the log to save it safely.' : plan ? 'Your latest updates could not be loaded. Pull down to refresh or retry.' : 'Your daily tracking could not be loaded.'}</Text><TouchTarget accessibilityRole="button" disabled={loading || busy} onPress={() => void refresh()} style={s.textAction}><Text style={s.actionText}>Refresh tracking</Text></TouchTarget></View>}
        {loading && !plan ? <View key="water-loading" accessibilityLabel="Loading your daily plan" accessibilityState={{ busy: true }} style={s.water}><ActivityIndicator color={colors.primary} /><Text style={s.body}>Loading your day…</Text></View> : plan && water ? <View key="water-ready" style={s.water}>
          <View style={s.sectionHeader}><View style={s.labelRow}><AppIcon name="drop" size={22} /><Text style={s.title}>Water</Text></View><TouchTarget accessibilityRole="button" accessibilityLabel="View water plan" onPress={() => router.push('/water')} style={s.textAction}><Text style={s.actionText}>View plan</Text></TouchTarget></View>
          <View style={s.waterSummary}><Text style={s.amount}>{water.totalMl.toLocaleString()} <Text style={s.target}>/ {plan.targetMl.toLocaleString()} ml</Text></Text><Text style={s.body}>{water.complete ? 'Target reached' : `${water.completedTasks} of ${water.taskCount} tasks logged`}</Text></View>
          <View accessible accessibilityRole="progressbar" accessibilityLabel="Daily water target" accessibilityValue={{ min: 0, max: plan.targetMl, now: Math.min(water.totalMl, plan.targetMl), text: `${water.totalMl} of ${plan.targetMl} millilitres logged` }} style={s.progress}><View style={[s.progressFill, { width: `${water.progress * 100}%` }]} /></View>
          <Text style={s.body}>{water.paused ? 'Reminders paused until bedtime' : !plan.remindersEnabled ? 'Reminders off · You can still log drinks' : water.beforeWake ? `Your plan starts at ${plan.wakeTime}` : water.afterBed ? 'Your waking day is finished' : water.complete ? 'Your drinks are saved for today' : water.next[0] ? `Next task at ${time(water.next[0].snoozedUntil ?? water.next[0].at)}` : 'No more scheduled tasks today'}</Text>
          <Button title={retryLog ? 'Retry drink log' : `Log ${plan.servingMl} ml`} onPress={() => void logDrink()} loading={busy} disabled={loading} />
        </View> : !error && <View key="water-setup" style={s.water}><View style={s.labelRow}><AppIcon name="drop" size={22} /><Text style={s.title}>Water reminders</Text></View><Text style={s.body}>Choose your daily target and waking hours to get a drinking plan.</Text><Button title="Set up water reminders" onPress={() => router.push('/water')} /></View>}
        {feedback && <View style={s.feedback} accessibilityLiveRegion="polite"><Text style={[s.body, s.flex]}>{feedback.text}</Text>{feedback.logId && <TouchTarget accessibilityRole="button" accessibilityLabel="Undo the last water log" disabled={busy} style={s.textAction} onPress={() => void (async () => { if (await save(`water/logs/${feedback.logId}`, undefined, 'DELETE')) setFeedback({ text: 'Water log removed' }); })()}><Text style={s.actionText}>Undo</Text></TouchTarget>}<TouchTarget accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={() => setFeedback(null)} style={s.dismiss}><AppIcon name="check" size={19} /></TouchTarget></View>}
        </View><View style={expanded ? s.secondaryColumn : s.secondaryPhone}>
        <View style={s.shortcuts}>{shortcuts.map(item => <TouchTarget key={item.route} accessibilityRole="button" accessibilityLabel={item.title === 'Cycle' ? 'Open private cycle tracker' : item.title} onPress={() => router.navigate(item.route)} style={[s.shortcut, (expanded || fontScale > 1.4) && s.largeShortcut]}><View style={s.shortcutIcon}><AppIcon name={item.icon} size={23} /></View><Text style={s.shortcutLabel}>{item.title}</Text></TouchTarget>)}</View>
        <TouchTarget accessibilityRole="button" accessibilityLabel="Open private cycle tracker" onPress={() => router.push('/cycle')} style={s.privateRow}><View style={s.privateIcon}><AppIcon name="calendar" color={colors.accent} size={22} /></View><View style={s.flex}><Text style={s.rowTitle}>Cycle tracking</Text><Text style={s.caption}>Your private check-in</Text></View><AppIcon name="right" size={19} /></TouchTarget>
        {water && water.next.length > 0 && !water.complete && <><View style={s.sectionHeader}><Text accessibilityRole="header" style={s.sectionTitle}>Coming up</Text><TouchTarget accessibilityRole="button" accessibilityLabel="See all drinking tasks" onPress={() => router.push('/water')} style={s.textAction}><Text style={s.actionText}>See all</Text></TouchTarget></View><View style={s.list}>{water.next.map(task => <TouchTarget key={task.id} accessibilityRole="button" onPress={() => router.push('/water')} style={s.task}><Text style={s.taskTime}>{time(task.snoozedUntil ?? task.at)}</Text><View style={s.flex}><Text style={s.rowTitle}>Drink {task.remainingMl} ml</Text><Text style={s.caption}>{water.paused ? 'Reminder paused' : task.snoozedUntil ? 'Snoozed' : 'Water plan'}</Text></View><AppIcon name="right" size={18} /></TouchTarget>)}</View></>}
        {water && water.logs.length > 0 && <><Text accessibilityRole="header" style={s.sectionTitle}>Recent activity</Text><View style={s.list}>{water.logs.slice(0,3).map(log => <View key={log.id} style={s.activity}><View style={s.activityIcon}><AppIcon name="check" size={17} /></View><Text style={[s.body,s.flex]}>{log.amountMl} ml water logged</Text><Text style={s.caption}>{time(log.loggedAt)}</Text></View>)}</View></>}
        </View></View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  appBar: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { minWidth: 48, alignItems: 'flex-end', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingBottom: 36 }, content: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingHorizontal: 24 },
  greeting: { gap: 4, paddingTop: 12, paddingBottom: 4 }, heading: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 32, color: colors.ink },
  compactGreeting: { paddingTop: 4, paddingBottom: 0, gap: 2 }, compactHeading: { fontSize: 20, lineHeight: 28 },
  expandedContent: { maxWidth: 1100 }, columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 }, primaryColumn: { flex: 1.15, minWidth: 280 }, secondaryColumn: { flex: 1, minWidth: 240, paddingTop: 24 }, secondaryPhone: { marginTop: 20 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: -4, marginBottom: 4 },
  shortcut: { flex: 1, minWidth: 52, gap: 8, alignItems: 'center', paddingVertical: 8 }, largeShortcut: { flexBasis: '45%' },
  shortcutIcon: { width: 52, height: 48, backgroundColor: colors.subtle, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: colors.ink, textAlign: 'center' },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 26, color: colors.ink, marginTop: 24, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, title: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24, color: colors.ink },
  textAction: { minWidth: 48, paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center' }, actionText: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 20, color: colors.primary },
  water: { padding: 18, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 14 },
  waterSummary: { gap: 4 }, amount: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 30, color: colors.ink }, target: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted },
  progress: { height: 6, borderRadius: 3, backgroundColor: colors.subtle, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  privateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 20, borderBottomWidth: 1, borderColor: colors.border },
  privateIcon: { width: 40, height: 40, backgroundColor: colors.accentSurface, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink }, caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 19, color: colors.muted }, flex: { flex: 1 },
  list: { borderTopWidth: 1, borderColor: colors.border }, task: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.border },
  taskTime: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, color: colors.ink, maxWidth: 90 },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.border },
  activityIcon: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 14, marginTop: 12, backgroundColor: colors.subtle, borderRadius: 12 }, dismiss: { minWidth: 48, justifyContent: 'center', alignItems: 'center' },
  error: { padding: 14, borderRadius: 12, backgroundColor: colors.accentSurface, gap: 6, marginBottom: 12 }, errorText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.error },
});
