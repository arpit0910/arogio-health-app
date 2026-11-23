import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
/** Refresh day boundaries and schedules after returning to the app. */
export function useTrackingClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    const listener = AppState.addEventListener('change', (state) => { if (state === 'active') setNow(new Date()); });
    return () => { clearInterval(timer); listener.remove(); };
  }, []);
  return now;
}
