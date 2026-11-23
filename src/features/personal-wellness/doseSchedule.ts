import { medicineDueOn } from './medicineRules.ts';
import { APP_TIMEZONE } from '../../shared/date-time.ts';
import { localDay, zonedInstant, type WellnessData } from './domain.ts';

export function medicineSchedule(data: WellnessData, now = new Date()) {
  const day = localDay(now);
  return (data.medicines ?? []).filter(m => medicineDueOn(m, day)).flatMap(medicine => medicine.doses.map(dose => {
    const record = data.medicineDoses?.find(item => item.medicineId === medicine.id && item.day === day && item.time === dose.time);
    const scheduledAt = zonedInstant(day, dose.time, APP_TIMEZONE).toISOString();
    const at = record?.snoozedUntil ?? scheduledAt;
    const complete = record?.status === 'taken' || record?.status === 'skipped';
    const canSnooze = !complete && medicine.enabled && Date.parse(scheduledAt) <= now.getTime()
      && (!record?.snoozedUntil || Date.parse(record.snoozedUntil) <= now.getTime())
      && localDay(new Date(now.getTime() + 15 * 60000)) === day;
    return { medicine, dose, day, record, at, complete, canSnooze };
  })).sort((a, b) => Number(a.complete) - Number(b.complete) || a.at.localeCompare(b.at) || a.medicine.name.localeCompare(b.medicine.name));
}
