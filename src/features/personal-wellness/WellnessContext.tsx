import { MedicineAlarmView } from './MedicineAlarmView';
import type { MedicineNotificationAction } from './medicineNotificationAction';
import { medicineActionQueue } from './medicineActionStorage';
import { medicineActionRequest } from './medicineNotificationAction';
import { ApiError } from '../../services/api/httpClient';
import { normalizeWellness, confirmActivityGoals, confirmMedicineDose } from './snapshot';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../authentication/context/AuthContext';
import { apiClient } from '../../services/api/client';
import { emptyWellness, type WellnessData } from './domain';
import { listenForReminder, syncNotifications, dismissMedicineNotification } from './notifications';
import { reminderPlan } from './reminderPlan';
type Value = { ready: boolean; data: WellnessData; loading: boolean; busy: boolean; error: string | null; notice: string | null; scheduledThrough: string | null; refresh: () => Promise<void>; save: (path: string, body?: unknown, method?: 'PUT' | 'DELETE') => Promise<boolean> };
const Context = createContext<Value | null>(null);
export function WellnessProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  return <WellnessSession key={user?.id ?? 'signed-out'} owner={user?.id ?? null}>{children}</WellnessSession>;
}
function WellnessSession({ children, owner }: PropsWithChildren<{ owner: string | null }>) {
  const router = useRouter();
  const active = useRef(owner);
  const [stored, setStored] = useState<{ owner: string | null; data: WellnessData }>({ owner: null, data: emptyWellness() });
  const data = stored.owner === owner ? stored.data : emptyWellness();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false), [busy, setBusy] = useState(false), lock = useRef(false);
  const [error, setError] = useState<string | null>(null), [notice, setNotice] = useState<string | null>(null);
  const [scheduledThrough, setScheduledThrough] = useState<string | null>(null);
  const [alarms, setAlarms] = useState<MedicineNotificationAction[]>([]);
  const [alarmSaving, setAlarmSaving] = useState(false);
  const alarmLock = useRef(false);
  const showAlarm = useCallback((item: MedicineNotificationAction) => {
    setError(null);
    setAlarms(items => items.some(prior => prior.id === item.id) ? items : [...items, item]);
  }, []);
  const revision = useRef(0);
  const refreshing = useRef(false);
  const refreshAgain = useRef(false);
  const refreshLatest = useRef<() => Promise<void>>(async () => {});
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!owner || active.current !== owner) return;
    if (lock.current || refreshing.current) { refreshAgain.current = true; return; }
    refreshAgain.current = false; refreshing.current = true; const request = ++revision.current; setLoading(true); setError(null);
    try {
      for (const action of await medicineActionQueue.list(owner)) {
        if (active.current !== owner) return;
        try {
          const next = normalizeWellness(await apiClient.request<WellnessData>(medicineActionRequest(action)));
          if (active.current !== owner) return;
          confirmMedicineDose(next, medicineActionRequest(action).path.replace('/wellness/', ''), medicineActionRequest(action).body);
          await medicineActionQueue.complete(owner, action.id);
          setStored({ owner, data: next });
          setActionMessage(action.action === 'medicine_take' ? 'Dose logged as taken.' : action.action === 'medicine_skip' ? 'Dose logged as skipped.' : `Reminder snoozed for ${action.snoozeMinutes ?? 15} minutes.`);
        } catch (e) {
          if (active.current !== owner) return;
          if (e instanceof ApiError && [400, 404, 409, 422].includes(e.status)) {
            await medicineActionQueue.complete(owner, action.id);
            setActionMessage(`Medicine action was not applied: ${e.message}`);
          } else {
            setActionMessage('Your medicine action is saved on this phone. Keep Arogio open while online to sync it. Snooze starts when it syncs.');
            throw e;
          }
        }
      }
      const next = normalizeWellness(await apiClient.request<WellnessData>({ path: '/wellness' })); if (active.current === owner && request === revision.current) setStored({ owner, data: next }); }
    catch (e) { if (active.current === owner) setError(e instanceof Error ? e.message : 'Unable to load tracking. Try again.'); }
    finally { refreshing.current = false; if (active.current === owner && request === revision.current) { setLoading(false); setReady(true); } if (refreshAgain.current && active.current === owner) setTimeout(() => void refreshLatest.current(), 0); }
  }, [owner]);
  useEffect(() => { refreshLatest.current = refresh; }, [refresh]);
  useEffect(() => { active.current = owner; void syncNotifications(null, []); const timer = setTimeout(() => void refresh(), 0); return () => { clearTimeout(timer); active.current = null; void syncNotifications(null, []); }; }, [owner, refresh]);
  useEffect(() => { const timer = setInterval(() => { if (AppState.currentState === 'active') void refresh(); }, 60000); return () => clearInterval(timer); }, [refresh]);
  useEffect(() => { const sub = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); }); return () => sub.remove(); }, [refresh]);
  useEffect(() => { if (owner) return listenForReminder(route => router.push(route), owner, () => { void refresh(); }, setError, showAlarm); }, [owner, router, refresh, showAlarm]);
  useEffect(() => {
    let alive = true; const reminders = owner && stored.owner === owner ? reminderPlan(stored.data) : [];
    void syncNotifications(owner, reminders).then(message => { if (alive) { setNotice(message); setScheduledThrough(message ? null : reminders.filter(r => r.route === '/water').at(-1)?.at ?? null); } }).catch(() => { if (alive) { setNotice('Reminders could not be scheduled. Reopen Arogio to retry.'); setScheduledThrough(null); } });
    return () => { alive = false; };
  }, [owner, stored]);
  const save: Value['save'] = async (path, body, method = 'PUT') => {
    if (lock.current || refreshing.current) { setError('Another change is being saved. Please try again in a moment.'); return false; }
    if (!owner || active.current !== owner) return false; lock.current = true; ++revision.current; setBusy(true); setError(null);
    try { const next = normalizeWellness(await apiClient.request<WellnessData>({ path: `/wellness/${path}`, method, body }));
      if (path === 'activity/goals') confirmActivityGoals(next, body); confirmMedicineDose(next, path, body); if (active.current !== owner) return false; setStored({ owner, data: next }); setReady(true); return true; }
    catch (e) { if (active.current === owner) setError(e instanceof Error ? e.message : 'Unable to save. Check your connection and retry.'); return false; }
    finally { lock.current = false; if (active.current === owner) { setBusy(false); setLoading(false); } if (refreshAgain.current && active.current === owner) void refresh(); }
  };
  const alarm = alarms[0];
  const alarmMedicine = alarm && stored.owner === owner ? data.medicines?.find(medicine => medicine.id === alarm.medicineId && medicine.doses.some(dose => dose.time === alarm.time) && !data.medicineDoses?.some(record => record.medicineId === alarm.medicineId && record.day === alarm.day && record.time === alarm.time && record.status !== 'pending')) : undefined;
  function dismissAlarm() {
    if (!alarm || alarmLock.current) return;
    setAlarms(items => items.filter(item => item.id !== alarm.id));
    void dismissMedicineNotification(`arogio-wellness:${owner}:medicine:${alarm.medicineId}:${alarm.day}:${alarm.time}`).catch(() => {});
  }
  async function submitAlarm(action: 'medicine_take' | 'medicine_snooze', snoozeMinutes?: number) {
    if (!alarm || !owner || !alarmMedicine || alarmLock.current) return;
    alarmLock.current = true; setAlarmSaving(true); setError(null);
    try {
      const item = { ...alarm, id: alarm.id.replace(/:medicine_take$/, `:${action}`), action, ...(action === 'medicine_snooze' ? { snoozeMinutes } : {}) };
      await medicineActionQueue.enqueue(item);
      if (active.current !== owner) return;
      setAlarms(items => items.filter(prior => prior.id !== alarm.id));
      setActionMessage('Saving your medicine action...');
      void dismissMedicineNotification(`arogio-wellness:${owner}:medicine:${alarm.medicineId}:${alarm.day}:${alarm.time}`).catch(() => {});
      void refresh();
    } catch { if (active.current === owner) setError('Your medicine action could not be saved on this phone. Please try again.'); }
    finally { alarmLock.current = false; if (active.current === owner) setAlarmSaving(false); }
  }
  return <Context.Provider value={{ ready, data, loading, busy, error, notice: [actionMessage, notice].filter(Boolean).join(' ') || null, scheduledThrough, refresh, save }}>{children}{!!alarm && <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={dismissAlarm} statusBarTranslucent navigationBarTranslucent><MedicineAlarmView key={alarm.id} medicine={alarmMedicine} day={alarm.day} time={alarm.time} loading={!ready || loading && stored.owner !== owner} busy={alarmSaving} error={error} remaining={alarms.length} onDismiss={dismissAlarm} onAction={(action, minutes) => void submitAlarm(action, minutes)} /></Modal>}</Context.Provider>;
}
export function useWellness() { const value = useContext(Context); if (!value) throw new Error('WellnessProvider is missing.'); return value; }
