import { medicineDueOn } from './medicineRules.ts';
import { APP_TIMEZONE } from '../../shared/date-time.ts';
import { addDays, cycleForecast, localDay, waterDay, waterSchedule, zonedInstant, type WellnessData } from './domain.ts';
export type Reminder = { dose?: { medicineId: string; day: string; time: string }; id: string; at: string; title: string; body: string; route: '/water' | '/cycle' | '/medicines'; alertType?: 'default' | 'gentle' | 'vibrate' };
export function reminderPlan(data: WellnessData, now = new Date()): Reminder[] {
  const reminders: Reminder[] = [], plan = data.waterPlan;
  if (plan?.remindersEnabled) {
    for (let offset = 0; offset < 8; offset++) {
      const day = addDays(waterDay(plan, now), offset);
      for (const task of waterSchedule(plan, day, data.waterLogs, data.waterTasks, now)) {
        const at = task.snoozedUntil ?? task.at;
        if (task.status !== 'done' && task.status !== 'skipped' && Date.parse(at) > now.getTime() + 5000 && (!plan.pausedUntil || Date.parse(at) > Date.parse(plan.pausedUntil))) reminders.push({ id: `water:${task.id}`, at, title: 'A moment for water', body: `Your ${task.remainingMl} ml drinking task is ready. Open Arogio to log it.`, route: '/water' });
      }
    }
  }
  const settings = data.cycleSettings;
  if (settings?.remindersEnabled) {
    const today = localDay(now, APP_TIMEZONE), forecast = cycleForecast(data.periods, settings, today);
    if (forecast && !data.periods.some(p => p.endDate === null)) {
      const at = zonedInstant(addDays(forecast.expected, -settings.reminderDaysBefore), settings.reminderTime, APP_TIMEZONE).toISOString();
      if (Date.parse(at) > now.getTime() + 5000) reminders.push({ id: `cycle:${forecast.expected}`, at, title: settings.discreet ? 'A moment for yourself' : 'Cycle check-in', body: settings.discreet ? 'Your private check-in is ready in Arogio.' : 'Your next period may be approaching. Open your tracker for the estimate.', route: '/cycle' });
    }
  }
  for (const medicine of data.medicines ?? []) {
    if (!medicine.enabled || (medicine.endDate && medicine.endDate < localDay(now))) continue;
    if (medicine.stock != null && medicine.stock <= (medicine.lowStockThreshold ?? 4)) {
      const today = localDay(now), next = zonedInstant(today, '09:00', APP_TIMEZONE);
      const day = next.getTime() > now.getTime() + 5000 ? today : addDays(today, 1);
      reminders.push({ id: `refill:${medicine.id}:${day}`, at: zonedInstant(day, '09:00', APP_TIMEZONE).toISOString(), title: 'Medicine stock is low', body: `${medicine.name}: ${medicine.stock} dose units remaining. Arrange a refill.`, route: '/medicines', alertType: medicine.alertType });
    }
    for (let offset = 0; offset < 8; offset++) {
      const day = addDays(localDay(now), offset);
      if (!medicineDueOn(medicine, day)) continue;
      for (const dose of medicine.doses) {
        const record = data.medicineDoses?.find(item => item.medicineId === medicine.id && item.day === day && item.time === dose.time);
        if (record?.status === 'taken' || record?.status === 'skipped') continue;
        const at = record?.snoozedUntil ?? zonedInstant(day, dose.time, APP_TIMEZONE).toISOString();
        if (Date.parse(at) > now.getTime() + 5000) reminders.push({ id: `medicine:${medicine.id}:${day}:${dose.time}`, at, dose: { medicineId: medicine.id, day, time: dose.time }, alertType: medicine.alertType, title: 'Time to take medication', body: `${medicine.name} (${dose.amount})${dose.meal && dose.meal !== 'any' ? ` / ${dose.meal} food` : ''}${medicine.notes ? ` / ${medicine.notes}` : ''}`, route: '/medicines' });
      }
    }
  }
  // Keep the nearest reminders across every feature within the native pending limit.
  return reminders.sort((a,b) => a.at.localeCompare(b.at)).slice(0, 60);
}
