import {
  localDay,
  zonedInstant,
  waterDay,
  waterSchedule,
  waterWindow,
  type WellnessData,
} from '../wellness/domain.ts';

/** Hydration follows the waking day; cycle details stay inside the tracker. */
export function homeWater(data: WellnessData, now: Date) {
  const plan = data.waterPlan;
  if (!plan) return null;
  const day = waterDay(plan, now);
  const logs = data.waterLogs
    .filter((log) => log.day === day)
    .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
  const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);
  const tasks = waterSchedule(plan, day, data.waterLogs, data.waterTasks, now);
  const next = tasks
    .filter((task) => task.status === 'pending')
    .sort((a, b) =>
      (a.snoozedUntil ?? a.at).localeCompare(b.snoozedUntil ?? b.at),
    )
    .slice(0, 2);
  const { start, end } = waterWindow(plan, day);
  return {
    day,
    totalMl,
    logs,
    next,
    complete: totalMl >= plan.targetMl,
    progress: Math.min(1, totalMl / plan.targetMl),
    completedTasks: tasks.filter((task) => task.status === 'done').length,
    taskCount: tasks.length,
    paused: Boolean(
      plan.pausedUntil && Date.parse(plan.pausedUntil) > now.getTime(),
    ),
    beforeWake: now < start,
    afterBed: now >= end,
  };
}

export type UpcomingCare = {
  id: string;
  at: string;
  title: string;
  detail: string;
  icon: 'drop' | 'pill';
  route: '/water' | '/medicines';
};
/** Upcoming schedule times are not an adherence log; never claim a dose was missed. */
export function homeUpcoming(data: WellnessData, now: Date): UpcomingCare[] {
  const water = homeWater(data, now);
  const items: UpcomingCare[] =
    water?.next.map((task) => ({
      id: `water:${task.id}`,
      at: task.snoozedUntil ?? task.at,
      title: `Drink ${task.remainingMl} ml`,
      detail: water.paused ? 'Water reminders paused' : 'Water plan',
      icon: 'drop',
      route: '/water',
    })) ?? [];
  const day = localDay(now);
  for (const medicine of data.medicines ?? [])
    for (const dose of medicine.doses) {
      const at = zonedInstant(day, dose.time, 'Asia/Kolkata').toISOString();
      if (Date.parse(at) >= now.getTime())
        items.push({
          id: `medicine:${medicine.id}:${dose.time}`,
          at,
          title: medicine.name,
          detail: `${dose.amount}${medicine.enabled ? '' : ' / Reminders off'}`,
          icon: 'pill',
          route: '/medicines',
        });
    }
  return items
    .sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id))
    .slice(0, 3);
}
