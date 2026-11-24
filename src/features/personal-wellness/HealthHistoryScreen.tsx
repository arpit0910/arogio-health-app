import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { AppScreen } from '../../components/app/AppScreen';
import { DCard, DTabs, DText } from '../../components/app/DesignUI';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../localization/LanguageProvider';
import { formatClock } from '../../shared/date-time';
import { usePalette } from '../../theme/AppearanceProvider';
import { activityMetrics } from '../activity/model';
import { useWellness } from './WellnessContext';

const filters = ['All', 'Water', 'Activity', 'Medicines'] as const;
type Filter = typeof filters[number];
const pageSize = 14;

export function HealthHistoryScreen() {
  const { filter: requestedFilter } = useLocalSearchParams<{ filter?: string }>();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const colors = usePalette();
  const { data, ready, loading, error, refresh } = useWellness();
  const [selection, setSelection] = useState<Filter>();
  const [limit, setLimit] = useState(pageSize);
  const filter = selection ?? filters.find(item => item === requestedFilter) ?? 'All';
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });

  const water = new Map<string, number>();
  if (filter === 'All' || filter === 'Water') {
    for (const log of data.waterLogs) water.set(log.day, (water.get(log.day) ?? 0) + log.amountMl);
  }
  const activity = filter === 'All' || filter === 'Activity'
    ? (data.activityTracking?.days ?? []).filter(entry => Object.values(entry.values).some(value => value != null))
    : [];
  const doses = filter === 'All' || filter === 'Medicines'
    ? (data.medicineDoses ?? []).filter(dose => dose.status !== 'pending')
    : [];
  const names = new Map(data.medicines?.map(medicine => [medicine.id, medicine.name]));
  const days = [...new Set([...water.keys(), ...activity.map(entry => entry.day), ...doses.map(dose => dose.day)])].sort().reverse();

  return (
    <AppScreen back title={t('Health history')} refreshing={loading} onRefresh={() => void refresh()}>
      <View style={{ gap: 16 }}>
        <View style={{ padding: 20, borderRadius: 24, gap: 8, backgroundColor: colors.mintSurface }}>
          <DText kind="title">Your saved entries</DText>
          <DText>Review water logs, activity you entered, and recorded medicine doses by date.</DText>
        </View>
        <DTabs grid options={[...filters]} value={filter} onChange={value => {
          setSelection(filters.find(item => item === value));
          setLimit(pageSize);
        }} />
        {error && <DCard>
          <DText color={colors.error}>{error}</DText>
          <Button title={t('Retry')} variant="secondary" onPress={() => void refresh()} />
        </DCard>}
        {!ready && !error && <DText>Loading history…</DText>}
        {ready && !days.length && !error && <DCard>
          <DText kind="title">No entries yet</DText>
          <Button title={t('Open tracker')} variant="secondary" onPress={() => router.push(filter === 'Water' ? '/water' : filter === 'Medicines' ? '/medicines' : '/activity')} />
        </DCard>}
        {ready && data.medicineDoses === undefined && (filter === 'All' || filter === 'Medicines') &&
          <DText>Medicine history is unavailable with the current service version.</DText>}
        {days.slice(0, limit).map(day => {
          const values = activity.find(entry => entry.day === day)?.values;
          return (
            <DCard key={day}>
              <DText kind="title">{date.format(new Date(day + 'T12:00:00Z'))}</DText>
              {water.has(day) && <View>
                <DText kind="label">Water</DText>
                <DText>{number.format(water.get(day)!)} ml</DText>
              </View>}
              {values && <View>
                <DText kind="label">Your entered total</DText>
                {activityMetrics.map(metric => {
                  const value = values[metric.key];
                  return value == null ? null : <DText key={metric.key}>{t(metric.title)} · {number.format(value)} {t(metric.unit)}</DText>;
                })}
              </View>}
              {doses.filter(dose => dose.day === day).sort((a, b) => a.time.localeCompare(b.time)).map(dose => (
                <View key={dose.medicineId + ':' + dose.time}>
                  <DText kind="label">{names.get(dose.medicineId) ?? t('Medicine')}</DText>
                  <DText>{formatClock(dose.time)} · {t(dose.status === 'taken' ? 'Logged as taken' : 'Skipped')}</DText>
                </View>
              ))}
            </DCard>
          );
        })}
        {days.length > limit && <Button title={t('Show earlier entries')} variant="secondary" onPress={() => setLimit(limit + pageSize)} />}
      </View>
    </AppScreen>
  );
}
