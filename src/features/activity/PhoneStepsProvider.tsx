import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../auth/context/AuthContext';
import { useHealthSync } from '../health-sync/HealthSyncProvider';
import { addDays, localDay, validDay } from '../wellness/domain';
import { phoneSensorState, watchPhoneSteps } from './stepSensor';
import { stepDelta } from './model';
type Stored = { enabled: boolean; totals: Record<string, number> };
type State = Stored & { status: string; busy: boolean; ready: boolean; toggle: () => Promise<void>; clear: () => Promise<void> };
const Context = createContext<State | null>(null);
export function PhoneStepsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  return <PhoneSession key={user?.id ?? 'none'} owner={user?.id ? String(user.id) : null}>{children}</PhoneSession>;
}
function PhoneSession({ children, owner }: PropsWithChildren<{ owner: string | null }>) {
  const health = useHealthSync();
  const [stored, setStored] = useState<Stored>({ enabled: false, totals: {} });
  const [ready, setReady] = useState(false), [busy, setBusy] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [status, setStatus] = useState('Phone step counting is off.');
  const value = useRef(stored), alive = useRef(true), queue = useRef(Promise.resolve()), lock = useRef(false);
  const key = `arogio.phone-steps.${owner?.replace(/[^a-zA-Z0-9._-]/g, '_') ?? 'none'}`;
  const dirty = useRef(false);
  function apply(next: Stored, changed = true) { if (changed) dirty.current = true; value.current = next; if (alive.current) setStored(next); }
  function persist() {
    if (!owner || Platform.OS === 'web' || !hydrated.current || !dirty.current) return Promise.resolve();
    const encoded = JSON.stringify(value.current);
    const next = queue.current.catch(() => {}).then(async () => { await SecureStore.setItemAsync(key, encoded); if (JSON.stringify(value.current) === encoded) dirty.current = false; });
    queue.current = next;
    return next;
  }
  const hydrated = useRef(false);
  const persistRef = useRef(persist);
  useEffect(() => { persistRef.current = persist; });
  useEffect(() => {
    alive.current = true;
    void (async () => {
      try {
        const saved = owner && Platform.OS !== 'web' ? await SecureStore.getItemAsync(key) : null;
        if (!alive.current) return;
        if (saved) {
          const parsed = JSON.parse(saved) as Stored;
          const cutoff = addDays(localDay(), -29);
          const totals = Object.fromEntries(Object.entries(parsed.totals ?? {}).filter(([day, count]) => validDay(day) && day >= cutoff && day <= localDay() && Number.isInteger(count) && count >= 0));
          apply({ enabled: parsed.enabled === true, totals }, false);
        }
      } catch { if (alive.current) setStatus('Phone step preferences could not be restored. You can still enter activity totals.'); }
      finally { if (alive.current) { hydrated.current = true; setReady(true); } }
    })();
    const listener = AppState.addEventListener('change', (state) => {
      setActive(state === 'active');
      if (state !== 'active') void persistRef.current().catch(() => {});
    });
    const timer = setInterval(() => { if (value.current.enabled) void persistRef.current().catch(() => { if (alive.current) setStatus('Phone counts could not be saved. Keep the app open and try again.'); }); }, 10000);
    return () => { alive.current = false; listener.remove(); clearInterval(timer); void persistRef.current().catch(() => {}); };
  }, [owner, key]);
  useEffect(() => {
    let valid = true;
    let subscription: { remove: () => void } | undefined;
    let previous = 0;
    if (!ready || !stored.enabled || !owner) return;
    if (health.connected) return;
    if (!active) return;
    void (async () => {
      try {
        const sensor = await phoneSensorState();
        if (!valid) return;
        if (!sensor.available || !sensor.granted) { setStatus(sensor.available ? 'Motion permission is off. Enable phone counting to allow access.' : 'No step sensor is available. You can enter daily totals instead.'); return; }
        setStatus('Counting steps while Arogio is open. Background steps are not included.');
        subscription = await watchPhoneSteps((count) => {
          if (!valid || !alive.current || AppState.currentState !== 'active' || !value.current.enabled) return;
          const update = stepDelta(previous, count); previous = update.previous;
          if (!update.delta) return;
          const today = localDay(), cutoff = addDays(today, -29);
          const totals = Object.fromEntries(Object.entries(value.current.totals).filter(([date]) => date >= cutoff));
          totals[today] = (totals[today] ?? 0) + update.delta;
          apply({ ...value.current, totals });
        });
        if (!valid) subscription.remove();
        else {
          const day = localDay();
          if (value.current.totals[day] == null) apply({ ...value.current, totals: { ...value.current.totals, [day]: 0 } });
        }
      } catch { if (valid) setStatus('Phone counting is unavailable. Install the latest app build or enter daily totals.'); }
    })();
    return () => { valid = false; subscription?.remove(); };
  }, [ready, stored.enabled, active, health.connected, owner]);
  async function toggle() {
    if (lock.current || !owner || !ready) return;
    lock.current = true; setBusy(true);
    try {
      if (value.current.enabled) { apply({ ...value.current, enabled: false }); await persist(); if (alive.current) setStatus('Phone counting is off. Entered step totals are used.'); return; }
      const sensor = await phoneSensorState(true);
      if (!alive.current) return;
      if (!sensor.available || !sensor.granted) { setStatus(sensor.available ? 'Motion access was declined. You can allow it in device settings or enter totals.' : 'No step sensor is available on this device.'); return; }
      apply({ ...value.current, enabled: true }); await persist();
    } catch { apply({ ...value.current, enabled: false }); if (alive.current) setStatus('Phone step preferences could not be saved. Counting is off for now. Manage motion access in device settings to keep it off after restart.'); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  async function clear() { if (!ready) throw new Error('Phone history is still loading.'); apply({ enabled: false, totals: {} }); await persist(); if (alive.current) setStatus('Phone step history cleared.'); }
  return <Context.Provider value={{ ...stored, ready, status: !ready ? 'Checking phone step preferences...' : stored.enabled && health.connected ? 'Phone counting is paused while a health app is connected.' : status, busy, toggle, clear }}>{children}</Context.Provider>;
}
export function usePhoneSteps() { const state = useContext(Context); if (!state) throw new Error('PhoneStepsProvider is missing.'); return state; }
