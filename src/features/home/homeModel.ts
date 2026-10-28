import { waterDay, waterSchedule, waterWindow, type WellnessData } from '../wellness/domain.ts';

/** Home exposes hydration activity only; cycle details stay inside the tracker. */
export function homeWater(data: WellnessData, now: Date) {
  const plan = data.waterPlan;
  if (!plan) return null;
  const day = waterDay(plan, now);
  const logs = data.waterLogs.filter(log => log.day === day).sort((a,b) => b.loggedAt.localeCompare(a.loggedAt));
  const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);
  const tasks = waterSchedule(plan, day, data.waterLogs, data.waterTasks, now);
  const next = tasks.filter(task => task.status === 'pending').sort((a,b) => (a.snoozedUntil ?? a.at).localeCompare(b.snoozedUntil ?? b.at)).slice(0,2);
  const { start, end } = waterWindow(plan, day);
  return { day, totalMl, logs, next, complete: totalMl >= plan.targetMl,
    progress: Math.min(1, totalMl / plan.targetMl), completedTasks: tasks.filter(task => task.status === 'done').length,
    taskCount: tasks.length, paused: Boolean(plan.pausedUntil && Date.parse(plan.pausedUntil) > now.getTime()),
    beforeWake: now < start, afterBed: now >= end };
}
