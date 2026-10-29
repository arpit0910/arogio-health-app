import { Platform } from 'react-native';
import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { backgroundHealthGranted, healthAvailability, syncHealth } from './healthConnect';
import { installedHealthApps } from './healthApps';
import { healthMetrics, type HealthMetric, type HealthSnapshot } from './model';

const TASK = 'arogio-health-refresh';
const CONFIG = 'arogio.health.background';
const CACHE = 'arogio.health.cache';
const CHUNKS = 32;
type Configuration = { owner: string; selected: HealthMetric[]; source: string; generation: string };
let operations = Promise.resolve();
function serialize<T>(work: () => Promise<T>): Promise<T> {
  const next = operations.then(work, work);
  operations = next.then(() => {}, () => {});
  return next;
}
async function clearCache() {
  await SecureStore.deleteItemAsync(CACHE);
  await Promise.all(Array.from({ length: CHUNKS }, (_, i) => SecureStore.deleteItemAsync(`${CACHE}.${i}`)));
}
async function configuration(): Promise<Configuration | null> {
  const stored = await SecureStore.getItemAsync(CONFIG);
  if (!stored) return null;
  const parsed = JSON.parse(stored) as Configuration;
  if (typeof parsed.owner !== 'string' || typeof parsed.generation !== 'string' || typeof parsed.source !== 'string' || !parsed.source || !Array.isArray(parsed.selected)) return null;
  return { owner: parsed.owner, source: parsed.source, generation: parsed.generation, selected: parsed.selected.filter((key) => healthMetrics.some((item) => item.key === key)) };
}
export async function stopBackgroundHealth() {
  if (Platform.OS !== 'android') return;
  return serialize(async () => {
    // Remove the work authorization before unregistering or clearing cached data.
    await SecureStore.deleteItemAsync(CONFIG);
    await clearCache();
    if (await TaskManager.isTaskRegisteredAsync(TASK)) await BackgroundTask.unregisterTaskAsync(TASK);
  });
}
export async function startBackgroundHealth(owner: string, selected: HealthMetric[], source: string, isCurrent = () => true) {
  if (Platform.OS !== 'android' || !source) return false;
  if (!(await backgroundHealthGranted()) || !(await TaskManager.isAvailableAsync()) ||
      await BackgroundTask.getStatusAsync() !== BackgroundTask.BackgroundTaskStatus.Available) return false;
  return serialize(async () => {
    if (!isCurrent()) return false;
    const previous = await configuration();
    if (previous?.owner === owner && previous.source === source && JSON.stringify(previous.selected) === JSON.stringify(selected) && await TaskManager.isTaskRegisteredAsync(TASK)) return true;
    if (!isCurrent()) return false;
    await clearCache();
    await SecureStore.setItemAsync(CONFIG, JSON.stringify({ owner, selected, source, generation: randomUUID() }));
    await BackgroundTask.registerTaskAsync(TASK, { minimumInterval: 15 });
    return true;
  });
}
export async function cachedBackgroundHealth(owner: string, source: string): Promise<HealthSnapshot | null> {
  if (Platform.OS !== 'android') return null;
  return serialize(async () => {
    const manifest = await SecureStore.getItemAsync(CACHE);
    if (!manifest) return null;
    const parsed = JSON.parse(manifest) as { owner: string; source: string; chunks: number };
    if (parsed.owner !== owner || parsed.source !== source || !Number.isInteger(parsed.chunks) || parsed.chunks < 1 || parsed.chunks > CHUNKS) return null;
    const chunks = await Promise.all(Array.from({ length: parsed.chunks }, (_, i) => SecureStore.getItemAsync(`${CACHE}.${i}`)));
    if (chunks.some((part) => part == null)) return null;
    return JSON.parse(chunks.join('')) as HealthSnapshot;
  });
}
if (Platform.OS === 'android') TaskManager.defineTask(TASK, async () => {
  let taskConfig: Configuration | null = null;
  try {
    const config = await configuration();
    taskConfig = config;
    if (!config) { await stopBackgroundHealth(); return BackgroundTask.BackgroundTaskResult.Success; }
    if (await healthAvailability() !== 'available' || !(await backgroundHealthGranted()) || !(await installedHealthApps()).some((app) => app.id === config.source)) {
      await stopBackgroundHealth();
      return BackgroundTask.BackgroundTaskResult.Success;
    }
    const snapshot = await syncHealth(config.selected, config.source);
    await serialize(async () => {
      const current = await configuration();
      if (JSON.stringify(current) !== JSON.stringify(config)) return;
      await clearCache();
      if (!snapshot.granted.length || snapshot.source !== config.source) return;
      const encoded = JSON.stringify(snapshot);
      const chunks = encoded.match(/[\s\S]{1,400}/g) ?? [];
      if (chunks.length > CHUNKS) throw new Error('Health cache exceeds limit');
      for (const [i, chunk] of chunks.entries()) await SecureStore.setItemAsync(`${CACHE}.${i}`, chunk);
      await SecureStore.setItemAsync(CACHE, JSON.stringify({ owner: config.owner, source: config.source, chunks: chunks.length }));
    });
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    // A failed read must never leave a cached snapshot that looks current.
    await serialize(async () => {
      const current = await configuration();
      if (current?.generation === taskConfig?.generation) await clearCache();
    }).catch(() => {});
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
