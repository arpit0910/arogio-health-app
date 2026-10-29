import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function harness(platform = 'android') {
  const channels: { id: string; sound?: string }[] = [];
  const scheduled: { content: { sound: string; data: { route: string } }; trigger: { channelId: string } }[] = [];
  const cancelled: string[] = [];
  const intents: { action: string; extras: { key: string; value: string }[] }[] = [];
  let requestCount = 0, granted = true, canAskAgain = true, failPermissions = false;
  let handler: { handleNotification: () => Promise<{ shouldPlaySound: boolean }> };
  const notifications = {
    AndroidImportance: { DEFAULT: 3 }, AndroidNotificationVisibility: { PRIVATE: 0 }, SchedulableTriggerInputTypes: { DATE: 'date' },
    setNotificationHandler: (value: typeof handler) => { handler = value; },
    setNotificationChannelAsync: async (id: string, input: { sound?: string }) => { channels.push({ id, sound: input.sound }); },
    getPermissionsAsync: async () => { if (failPermissions) throw new Error('Native module unavailable'); return { granted, canAskAgain }; },
    requestPermissionsAsync: async () => { requestCount++; return { granted }; },
    getAllScheduledNotificationsAsync: async () => [{ identifier: 'arogio-wellness:legacy-water' }, { identifier: 'other-feature:keep' }],
    cancelScheduledNotificationAsync: async (id: string) => { cancelled.push(id); },
    scheduleNotificationAsync: async (value: typeof scheduled[number]) => { scheduled.push(value); },
  };
  const dependencies: Record<string, unknown> = {
    'expo-notifications': notifications,
    '../notifications/storage': { replacePending: async () => {} },
    'expo-constants': { __esModule: true, default: { expoConfig: { android: { package: 'com.arogio.health' } } } },
    'react-native': { Platform: { OS: platform }, Linking: { sendIntent: async (action: string, extras: { key: string; value: string }[]) => { intents.push({ action, extras }); }, openSettings: async () => {} } },
  };
  const module = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(new URL('../src/features/wellness/notifications.native.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, require: (key: string) => {
    if (!(key in dependencies)) throw new Error(`Unexpected dependency ${key}`);
    return dependencies[key];
  } });
  const api = module.exports as { getNotificationAccess: () => Promise<string>; requestReminderPermission: () => Promise<boolean>; syncNotifications: (owner: string | null, reminders: object[]) => Promise<string | null>; openReminderSettings: () => Promise<void> };
  return { api, channels, scheduled, cancelled, intents, handler: () => handler, requests: () => requestCount, deny: (askAgain = true) => { granted = false; canAskAgain = askAgain; }, fail: () => { failPermissions = true; } };
}
const reminders = ['/water', '/medicines', '/cycle'].map((route, i) => ({ id: `test:${i}`, at: '2026-10-30T08:00:00Z', title: 'Fixture', body: 'Synthetic reminder', route }));
describe('Water reminder sound', () => {
  it('assigns the droplet sound and its channel only to water, while preserving other reminder sounds', async () => {
    const h = harness();
    await h.api.syncNotifications('fixture-user', reminders);
    assert.equal(h.scheduled[0].content.sound, 'water_drop.wav');
    assert.equal(h.scheduled[0].trigger.channelId, 'water-reminders-v1');
    assert.equal(h.channels.find((channel) => channel.id === 'water-reminders-v1')?.sound, 'water_drop.wav');
    for (const reminder of h.scheduled.slice(1)) { assert.equal(reminder.content.sound, 'default'); assert.equal(reminder.trigger.channelId, 'wellness'); }
    assert.deepEqual(h.cancelled, ['arogio-wellness:legacy-water']);
    assert.equal((await h.handler().handleNotification()).shouldPlaySound, true);
  });
  it('does not prompt when a tracker only checks existing permission', async () => {
    const h = harness(); h.deny();
    const api = h.api as unknown as { requestReminderPermission: (request?: boolean) => Promise<boolean> };
    assert.equal(await api.requestReminderPermission(false), false);
    assert.equal(h.requests(), 0);
  });
  it('includes the custom sound on iOS without creating Android channels', async () => {
    const h = harness('ios');
    await h.api.syncNotifications('fixture-user', reminders);
    assert.equal(h.channels.length, 0);
    assert.equal(h.scheduled[0].content.sound, 'water_drop.wav');
  });
  it('does not re-request granted access and handles native permission failures without trapping forms', async () => {
    const h = harness();
    assert.equal(await h.api.requestReminderPermission(), true);
    assert.equal(h.requests(), 0);
    h.deny();
    assert.equal(await h.api.requestReminderPermission(), false);
    assert.equal(h.requests(), 1);
    assert.match((await h.api.syncNotifications('fixture-user', reminders))!, /Notifications are off/);
    assert.equal(h.scheduled.length, 0);
    h.fail(); assert.equal(await h.api.requestReminderPermission(), false);
  });
  it('reads notification access without requesting permission or altering channels', async () => {
    const h = harness();
    assert.equal(await h.api.getNotificationAccess(), 'allowed');
    h.deny(); assert.equal(await h.api.getNotificationAccess(), 'not-requested');
    h.deny(false); assert.equal(await h.api.getNotificationAccess(), 'blocked');
    assert.equal(h.requests(), 0); assert.equal(h.channels.length, 0);
    h.fail(); await assert.rejects(h.api.getNotificationAccess(), /Native module unavailable/);
  });
  it('opens the dedicated water channel so the user controls sound and mute settings', async () => {
    const h = harness();
    await h.api.openReminderSettings();
    assert.equal(h.intents[0].action, 'android.settings.CHANNEL_NOTIFICATION_SETTINGS');
    assert.equal(h.intents[0].extras.find((item) => item.key.endsWith('CHANNEL_ID'))?.value, 'water-reminders-v1');
  });
  it('bundles a short non-clipping PCM sound through the Expo notification plugin', () => {
    const config = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8'));
    const plugin = config.expo.plugins.find((entry: unknown) => Array.isArray(entry) && entry[0] === 'expo-notifications');
    assert.deepEqual(plugin[1].sounds, ['./assets/sounds/water_drop.wav']);
    const wav = readFileSync(new URL('../assets/sounds/water_drop.wav', import.meta.url));
    assert.equal(wav.toString('ascii', 0, 4), 'RIFF'); assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
    assert.equal(wav.readUInt16LE(22), 1); assert.equal(wav.readUInt16LE(34), 16);
    const duration = wav.readUInt32LE(40) / (wav.readUInt32LE(24) * 2);
    assert.ok(duration > 0.2 && duration < 2);
    let peak = 0;
    for (let i = 44; i < wav.length; i += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(i)));
    assert.ok(peak > 10000 && peak < 32767);
  });
});
