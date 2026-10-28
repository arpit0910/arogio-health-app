import {
  APP_TIMEZONE,
  formatClock,
  formatDateTime,
  formatTime,
} from '../../lib/time';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useAuth } from '../auth/context/AuthContext';
import { useWellness } from '../wellness/WellnessContext';
import { localDay } from '../wellness/domain';
import { homeUpcoming, homeWater } from './homeModel';
import { SidebarButton } from '../../navigation/AppSidebar';
import { Avatar } from '../../components/app/Avatar';
import { AppIcon, type AppIconName } from '../../components/app/AppIcon';
import { CareBrand } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { colors, fonts } from '../../theme/tokens';
import { profilePhoto } from '../profile/profileViewModel';

const shortcuts: {
  title: string;
  icon: AppIconName;
  route: '/water' | '/medicines' | '/cycle' | '/connected-health';
}[] = [
  { title: 'Water', icon: 'drop', route: '/water' },
  { title: 'Medicines', icon: 'pill', route: '/medicines' },
  { title: 'Cycle', icon: 'calendar', route: '/cycle' },
  { title: 'Health sync', icon: 'sync', route: '/connected-health' },
];
export function HomeScreen() {
  const { user } = useAuth();
  const { data, loading, busy, error, refresh, save } = useWellness();
  const { fontScale, width } = useWindowDimensions();
  const expanded = width >= 768;
  const [now, setNow] = useState(() => new Date());
  const [feedback, setFeedback] = useState<{
    text: string;
    logId?: string;
  } | null>(null);
  const [retryLog, setRetryLog] = useState(false);
  const pending = useRef<{
    id: string;
    loggedAt: string;
    amountMl: number;
  } | null>(null);
  const logLock = useRef(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  if (!user) return null;
  const water = homeWater(data, now),
    plan = data.waterPlan,
    upcoming = homeUpcoming(data, now);
  const name = user.fullName?.trim().split(/\s+/)[0] || user.username;
  const careTime = (at: string) =>
    localDay(new Date(at)) === localDay(now)
      ? formatTime(at)
      : formatDateTime(at);
  async function logDrink() {
    if (!plan || busy || logLock.current) return;
    logLock.current = true;
    try {
      if (
        pending.current &&
        data.waterLogs.some((log) => log.id === pending.current?.id)
      ) {
        setFeedback({
          text: 'Your drink was saved.',
          logId: pending.current.id,
        });
        pending.current = null;
        setRetryLog(false);
        return;
      }
      pending.current ??= {
        id: randomUUID(),
        loggedAt: new Date().toISOString(),
        amountMl: plan.servingMl,
      };
      const request = pending.current;
      if (
        await save(`water/logs/${request.id}`, {
          amountMl: request.amountMl,
          loggedAt: request.loggedAt,
          taskId: null,
        })
      ) {
        pending.current = null;
        setRetryLog(false);
        setNow(new Date());
        setFeedback({
          text: `${request.amountMl} ml logged`,
          logId: request.id,
        });
      } else setRetryLog(true);
    } finally {
      logLock.current = false;
    }
  }
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={s.screen}>
      <View style={[s.appBar, expanded && s.expandedContent]}>
        <SidebarButton />
        <View style={s.brand}>
          <CareBrand />
        </View>
        <TouchTarget
          accessibilityRole="button"
          accessibilityLabel="Open your profile"
          onPress={() => router.navigate('/profile')}
          style={s.avatar}
        >
          <Avatar photo={profilePhoto(user)} size={36} />
        </TouchTarget>
      </View>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={[s.content, expanded && s.expandedContent]}>
          <View style={s.greeting}>
            <Text accessibilityRole="header" style={s.heading}>
              {name ? `Hi, ${name}` : 'Your day'}
            </Text>
            <Text style={s.date}>
              {now.toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                timeZone: APP_TIMEZONE,
              })}
            </Text>
          </View>
          <View style={s.shortcuts}>
            {shortcuts.map((item) => (
              <TouchTarget
                key={item.route}
                accessibilityRole="button"
                accessibilityLabel={
                  item.title === 'Cycle'
                    ? 'Open private cycle tracker'
                    : item.title
                }
                onPress={() => router.navigate(item.route)}
                style={({ pressed }) => [
                  s.shortcut,
                  fontScale > 1.3 && s.largeShortcut,
                  pressed && s.pressed,
                ]}
              >
                <View style={s.shortcutIcon}>
                  <AppIcon name={item.icon} size={24} />
                </View>
                <Text style={s.shortcutLabel}>{item.title}</Text>
              </TouchTarget>
            ))}
          </View>
          {error && (
            <View style={s.error} accessibilityLiveRegion="polite">
              <Text style={s.errorText}>
                {retryLog
                  ? 'Your drink could not be confirmed. Retry the log to save it safely.'
                  : 'Your latest tracking could not be loaded. Refresh to try again.'}
              </Text>
              <Button
                title="Refresh tracking"
                variant="secondary"
                disabled={loading || busy}
                onPress={() => void refresh()}
              />
            </View>
          )}
          <View style={expanded && s.columns}>
            <View style={expanded && s.primaryColumn}>
              <View style={s.sectionHeader}>
                <Text accessibilityRole="header" style={s.sectionTitle}>
                  Daily care
                </Text>
                <TouchTarget
                  accessibilityRole="button"
                  onPress={() => router.navigate('/health')}
                  style={s.textAction}
                >
                  <Text style={s.actionText}>View health</Text>
                  <AppIcon name="right" size={15} />
                </TouchTarget>
              </View>
              {loading && !plan ? (
                <View
                  key="water-loading"
                  accessibilityLabel="Loading your daily plan"
                  accessibilityState={{ busy: true }}
                  style={s.water}
                >
                  <ActivityIndicator color={colors.primary} />
                  <Text style={s.body}>Loading your day...</Text>
                </View>
              ) : plan && water ? (
                <View key="water-ready" style={s.water}>
                  <View style={[s.sectionHeader, s.waterHeader]}>
                    <View style={s.labelRow}>
                      <AppIcon name="drop" size={24} />
                      <Text style={s.title}>Water</Text>
                    </View>
                    <TouchTarget
                      accessibilityRole="button"
                      accessibilityLabel="View water plan"
                      onPress={() => router.push('/water')}
                      style={s.textAction}
                    >
                      <Text style={s.actionText}>View plan</Text>
                    </TouchTarget>
                  </View>
                  <Text style={s.waterAmount}>
                    {water.totalMl.toLocaleString('en-IN')}{' '}
                    <Text style={s.target}>
                      of {plan.targetMl.toLocaleString('en-IN')} ml today
                    </Text>
                  </Text>
                  <View
                    accessible
                    accessibilityRole="progressbar"
                    accessibilityLabel="Daily water target"
                    accessibilityValue={{
                      min: 0,
                      max: plan.targetMl,
                      now: Math.min(water.totalMl, plan.targetMl),
                      text: `${water.totalMl} of ${plan.targetMl} millilitres logged`,
                    }}
                    style={s.progress}
                  >
                    <View
                      style={[
                        s.progressFill,
                        { width: `${water.progress * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={s.body}>
                    {water.paused
                      ? 'Reminders are paused. You can still log water.'
                      : !plan.remindersEnabled
                        ? 'Reminders are off. Log a drink whenever you like.'
                        : water.beforeWake
                          ? `Your plan starts at ${formatClock(plan.wakeTime)}`
                          : water.complete
                            ? 'Daily target reached. Your drinks are saved.'
                            : water.afterBed
                              ? 'Your waking day is finished.'
                              : water.next[0]
                                ? `Next drinking time: ${formatTime(water.next[0].snoozedUntil ?? water.next[0].at)}`
                                : 'No more drinking times today.'}
                  </Text>
                  <Button
                    title={
                      retryLog
                        ? 'Retry drink log'
                        : `Log ${plan.servingMl} ml water`
                    }
                    leading={
                      <AppIcon name="glass" size={21} color={colors.surface} />
                    }
                    onPress={() => void logDrink()}
                    loading={busy}
                    disabled={loading}
                  />
                </View>
              ) : (
                !error && (
                  <View key="water-setup" style={s.water}>
                    <View style={s.labelRow}>
                      <AppIcon name="drop" size={24} />
                      <Text style={s.title}>Make room for water</Text>
                    </View>
                    <Text style={s.body}>
                      Choose a target and your waking hours. Your daily drinking
                      plan will appear here.
                    </Text>
                    <Button
                      title="Set up water reminders"
                      onPress={() => router.push('/water')}
                    />
                  </View>
                )
              )}
              {feedback && (
                <View style={s.feedback} accessibilityLiveRegion="polite">
                  <Text style={[s.body, s.flex]}>{feedback.text}</Text>
                  {feedback.logId && (
                    <TouchTarget
                      accessibilityRole="button"
                      accessibilityLabel="Undo the last water log"
                      disabled={busy}
                      style={s.textAction}
                      onPress={() =>
                        void (async () => {
                          if (
                            await save(
                              `water/logs/${feedback.logId}`,
                              undefined,
                              'DELETE',
                            )
                          )
                            setFeedback({ text: 'Water log removed' });
                        })()
                      }
                    >
                      <Text style={s.actionText}>Undo</Text>
                    </TouchTarget>
                  )}
                  <TouchTarget
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss message"
                    onPress={() => setFeedback(null)}
                    style={s.dismiss}
                  >
                    <AppIcon name="close" size={18} />
                  </TouchTarget>
                </View>
              )}
              <TouchTarget
                accessibilityRole="button"
                onPress={() => router.push('/connected-health')}
                style={({ pressed }) => [s.connected, pressed && s.pressed]}
              >
                <AppIcon name="sync" size={25} />
                <View style={s.flex}>
                  <Text style={s.rowTitle}>Connect your health apps</Text>
                  <Text style={s.caption}>
                    View steps, sleep, heart rate and weight
                  </Text>
                </View>
                <AppIcon name="right" size={18} />
              </TouchTarget>
            </View>
            <View style={expanded ? s.secondaryColumn : undefined}>
              <View style={s.sectionHeader}>
                <Text accessibilityRole="header" style={s.sectionTitle}>
                  Next in your day
                </Text>
                <AppIcon name="clock" size={19} color={colors.muted} />
              </View>
              {loading && !plan && !data.medicines?.length ? (
                <ActivityIndicator
                  accessibilityLabel="Loading upcoming care"
                  color={colors.primary}
                />
              ) : (
                !error &&
                (upcoming.length ? (
                  <View style={s.list}>
                    {upcoming.map((item) => (
                      <TouchTarget
                        key={item.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.title}, ${careTime(item.at)}, ${item.detail}`}
                        onPress={() => router.push(item.route)}
                        style={({ pressed }) => [s.task, pressed && s.pressed]}
                      >
                        <View style={s.taskIcon}>
                          <AppIcon name={item.icon} size={21} />
                        </View>
                        <View style={s.flex}>
                          <Text style={s.rowTitle}>{item.title}</Text>
                          <Text style={s.caption}>{item.detail}</Text>
                          <Text style={s.taskTime}>{careTime(item.at)}</Text>
                        </View>
                        <AppIcon name="right" size={18} />
                      </TouchTarget>
                    ))}
                  </View>
                ) : (
                  <View style={s.empty}>
                    <Text style={s.body}>
                      {plan || data.medicines?.length
                        ? 'No more upcoming times today. Your plans are always available in Health.'
                        : 'Add a medicine or water plan to see upcoming times here.'}
                    </Text>
                    <Button
                      title={
                        data.medicines?.length
                          ? 'Manage medicines'
                          : 'Add a medicine'
                      }
                      variant="secondary"
                      onPress={() => router.push('/medicines')}
                    />
                  </View>
                ))
              )}
              {water && water.logs.length > 0 && (
                <>
                  <View style={s.sectionHeader}>
                    <Text accessibilityRole="header" style={s.sectionTitle}>
                      Recent activity
                    </Text>
                    <TouchTarget
                      accessibilityRole="button"
                      accessibilityLabel="View water history"
                      onPress={() => router.push('/water')}
                      style={s.textAction}
                    >
                      <Text style={s.actionText}>View all</Text>
                    </TouchTarget>
                  </View>
                  <View style={s.list}>
                    {water.logs.slice(0, 3).map((log) => (
                      <View key={log.id} style={s.activity}>
                        <AppIcon name="check" size={18} />
                        <View style={s.flex}>
                          <Text style={s.rowTitle}>
                            {log.amountMl} ml water logged
                          </Text>
                          <Text style={s.caption}>
                            {formatTime(log.loggedAt)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  appBar: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  brand: { flex: 1, alignItems: 'center' },
  avatar: { width: 48, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  expandedContent: { maxWidth: 1100 },
  greeting: { gap: 6, paddingTop: 24, paddingBottom: 16 },
  date: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    lineHeight: 34,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
  },
  shortcuts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  shortcut: {
    flex: 1,
    minWidth: 52,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  largeShortcut: { flexBasis: '45%' },
  shortcutIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.subtle,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 28 },
  primaryColumn: { flex: 1.1, minWidth: 280 },
  secondaryColumn: { flex: 1, minWidth: 240 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 26,
    color: colors.ink,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 25,
    color: colors.ink,
  },
  waterHeader: { marginTop: 0, marginBottom: 0 },
  water: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.subtle,
    gap: 14,
  },
  waterAmount: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 31,
    color: colors.ink,
  },
  target: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  progress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  textAction: {
    minWidth: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 20,
    color: colors.primary,
  },
  connected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  flex: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 23,
    color: colors.ink,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    marginTop: 2,
  },
  list: { borderTopWidth: 1, borderColor: colors.border },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  taskIcon: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTime: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: colors.primary,
    marginTop: 6,
  },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  empty: { gap: 14, paddingVertical: 8 },
  feedback: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
    marginTop: 12,
    backgroundColor: colors.subtle,
    borderRadius: 12,
  },
  dismiss: { width: 48, justifyContent: 'center', alignItems: 'center' },
  error: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.accentSurface,
    gap: 12,
    marginTop: 16,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.error,
  },
  pressed: { backgroundColor: colors.subtle },
});
