import { healthMetrics, hasHealthValue, type HealthMetric, type HealthSnapshot } from './model.ts';
import { appHealthMetrics, type HealthApp } from './connection.ts';

export function readingDiagnostics(app: HealthApp, selected: HealthMetric[], snapshot: HealthSnapshot | null) {
  const supported = appHealthMetrics(app);
  const sameSource = snapshot?.source === app.id;
  return healthMetrics.filter(metric => supported.includes(metric.key)).map(metric => {
    const day = sameSource && selected.includes(metric.key) && snapshot.granted.includes(metric.key) ? snapshot.days.filter(day => hasHealthValue(day.readings[metric.key]?.value)).at(-1) : null;
    const status = !selected.includes(metric.key) ? 'Not selected' : !sameSource ? 'Not checked yet' :
      !snapshot.granted.includes(metric.key) ? 'Read access off' : snapshot.failed.includes(metric.key) ? 'Refresh failed' :
      snapshot.days.some(day => hasHealthValue(day.readings[metric.key]?.value)) || (metric.key === 'Weight' && snapshot.latestWeight != null) ? 'Receiving records' : 'No shared records in the last 30 days';
    return { ...metric, status, latest: day ? { day: day.day, value: day.readings[metric.key]!.value } : null };
  });
}
