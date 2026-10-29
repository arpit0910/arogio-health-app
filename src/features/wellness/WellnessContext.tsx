import { APP_TIMEZONE } from '../../lib/time';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../auth/context/AuthContext';
import { apiClient } from '../../services/api/client';
import { emptyWellness, type WellnessData } from './domain';
import { listenForReminder, syncNotifications } from './notifications';
import { reminderPlan } from './reminderPlan';
type Value = { data: WellnessData; loading: boolean; busy: boolean; error: string | null; notice: string | null; scheduledThrough: string | null; refresh: () => Promise<void>; save: (path: string, body?: unknown, method?: 'PUT' | 'DELETE') => Promise<boolean> };
const Context = createContext<Value | null>(null);
export function WellnessProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  return <WellnessSession key={user?.id ?? 'signed-out'} owner={user?.id ?? null}>{children}</WellnessSession>;
}
function WellnessSession({ children, owner }: PropsWithChildren<{ owner: string | null }>) {
  const active = useRef(owner);
  const [stored, setStored] = useState<{ owner: string | null; data: WellnessData }>({ owner: null, data: emptyWellness() });
  const data = stored.owner === owner ? stored.data : emptyWellness();
  const [loading, setLoading] = useState(false), [busy, setBusy] = useState(false), lock = useRef(false);
  const [error, setError] = useState<string | null>(null), [notice, setNotice] = useState<string | null>(null);
  const [scheduledThrough, setScheduledThrough] = useState<string | null>(null);
  const revision = useRef(0);
  const refresh = useCallback(async () => {
    if (!owner || active.current !== owner || lock.current) return; const request = ++revision.current; setLoading(true); setError(null);
    try { const next = await apiClient.request<WellnessData>({ path: '/wellness' }); if (active.current === owner && request === revision.current) setStored({ owner, data: { ...next, waterPlan: next.waterPlan ? { ...next.waterPlan, timezone: APP_TIMEZONE } : null, cycleSettings: next.cycleSettings ? { ...next.cycleSettings, timezone: APP_TIMEZONE } : null } }); }
    catch (e) { if (active.current === owner) setError(e instanceof Error ? e.message : 'Unable to load tracking. Try again.'); }
    finally { if (active.current === owner) setLoading(false); }
  }, [owner]);
  useEffect(() => { active.current = owner; void syncNotifications(null, []); const timer = setTimeout(() => void refresh(), 0); return () => { clearTimeout(timer); active.current = null; void syncNotifications(null, []); }; }, [owner, refresh]);
  useEffect(() => { const sub = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); }); return () => sub.remove(); }, [refresh]);
  useEffect(() => { if (owner) return listenForReminder(route => router.push(route)); }, [owner]);
  useEffect(() => {
    let alive = true; const reminders = owner && stored.owner === owner ? reminderPlan(stored.data) : [];
    void syncNotifications(owner, reminders).then(message => { if (alive) { setNotice(message); setScheduledThrough(message ? null : reminders.filter(r => r.route === '/water').at(-1)?.at ?? null); } }).catch(() => { if (alive) { setNotice('Reminders could not be scheduled. Reopen Arogio to retry.'); setScheduledThrough(null); } });
    return () => { alive = false; };
  }, [owner, stored]);
  const save: Value['save'] = async (path, body, method = 'PUT') => {
    if (lock.current || !owner || active.current !== owner) return false; lock.current = true; ++revision.current; setBusy(true); setError(null);
    try { const next = await apiClient.request<WellnessData>({ path: `/wellness/${path}`, method, body }); if (active.current !== owner) return false; setStored({ owner, data: { ...next, waterPlan: next.waterPlan ? { ...next.waterPlan, timezone: APP_TIMEZONE } : null, cycleSettings: next.cycleSettings ? { ...next.cycleSettings, timezone: APP_TIMEZONE } : null } }); return true; }
    catch (e) { if (active.current === owner) setError(e instanceof Error ? e.message : 'Unable to save. Check your connection and retry.'); return false; }
    finally { lock.current = false; if (active.current === owner) setBusy(false); }
  };
  return <Context.Provider value={{ data, loading, busy, error, notice, scheduledThrough, refresh, save }}>{children}</Context.Provider>;
}
export function useWellness() { const value = useContext(Context); if (!value) throw new Error('WellnessProvider is missing.'); return value; }
