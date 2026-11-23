import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useWellness } from '../personal-wellness/WellnessContext';
import { medicineSchedule } from '../personal-wellness/doseSchedule';
import { useTrackingClock } from '../personal-wellness/useTrackingClock';
import { useAuth } from '../authentication/context/AuthContext';
import { homeWater } from './homeModel';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';
import { fonts, typeStyles } from '../../theme/tokens';
import { formatClock, formatTime } from '../../shared/date-time';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { AppIcon } from '../../components/app/AppIcon';

export function HomeRoutines() {
  const wellness = useWellness(), { user } = useAuth(), c = usePalette(), { t, locale } = useTranslation(), router = useRouter(), now = useTrackingClock();
  const water = homeWater(wellness.data, now), target = wellness.data.waterPlan?.targetMl;
  const schedule = medicineSchedule(wellness.data, now);
  const completed = schedule.filter(row => row.record?.status === 'taken');
  const rows = [...completed.slice(-1), ...schedule.filter(row => !row.complete)].slice(0, 2);
  const [notice, setNotice] = useState('');
  const log = useRef<{ id: string; loggedAt: string } | null>(null), lock = useRef(false);
  async function addWater() {
    if (!user || !water) { router.push(user ? '/water' : '/login'); return; }
    if (wellness.busy || lock.current) return;
    lock.current = true; setNotice('');
    try {
      if (log.current && wellness.data.waterLogs.some(item => item.id === log.current?.id)) log.current = null;
      log.current ??= { id: randomUUID(), loggedAt: new Date().toISOString() };
      if (await wellness.save(`water/logs/${log.current.id}`, { amountMl: 250, loggedAt: log.current.loggedAt, taskId: null })) { log.current = null; setNotice('250 ml logged.'); }
    } finally { lock.current = false; }
  }
  return <View style={{ gap: 10 }}>
    <View style={[s.panel, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={s.line}><View style={[s.icon, { backgroundColor: c.secondarySurface }]}><AppIcon name="drop" color={c.secondary} size={22} /></View><TouchTarget accessibilityRole="button" accessibilityLabel={t('Open water tracker')} onPress={() => router.push('/water')} style={s.copy}><Text style={[typeStyles.title, { color: c.ink }]}>{t('Water Intake')}</Text><Text accessibilityLiveRegion="polite" style={[typeStyles.detail, { color: notice ? c.primary : c.muted }]}>{notice ? t(notice) : water?.next[0] ? `${t('Next reminder')}: ${formatTime(water.next[0].snoozedUntil ?? water.next[0].at)}` : t(user ? 'Your daily hydration' : 'Sign in to track your day')}</Text></TouchTarget><TouchTarget accessibilityRole="button" accessibilityLabel={t(water ? 'Log 250 ml of water' : 'Set a water target')} disabled={wellness.busy} onPress={() => void addWater()} style={[s.pill, { backgroundColor: c.secondarySurface }]}><Text style={[typeStyles.label, { color: c.secondary }]}>{water ? '+250 ml' : t('Set target')}</Text></TouchTarget></View>
      <View style={[s.line, { flexWrap: 'wrap', justifyContent: 'space-between' }]}><Text style={[s.value, { color: c.ink }]}>{water ? water.totalMl.toLocaleString(locale) : '—'}<Text style={[typeStyles.body, { color: c.muted }]}>{target ? ` / ${target.toLocaleString(locale)} ml` : ' ml'}</Text></Text><Text style={[typeStyles.label, { color: c.secondary }]}>{water ? `${Math.round(water.progress * 100)}%` : t('No target yet')}</Text></View>
      <View accessibilityRole="progressbar" accessibilityLabel={t('Water toward your daily target')} accessibilityValue={water && target ? { min: 0, max: target, now: Math.min(target, water.totalMl) } : undefined} style={[s.track, { backgroundColor: c.subtle }]}><View style={{ height: '100%', width: `${(water?.progress ?? 0) * 100}%`, backgroundColor: c.secondary, borderRadius: 4 }} /></View>
    </View>
    <View style={[s.panel, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={s.line}><View style={[s.icon, { backgroundColor: c.mintSurface }]}><AppIcon name="pill" color={c.primary} size={22} /></View><TouchTarget accessibilityRole="button" accessibilityLabel={t('Manage medicines')} onPress={() => router.push('/medicines')} style={s.copy}><Text style={[typeStyles.title, { color: c.ink }]}>{t('Rx Medicine Alert')}</Text><Text style={[typeStyles.detail, { color: c.primary }]}>{schedule.length ? `${completed.length} / ${schedule.length} ${t('doses logged today')}` : t('Keep your dose times together')}</Text></TouchTarget><Text style={[typeStyles.label, s.badge, { color: c.primary, backgroundColor: c.subtle }]}>{t('Today')}</Text></View>
      {rows.map(({ medicine, dose, record, day, complete }) => <View key={`${medicine.id}:${dose.time}`} style={[s.dose, { backgroundColor: complete ? c.subtle : c.errorSurface }]}><AppIcon name={complete ? 'check' : 'clock'} color={complete ? c.primary : c.error} size={18} /><View style={s.copy}><Text style={[typeStyles.body, { color: c.ink, fontFamily: fonts.medium }]}>{medicine.name}</Text><Text style={[typeStyles.detail, { color: c.muted }]}>{formatClock(dose.time)} · {complete ? t('Logged as taken') : dose.amount}</Text></View>{!complete && <TouchTarget accessibilityRole="button" accessibilityLabel={`${t('Log dose')}: ${medicine.name}, ${dose.time}`} disabled={wellness.busy} onPress={() => void wellness.save(`medicines/${medicine.id}/doses/${day}/${dose.time}`, { status: 'taken' })} style={[s.take, { backgroundColor: c.primary }]}><Text style={[typeStyles.label, { color: c.onPrimary }]}>{t('Take')}</Text></TouchTarget>}</View>)}
      {!rows.length && <TouchTarget accessibilityRole="button" accessibilityLabel={t('Add a medicine reminder')} onPress={() => router.push('/medicines')} style={[s.dose, { backgroundColor: c.subtle }]}><AppIcon name="clock" size={18} color={c.primary} /><Text style={[typeStyles.body, s.copy, { color: c.muted }]}>{t(user ? 'Add a medicine reminder' : 'Sign in to save your reminders')}</Text><AppIcon name="right" size={16} /></TouchTarget>}
    </View>
    {!!wellness.error && user && <Text accessibilityRole="alert" style={[typeStyles.detail, { color: c.error }]}>{t(wellness.error)}</Text>}
  </View>;
}
const s = StyleSheet.create({
  panel: { padding: 12, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, gap: 10 }, line: { flexDirection: 'row', alignItems: 'center', gap: 8 }, copy: { flex: 1, minWidth: 0, justifyContent: 'center' },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, pill: { paddingHorizontal: 10, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, badge: { borderRadius: 14, paddingHorizontal: 8, paddingVertical: 3 },
  value: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 30, fontVariant: ['tabular-nums'] }, track: { height: 8, borderRadius: 4, overflow: 'hidden' }, dose: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, minHeight: 54, borderRadius: 12 },
  take: { paddingHorizontal: 12, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
});
