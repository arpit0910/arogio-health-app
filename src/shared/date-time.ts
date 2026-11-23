/** All user-facing clocks and daily boundaries use Indian Standard Time. */
export const APP_TIMEZONE = 'Asia/Kolkata';
export const TIMEZONE_LABEL = 'IST';

export function formatTime(value: string | Date): string {
  return `${new Intl.DateTimeFormat('en-US', { timeZone: APP_TIMEZONE, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(value))} IST`;
}

/** API clock values remain HH:mm; the interface always includes AM/PM. */
export function formatClock(value: string): string {
  const [hour, minute] = value.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'} IST`;
}

export function formatDateTime(value: string | Date): string {
  const date = new Date(value);
  return `${new Intl.DateTimeFormat('en-IN', { timeZone: APP_TIMEZONE, day: 'numeric', month: 'short', year: 'numeric' }).format(date)}, ${formatTime(date)}`;
}

export function clockFrom12Hour(hour: string, minute: string, period: 'AM' | 'PM'): string | null {
  if (!/^\d{1,2}$/.test(hour) || !/^\d{1,2}$/.test(minute) || +hour < 1 || +hour > 12 || +minute > 59) return null;
  return `${String((+hour % 12) + (period === 'PM' ? 12 : 0)).padStart(2, '0')}:${minute.padStart(2, '0')}`;
}
