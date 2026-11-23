import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useWellness } from './WellnessContext';
import { medicineSchedule } from './doseSchedule';
import { useTrackingClock } from './useTrackingClock';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';
import { useCareStyles } from '../../components/app/CareUI';
import { AppIcon } from '../../components/app/AppIcon';
import { Button } from '../../components/ui/Button';
import { formatClock, formatTime } from '../../shared/date-time';
import { requestReminderPermission } from './notifications';

export function MedicineSchedule({ limit = 4, showManage = true }: { limit?: number; showManage?: boolean }) {
  const { data, save, busy, ready, loading, error, notice } = useWellness(), now = useTrackingClock();
  const rows = medicineSchedule(data, now), colors = usePalette(), c = useCareStyles(), { t } = useTranslation(), router = useRouter();
  const supported = Array.isArray(data.medicineDoses);
  const [visible, setVisible] = useState(limit);
  const [snoozeError, setSnoozeError] = useState(''), [checking, setChecking] = useState(false);
  async function snooze(path: string) {
    if (busy || checking) return;
    setChecking(true); setSnoozeError('');
    try {
      if (!await requestReminderPermission(false)) {
        setSnoozeError('Notifications are off or unavailable. Enable them in device settings to snooze a reminder.');
        return;
      }
      await save(path, { status: 'pending', snooze: true });
    } catch { setSnoozeError('Notification access could not be checked. Please try again.'); }
    finally { setChecking(false); }
  }
  return <View style={{ padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><AppIcon name="pill" size={24} color={colors.primary} /><Text accessibilityRole="header" style={[c.title, { flex: 1 }]}>{t('My medicine schedule')}</Text></View>
    <Text style={c.text}>{t('Your prescribed times, kept together. All times use IST.')}</Text>
    {loading && !ready ? <Text style={c.text}>{t('Loading your schedule…')}</Text> : !rows.length && <Text style={c.text}>{t('Add your medicine and dose times to start a reminder schedule.')}</Text>}
    {rows.slice(0, visible).map(({ medicine, dose, day, record, complete, canSnooze }) => <View key={`${medicine.id}:${dose.time}`} style={{ padding: 14, borderRadius: 12, backgroundColor: complete ? colors.background : colors.subtle, gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}><AppIcon name={record?.status === 'taken' ? 'check' : 'clock'} color={colors.primary} size={20} /><View style={{ flex: 1, minWidth: 0, gap: 4 }}><Text style={[c.text, { color: colors.ink }]}>{medicine.name} · {dose.amount}</Text><Text style={c.text}>{formatClock(dose.time)}{record?.snoozedUntil ? ` · ${t('Snoozed until')} ${formatTime(record.snoozedUntil)}` : ''}{complete ? ` · ${t(record?.status === 'taken' ? 'Logged as taken' : 'Skipped')}` : ''}</Text>{!!medicine.notes && <Text style={c.text}>{medicine.notes}</Text>}</View></View>
      {supported && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {complete ? <Button title={t('Undo log')} variant="secondary" disabled={busy} onPress={() => void save(`medicines/${medicine.id}/doses/${day}/${dose.time}`, { status: 'pending' })} /> : <><View style={{ flex: 1, minWidth: 100 }}><Button title={t('Log dose')} disabled={busy} onPress={() => void save(`medicines/${medicine.id}/doses/${day}/${dose.time}`, { status: 'taken' })} /></View><View style={{ flex: 1, minWidth: 120 }}><Button title={t('Snooze 15 min')} variant="secondary" disabled={busy || checking || !canSnooze} onPress={() => void snooze(`medicines/${medicine.id}/doses/${day}/${dose.time}`)} /></View></>}
      </View>}
    </View>)}
    {!!rows.length && !supported && <Text style={c.text}>{t('Dose logging needs the latest service update. Your reminder schedule is still available.')}</Text>}
    {!!rows.length && supported && <Text style={c.text}>{t('Snooze is available when a dose is due and reminders are enabled.')}</Text>}
    {!showManage && rows.length > visible && <Button title={t('Show more doses')} variant="secondary" onPress={() => setVisible(value => value + limit)} />}
    {!!notice && <Text accessibilityRole="alert" style={c.text}>{t(notice)}</Text>}
    {!!error && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{t(error)}</Text>}
    {!!snoozeError && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{t(snoozeError)}</Text>}
    {showManage && <Button title={t('Manage medicines')} variant="secondary" onPress={() => router.push('/medicines')} />}
  </View>;
}
