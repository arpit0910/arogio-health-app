import { localDay } from "../personal-wellness/domain.ts";
import {
  formatHealthValue,
  healthMetrics,
  hasHealthValue,
  type HealthMetric,
  type HealthSnapshot,
} from "./model.ts";
export function healthSummary(
  snapshot: HealthSnapshot,
  metric: HealthMetric,
  today = localDay(),
) {
  const readings = snapshot.days.flatMap((day) => {
    const value = day.readings[metric]?.value;
    return !hasHealthValue(value) || day.day > today
      ? []
      : [{ day: day.day, value }];
  }).sort((a, b) => a.day.localeCompare(b.day));
  const completed = readings.filter((reading) => reading.day < today);
  const last = completed.at(-1),
    prior = completed.at(-2);
  return {
    recorded: readings.length,
    completed: completed.length,
    average: completed.length
      ? completed.reduce((sum, reading) => sum + reading.value, 0) /
        completed.length
      : null,
    highest: completed.length
      ? completed.reduce((best, reading) =>
          reading.value > best.value ? reading : best,
        )
      : null,
    comparison:
      last && prior
        ? {
            day: last.day,
            previousDay: prior.day,
            difference: last.value - prior.value,
            percent:
              prior.value === 0
                ? null
                : ((last.value - prior.value) / prior.value) * 100,
          }
        : null,
  };
}
/** Targets apply only to activity measures, never food or body measurements. */
export function progressInsights(snapshot: HealthSnapshot, metric: HealthMetric, goal: number | undefined, today = localDay()) {
  const summary = healthSummary(snapshot, metric, today);
  const supportsGoal = ['Steps', 'Distance', 'ExerciseSession', 'SleepSession', 'ActiveCaloriesBurned', 'Hydration'].includes(metric);
  const target = supportsGoal && goal != null && Number.isFinite(goal) && goal > 0 ? goal : null;
  const completed = snapshot.days.filter(day => day.day < today && hasHealthValue(day.readings[metric]?.value));
  const current = snapshot.days.find(day => day.day === today)?.readings[metric]?.value;
  const latestDay = snapshot.days.filter(day => day.day <= today && hasHealthValue(day.readings[metric]?.value)).map(day => day.day).sort().at(-1);
  return { ...summary, unit: metric === 'SleepSession' ? '' : healthMetrics.find(item => item.key === metric)!.unit,
    latestDay, goalDays: target != null && completed.length ? completed.filter(day => day.readings[metric]!.value! >= target).length : null,
    remaining: target != null && hasHealthValue(current) ? Math.max(0, target - current) : null };
}
export function comparisonCopy(
  snapshot: HealthSnapshot,
  metric: HealthMetric,
  today = localDay(),
): string {
  const comparison = healthSummary(snapshot, metric, today).comparison;
  if (!comparison)
    return "Two completed days with readings are needed for a comparison. Missing days are excluded.";
  const date = (day: string) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(day + "T12:00:00Z"));
  if (!comparison.difference)
    return `${date(comparison.day)} matched ${date(comparison.previousDay)}. Today is excluded while it is in progress.`;
  return `${date(comparison.day)} was ${formatHealthValue(metric, Math.abs(comparison.difference))} ${comparison.difference > 0 ? "higher" : "lower"} than ${date(comparison.previousDay)}. Today is excluded while it is in progress.`;
}
