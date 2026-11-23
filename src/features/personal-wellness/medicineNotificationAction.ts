export const MEDICINE_CATEGORY = 'arogio_medicine_actions_v1';
export const medicineActions = [
  { identifier: 'medicine_snooze', buttonTitle: 'Snooze (15 min)' },
  { identifier: 'medicine_skip', buttonTitle: 'Skip' },
  { identifier: 'medicine_take', buttonTitle: 'Take' },
] as const;
export type MedicineNotificationDose = { medicineId: string; day: string; time: string };
export type MedicineNotificationAction = MedicineNotificationDose & {
  id: string; owner: string; snoozeMinutes?: number; action: 'medicine_snooze' | 'medicine_skip' | 'medicine_take';
};
export function readMedicineAction(owner: string, identifier: string, deliveredAt: number, action: string, data: Record<string, unknown>): MedicineNotificationAction | null {
  if (data.owner !== owner || data.wellness !== true || data.route !== '/medicines' || !medicineActions.some(item => item.identifier === action)) return null;
  if (typeof data.medicineId !== 'string' || !/^[a-f\d-]{36}$/i.test(data.medicineId) || typeof data.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.day) || typeof data.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time) || !Number.isFinite(deliveredAt)) return null;
  if (identifier !== `arogio-wellness:${owner}:medicine:${data.medicineId}:${data.day}:${data.time}`) return null;
  return { id: `${identifier}:${deliveredAt}:${action}`, owner, medicineId: data.medicineId, day: data.day, time: data.time, action: action as MedicineNotificationAction['action'] };
}
export function medicineActionRequest(item: MedicineNotificationAction) {
  return { path: `/wellness/medicines/${item.medicineId}/doses/${item.day}/${item.time}`, method: 'PUT' as const,
    body: item.action === 'medicine_snooze' ? { status: 'pending', snooze: true, ...(item.snoozeMinutes === undefined ? {} : { snoozeMinutes: item.snoozeMinutes }) } : { status: item.action === 'medicine_take' ? 'taken' : 'skipped' } };
}
