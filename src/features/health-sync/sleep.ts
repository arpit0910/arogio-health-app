/** Assign complete sleep to wake-up day and merge overlaps before aggregation. */
export function sleepIntervals(sessions: { startTime: string; endTime: string }[], start: string, end: string) {
  const intervals = sessions.map(s => ({ start: Date.parse(s.startTime), end: Date.parse(s.endTime) }))
    .filter(s => Number.isFinite(s.start) && Number.isFinite(s.end) && s.start < s.end && s.end >= Date.parse(start) && s.end < Date.parse(end))
    .sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const interval of intervals) {
    const last = merged.at(-1);
    if (last && interval.start <= last.end) last.end = Math.max(last.end, interval.end);
    else merged.push({ ...interval });
  }
  return merged.map(s => ({ startTime: new Date(s.start).toISOString(), endTime: new Date(s.end).toISOString() }));
}
