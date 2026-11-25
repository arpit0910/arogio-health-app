import { Platform } from 'react-native';
import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { backgroundHealthGranted, healthAvailability, syncHealth } from './healthConnect';
import { healthMetrics, mergeHealthSnapshot, type HealthMetric, type HealthSnapshot } from './model';

const TASK = 'arogio-health-refresh';
const CONFIG = 'arogio.health.background';
const CACHE = 'arogio.health.cache';
const CHUNKS = 128;
type Configuration = { owner: string; selected: HealthMetric[]; source: string; generation: string };
let operations = Promise.resolve();
function serialize<T>(work: () => Promise<T>): Promise<T> {
  const next = operations.then(work, work);
  operations = next.then(() => {}, () => {});
  return next;
}
type Manifest = { owner: string; source: string; chunks: number; bank?: 'a' | 'b' };
const chunkKey = (index: number, bank?: Manifest['bank']) => bank ? `${CACHE}.${bank}.${index}` : `${CACHE}.${index}`;
async function cacheManifest(): Promise<Manifest | null> {
  const stored = await SecureStore.getItemAsync(CACHE);
  if (!stored) return null;
  const manifest = JSON.parse(stored) as Manifest;
  return Number.isInteger(manifest.chunks) && manifest.chunks > 0 && manifest.chunks <= CHUNKS ? manifest : null;
}
async function clearCache() {
  const previous = await cacheManifest().catch(() => null);
  await SecureStore.deleteItemAsync(CACHE);
  if (previous) await clearChunks(previous);
}
async function clearChunks(manifest: Manifest) {
  await Promise.all(Array.from({ length: manifest.chunks }, (_, i) =>
    SecureStore.deleteItemAsync(chunkKey(i, manifest.bank))));
}
async function readCache(manifest: Manifest | null, owner: string, source: string) {
  if (!manifest || manifest.owner !== owner || manifest.source !== source) return null;
  const chunks = await Promise.all(Array.from({ length: manifest.chunks }, (_, i) => SecureStore.getItemAsync(chunkKey(i, manifest.bank))));
  return chunks.some(part => part == null) ? null : JSON.parse(chunks.join('')) as HealthSnapshot;
}
async function writeCache(owner: string, source: string, snapshot: HealthSnapshot, isCurrent = () => true) {
  const previous = await cacheManifest().catch(() => null);
  const cached = await readCache(previous, owner, source).catch(() => null);
  if (!isCurrent() || (cached && cached.syncedAt > snapshot.syncedAt)) return;
  const merged = mergeHealthSnapshot(cached, snapshot);
  const chunks = JSON.stringify(merged).match(/[\s\S]{1,600}/g) ?? [];
  if (chunks.length > CHUNKS) throw new Error('Health cache exceeds limit');
  const bank = previous?.bank === 'a' ? 'b' : 'a';
  const manifest: Manifest = { owner, source, chunks: chunks.length, bank };
  try {
    const results = await Promise.allSettled(chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(index, bank), chunk)));
    const failed = results.find(result => result.status === 'rejected');
    if (failed?.status === 'rejected') throw failed.reason;
    if (!isCurrent()) { await clearChunks(manifest); return; }
    await SecureStore.setItemAsync(CACHE, JSON.stringify(manifest));
  } catch (error) {
    await clearChunks(manifest).catch(() => {});
    throw error;
  }
  if (previous) await clearChunks(previous).catch(() => {});
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
    const saved = await cacheManifest().catch(() => null);
    if (!isCurrent()) return false;
    if (saved && (saved.owner !== owner || saved.source !== source)) await clearCache();
    await SecureStore.setItemAsync(CONFIG, JSON.stringify({ owner, selected, source, generation: randomUUID() }));
    await BackgroundTask.registerTaskAsync(TASK, { minimumInterval: 15 });
    return true;
  });
}
export async function cachedBackgroundHealth(owner: string, source: string): Promise<HealthSnapshot | null> {
  if (Platform.OS !== 'android') return null;
  return serialize(async () => readCache(await cacheManifest(), owner, source));
}
/** Foreground results must also survive process restarts when background access is off. */
export async function cacheHealthSnapshot(owner: string, source: string, snapshot: HealthSnapshot, isCurrent = () => true) {
  if (Platform.OS !== 'android' || snapshot.source !== source) return;
  await serialize(() => writeCache(owner, source, snapshot, isCurrent));
}
if (Platform.OS === 'android') TaskManager.defineTask(TASK, async () => {
  try {
    const config = await configuration();
    if (!config) return BackgroundTask.BackgroundTaskResult.Success;
    if (await healthAvailability() !== 'available') return BackgroundTask.BackgroundTaskResult.Failed;
    if (!(await backgroundHealthGranted())) {
      await serialize(async () => {
        if ((await configuration())?.generation !== config.generation) return;
        await SecureStore.deleteItemAsync(CONFIG);
        await clearCache();
        await BackgroundTask.unregisterTaskAsync(TASK);
      });
      return BackgroundTask.BackgroundTaskResult.Success;
    }
    const snapshot = await syncHealth(config.selected, config.source);
    await serialize(async () => {
      const current = await configuration();
      if (JSON.stringify(current) !== JSON.stringify(config)) return;
      if (snapshot.source !== config.source) return;
      if (!snapshot.granted.length) { await clearCache(); return; }
      await writeCache(config.owner, config.source, snapshot);
    });
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
