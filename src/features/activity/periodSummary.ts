import { addDays, type WellnessData } from '../personal-wellness/domain.ts';
import { medicineDueOn } from '../personal-wellness/medicineRules.ts';
export function activityPeriodDays(today: string, period: string) {
  const count = period === 'Day' ? 1 : period === 'Week' ? 7 : 30;
  return Array.from({ length: count }, (_, i) => addDays(today, i - count + 1));
}
export function adherenceForDay(data: WellnessData, day: string) {
  const planned = (data.medicines ?? []).filter(m => medicineDueOn(m, day)).flatMap(m => m.doses.map(d => ({ id: m.id, time: d.time })));
  const taken = planned.filter(d => data.medicineDoses?.some(r => r.medicineId === d.id && r.time === d.time && r.day === day && r.status === 'taken')).length;
  return { day, planned: planned.length, taken };
}
