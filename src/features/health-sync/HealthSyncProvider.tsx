import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../auth/context/AuthContext';
import { connectHealth, backgroundHealthGranted, requestBackgroundHealth, grantedHealth, healthAvailability, syncHealth } from './healthConnect';
import { installedHealthApps } from './healthApps';
import { cachedBackgroundHealth, startBackgroundHealth, stopBackgroundHealth } from './backgroundHealth';
import { restoreHealthPreference, connectableHealthApps, isHealthApp, type HealthApp, type HealthPreference } from './connection';
import type { HealthAvailability, HealthMetric, HealthSnapshot } from './model';

export const HEALTH_REFRESH_MS = 30 * 1000;
type HealthState = {
  availability: HealthAvailability | null;
  connected: boolean;
  hasConnected: boolean;
  source: HealthApp | null;
  selectedMetrics: HealthMetric[];
  apps: HealthApp[];
  appsLoading: boolean;
  appsError: string;
  refreshApps: () => Promise<HealthApp[]>;
  connectSource: (app: HealthApp, selected: HealthMetric[]) => Promise<boolean>;
  busy: boolean;
  ready: boolean;
  background: boolean;
  enableBackground: () => Promise<void>;
  disableBackground: () => Promise<void>;
  error: string;
  snapshot: HealthSnapshot | null;
  run: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkAvailability: () => Promise<void>;
};
const HealthContext = createContext<HealthState | null>(null);
export function HealthSyncProvider({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuth();
  useEffect(() => { if (!isLoading && !user) void stopBackgroundHealth().catch(() => {}); }, [user, isLoading]);
  return <HealthSession key={user?.id ?? 'signed-out'} account={user?.id ? String(user.id) : null}>{children}</HealthSession>;
}
function HealthSession({ account, children }: PropsWithChildren<{ account: string | null }>) {
  const [availability, setAvailability] = useState<HealthAvailability | null>(null);
  const [snapshot, setSnapshot] = useState<HealthSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [background, setBackground] = useState(false);
  const [preferences, setPreferences] = useState(() => restoreHealthPreference(null));
  const [apps, setApps] = useState<HealthApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState('');
  const preference = useRef(preferences);
  const lock = useRef(false), mounted = useRef(true), revision = useRef(0), initialized = useRef(false), appsRequest = useRef(0);
  const pendingRefresh = useRef(false);
  const key = `arogio.health.${account?.replace(/[^a-zA-Z0-9._-]/g, '_') ?? 'none'}`;
  function apply(next: HealthPreference) {
    preference.current = next;
    if (mounted.current) setPreferences(next);
  }
  async function persist(next: HealthPreference) {
    if (Platform.OS === 'android') await SecureStore.setItemAsync(key, JSON.stringify(next));
    apply(next);
  }
  async function refreshApps() {
    const request = ++appsRequest.current;
    setAppsLoading(true); setAppsError('');
    try {
      const installed = connectableHealthApps(await installedHealthApps());
      if (mounted.current && request === appsRequest.current) setApps(installed);
      return installed;
    } catch {
      if (mounted.current && request === appsRequest.current) {
        setApps([]);
        setAppsError('Health apps could not be listed. Install the latest Android build, then try again.');
      }
      return [];
    } finally { if (mounted.current && request === appsRequest.current) setAppsLoading(false); }
  }
  async function readCurrent(request: number) {
    const pref = preference.current;
    const source = pref.source;
    const valid = () => mounted.current && revision.current === request && preference.current.source?.id === source?.id && preference.current.enabled && AppState.currentState === 'active';
    if (!source || !pref.enabled) return;
    const status = await healthAvailability();
    if (!valid()) return;
    setAvailability(status);
    if (status !== 'available') { setConnected(false); setSnapshot(null); return; }
    const installed = await installedHealthApps();
    if (!valid()) return;
    setApps(connectableHealthApps(installed));
    if (!installed.some((app) => app.id === source.id && app.supportsHealthConnect !== false)) {
      setConnected(false); setSnapshot(null); setBackground(false);
      await stopBackgroundHealth();
      if (valid()) setError(`${source.name} is unavailable. Choose another app in Settings > Connected health.`);
      return;
    }
    const granted = await grantedHealth();
    if (!valid()) return;
    const allowed = granted.filter((metric) => pref.selected.includes(metric));
    setConnected(allowed.length > 0);
    if (!allowed.length) {
      setSnapshot(null); setBackground(false);
      await stopBackgroundHealth();
      if (valid()) setError('Health access is off. Manage access in Settings > Connected health.');
      return;
    }
    if (pref.background) {
      const enabled = await startBackgroundHealth(account!, pref.selected, source.id, () => valid() && preference.current.background).catch(() => false);
      if (!valid()) return;
      setBackground(enabled);
    }
    const next = await syncHealth(pref.selected, source.id);
    if (!valid() || next.source !== source.id) return;
    pendingRefresh.current = false;
    setSnapshot(next); setConnected(next.granted.length > 0);
  }
  async function run() {
    if (!account || !initialized.current) return;
    if (lock.current) { pendingRefresh.current = true; return; }
    if (!preference.current.enabled || !preference.current.source) return;
    pendingRefresh.current = false;
    lock.current = true;
    const request = ++revision.current;
    setBusy(true); setError('');
    try { await readCurrent(request); }
    catch {
      if (mounted.current && request === revision.current) {
        // Retain the last successful reading and its timestamp during transient failures.
        setError('Health data could not refresh. Check your selected app and Health Connect access in Settings. We will retry automatically.');
      }
    } finally { release(request); }
  }
  async function connectSource(app: HealthApp, selected: HealthMetric[]) {
    if (!account || !initialized.current || !isHealthApp(app) || app.supportsHealthConnect !== true || !selected.length) return false;
    const waitingSince = Date.now();
    while (lock.current && mounted.current && Date.now() - waitingSince < 20000) await new Promise(resolve => setTimeout(resolve, 100));
    if (!mounted.current || lock.current) return false;
    lock.current = true;
    const request = ++revision.current;
    const valid = () => mounted.current && revision.current === request;
    setBusy(true); setError(''); setSnapshot(null); setConnected(false); setBackground(false);
    // Stop old reads before any permission prompt, storage operation or source change.
    const previous = preference.current;
    let committed = false;
    apply({ ...previous, enabled: false });
    try {
      await Promise.all([stopBackgroundHealth(), persist({ ...previous, enabled: false })]);
      if (!valid()) return false;
      const installed = await installedHealthApps();
      if (!installed.some((candidate) => candidate.id === app.id && candidate.supportsHealthConnect !== false)) throw new Error('Source app unavailable');
      if (!valid()) return false;
      const existing = await grantedHealth();
      const granted = selected.some((m) => !existing.includes(m)) ? await connectHealth(selected) : existing;
      if (!valid()) return false;
      if (!granted.some((m) => selected.includes(m))) {
        setError('No health data access was granted. Allow the data types you want to read in Health Connect.');
        return false;
      }
      await persist({ enabled: true, source: { id: app.id, name: app.name }, selected, background: previous.background, hasConnected: true });
      if (!valid()) return false;
      committed = true;
      setConnected(true);
      // Reuse existing background access without adding a second permission step.
      // Declining this optional permission must not fail the foreground connection.
      try {
        const allowed = await backgroundHealthGranted();
        if (!valid()) return false;
        if (allowed && await startBackgroundHealth(account, selected, app.id, () => valid() && preference.current.enabled)) {
          if (!valid()) return false;
          await persist({ ...preference.current, background: true });
          if (valid()) setBackground(true);
        }
      } catch { /* Foreground polling and resume refresh remain available. */ }
      if (!valid()) return false;
      await readCurrent(request);
      return valid();
    } catch {
      if (valid()) setError('This health app could not connect. Check that it is installed and sharing data with Health Connect, then try again.');
      return false;
    } finally {
      if (!committed && valid()) {
        // A declined new connection must not silently discard the previous source.
        try { await persist(previous); pendingRefresh.current = previous.enabled; }
        catch { if (valid()) setError('Connection could not be restored. Choose your health app again.'); }
      }
      release(request);
    }
  }
  const actions = useRef({ run, refreshApps });
  useEffect(() => { actions.current = { run, refreshApps }; });
  function release(request?: number) {
    lock.current = false;
    if (mounted.current && (request == null || request === revision.current)) setBusy(false);
    // Android can foreground the app before its permission callback completes.
    // Refresh after that callback rather than losing the resume event to the lock.
    if (mounted.current && pendingRefresh.current && AppState.currentState === 'active') {
      pendingRefresh.current = false;
      void actions.current.run();
    }
  }
  useEffect(() => {
    mounted.current = true;
    async function restore() {
      try {
        const stored = account && Platform.OS === 'android' ? await SecureStore.getItemAsync(key) : null;
        if (!mounted.current) return;
        apply(restoreHealthPreference(stored));
        const restored = preference.current;
        if (account && restored.enabled && restored.source) {
          const cached = await cachedBackgroundHealth(account, restored.source.id).catch(() => null);
          if (mounted.current && cached?.source === restored.source.id) {
            const granted = await grantedHealth();
            if (mounted.current) setSnapshot({ ...cached, granted: cached.granted.filter(metric => granted.includes(metric)),
              days: cached.days.map(day => ({ ...day, readings: Object.fromEntries(Object.entries(day.readings).filter(([metric]) => granted.includes(metric as HealthMetric))) })),
              latestWeight: granted.includes('Weight') ? cached.latestWeight : null });
          }
        } else if (account) await stopBackgroundHealth().catch(() => {});
        if (!mounted.current) return;
        initialized.current = true;
        const status = await healthAvailability();
        if (!mounted.current) return;
        setAvailability(status);
        if (Platform.OS === 'android') await actions.current.refreshApps();
        if (mounted.current) await actions.current.run();
      } catch {
        if (mounted.current) {
          // Unknown preferences never authorize reads or revive a Home connection prompt.
          apply({ ...restoreHealthPreference(null), hasConnected: true });
          initialized.current = true;
          setError('Health preferences could not be restored. Choose a source again in Settings > Connected health.');
        }
      } finally { if (mounted.current) setReady(true); }
    }
    void restore();
    const timer = setInterval(() => { if (AppState.currentState === 'active') void actions.current.run(); }, HEALTH_REFRESH_MS);
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') { void actions.current.refreshApps(); void actions.current.run(); }

    });
    return () => { mounted.current = false; clearInterval(timer); listener.remove(); };
  }, [account, key]);
  async function disconnect() {
    ++revision.current;
    const next = { ...preference.current, enabled: false };
    apply(next); setSnapshot(null); setConnected(false); setBackground(false); setBusy(false); setError('');
    try { await Promise.all([stopBackgroundHealth(), persist(next)]); }
    catch { if (mounted.current) setError('Refreshes are stopped for now. Revoke Arogio access in Health Connect to keep access off after restart.'); }
  }
  async function enableBackground() {
    const pref = preference.current;
    if (!account || !pref.source || !pref.enabled || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      if (!(await requestBackgroundHealth())) throw new Error('Permission unavailable');
      if (!mounted.current || !preference.current.enabled || preference.current.source?.id !== pref.source.id) return;
      if (!(await startBackgroundHealth(account, pref.selected, pref.source.id, () => mounted.current && preference.current.enabled && preference.current.source?.id === pref.source?.id))) throw new Error('Background tasks unavailable');
      await persist({ ...pref, background: true });
      if (mounted.current) setBackground(true);
    } catch { if (mounted.current) setError('Background refresh is unavailable or access was declined. Foreground refresh will continue.'); }
    finally { release(); }
  }
  async function disableBackground() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    const next = { ...preference.current, background: false };
    apply(next);
    try { await Promise.all([persist(next), stopBackgroundHealth()]); if (mounted.current) setBackground(false); }
    catch { if (mounted.current) setError('Background refresh could not be turned off. Revoke background access in Health Connect settings.'); }
    finally { release(); }
  }
  return <HealthContext.Provider value={{ availability, connected, hasConnected: preferences.hasConnected, source: preferences.source, selectedMetrics: preferences.selected,
    apps, appsLoading, appsError, refreshApps, connectSource, busy, ready, background, enableBackground, disableBackground,
    error, snapshot, run, disconnect, checkAvailability: async () => {
      const status = await healthAvailability(); setAvailability(status);
      if (status === 'available') await refreshApps();
    },
  }}>{children}</HealthContext.Provider>;
}
export function useHealthSync() {
  const value = useContext(HealthContext);
  if (!value) throw new Error('useHealthSync requires HealthSyncProvider');
  return value;
}
