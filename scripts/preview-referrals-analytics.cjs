/* global __dirname */
// Composition QA of real daily-care screens using synthetic account data. Not native-device verification.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
  if (parent?.filename.includes('react-native-safe-area-context') && request.startsWith('.')) { const web = path.resolve(path.dirname(parent.filename), request) + '.web.js'; if (fs.existsSync(web)) return web; }
  if (request === 'react-native') request = 'react-native-web';
  if (request === 'react-native-svg') request = path.join(root, 'node_modules/react-native-svg/lib/commonjs/ReactNativeSVG.web.js');
  if (parent?.filename.includes('react-native-svg') && (request === './elements' || request === '../elements')) request += '.web';
  return resolve.call(this, request, parent, ...rest);
};
for (const extension of ['.ts', '.tsx']) Module._extensions[extension] = (module, file) => {
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, file);
};
const React = require('react');
const ReactDOM = require('react-dom/server');


Module._extensions['.png'] = (module, file) => { module.exports = { uri: 'data:image/png;base64,' + fs.readFileSync(file).toString('base64') }; };
const { AppRegistry, Dimensions, View, Text } = require('react-native-web');
const { SafeAreaProvider } = require('react-native-safe-area-context');
const width = Number(process.argv[2] || 390), mode = process.argv[3] || 'analytics', height = 1800, theme = process.argv[4] || 'light';
Dimensions.set({ window: { width, height: 844, scale: 1, fontScale: 1 }, screen: { width, height: 844, scale: 1, fontScale: 1 } });
const { localDay, addDays, defaultCycleSettings } = require('../src/features/wellness/domain.ts');
const day = localDay();
const empty = mode.endsWith('-empty');
const data = { activityTracking: { goals: { Steps: 8000, ActiveCaloriesBurned: 400, Nutrition: 2100, Distance: 5, ExerciseSession: 30, SleepSession: 7.5 }, days: [{ day, values: { Steps: 3200, ActiveCaloriesBurned: 150, Nutrition: 650, Distance: 2.2, ExerciseSession: 20, SleepSession: 7 } }] }, waterPlan: empty ? null : { version: 'preview', wakeTime: '07:00', sleepTime: '23:00', targetMl: 2000, servingMl: 250, timezone: 'Asia/Kolkata', remindersEnabled: true, pausedUntil: null },
  waterLogs: empty ? [] : [0, 1, 2].map((i) => ({ id: `example:${i}`, day, amountMl: 250, loggedAt: new Date().toISOString(), targetMl: 2000, taskId: null })), waterTasks: [],
  medicines: empty ? [] : [{ id: 'example-medicine', name: 'Example prescribed medicine with a longer name', notes: 'Example care instructions. Synthetic record for layout testing.', enabled: true, doses: [{ time: '08:00', amount: 'Example dose amount' }, { time: '20:00', amount: 'Example dose amount' }] }],
  cycleSettings: empty ? null : defaultCycleSettings('Asia/Kolkata'), periods: empty ? [] : [{ id: 'example-period', startDate: addDays(day, -18), endDate: addDays(day, -14) }], cycleEntries: [] };
const wellness = { data, loading: false, busy: false, error: null, notice: null, scheduledThrough: null, refresh: async () => {}, save: async () => true };
const health = { busy: false, snapshot: { source:'example.source', syncedAt: new Date().toISOString(), granted:['Steps','ExerciseSession','SleepSession'], days:[5100,7200,null,0,9400,6800,2481].map((v,i)=>({day:addDays(day,i-6),readings:{Steps:{value:v,sources:['example.source']},SleepSession:{value:i===6?5.36:null,sources:['example.source']}}})) }, source: { id: 'example.source', name: 'Example Health' }, connected: true, hasConnected: true };
const load = Module._load;
Module._load = function(request, parent, ...rest) {
  if (request.endsWith('/WellnessContext') || request === './WellnessContext') return { useWellness: () => wellness };
  if (request.endsWith('/HealthSyncProvider')) return { useHealthSync: () => health };
  if (request === './HomeContent') { const actual = load.call(this, request, parent, ...rest); return { ...actual, useHomeContent: () => ({ banners: [], weather: { available: true, city: 'Jaipur', temperature: 26, condition: 'Clear', observedAt: new Date().toISOString() }, refresh: async () => {} }) }; }
  if (request.endsWith('/services/api/client')) return { apiClient: { request: async () => [] } };
  if (request.endsWith('/config/env')) return { env: { apiUrl: 'https://example.test/api/v1' } };
  if (request.endsWith('/InboxProvider')) return { useInbox: () => ({ items: [], loading: false, error: '', markRead: async () => {} }) };
  if (request.endsWith('/AuthContext')) return { useAuth: () => ({ user: { id: 'fixture', fullName: 'Aarav Sharma', weightValue: 68, weightUnit: 'kg', heightValue: 174, heightUnit: 'cm', bmi: 22.5, profileSetup: { location: 'Bengaluru', healthGoals: ['fitness'] }, email: 'preview@example.test', referralCode: 'A1B2C3D4E5F6', profileCompletedAt: '2026-10-29T00:00:00Z' }, reloadProfile: async () => {} }) };
  if (request.endsWith('/AppearanceProvider')) { const actual = load.call(this, request, parent, ...rest); const colors = theme === 'dark' ? actual.darkColors : require('../src/theme/tokens.ts').colors; return { ...actual, useAppTheme: () => ({ onPrimary: colors.onPrimary, ink: colors.ink, muted: colors.muted, teal: colors.primary, border: colors.border, background: colors.background, mint: colors.subtle, white: colors.surface, accent: colors.accent, fonts: require('../src/theme/tokens.ts').fonts, shadow: {} }), usePalette: () => colors, useAppearance: () => ({ colors, scheme: theme }) }; }
  if (request.endsWith('/PhoneStepsProvider') || request === './PhoneStepsProvider') return { usePhoneSteps: () => ({ enabled: false, totals: {}, status: 'Phone step counting is off.', busy: false, ready: true, toggle: async () => {}, clear: async () => {} }) };
  if (request === 'expo-blur') return { BlurTargetView: View, BlurView: View }; // Native effect is verified separately.
  if (request === 'expo-secure-store') return { getItemAsync: async () => null, setItemAsync: async () => {} };
  if (request === 'expo-crypto') return { randomUUID: () => 'example-only' };
  if (request === 'expo-router') return { router: { push() {}, navigate() {}, replace() {}, canGoBack: () => true }, useLocalSearchParams: () => ({}), usePathname: () => '/settings' };
  return load.call(this, request, parent, ...rest);
};
const screens = {
  profile: () => require('../src/features/profile/components/AccountProfileScreen.tsx').AccountProfileScreen,
  home: () => require('../src/features/home/HomeScreen.tsx').HomeScreen,
  inbox: () => require('../src/features/notifications/NotificationsScreen.tsx').NotificationsScreen,
  deletion: () => require('../src/features/profile/components/DeleteAccountScreen.tsx').DeleteAccountScreen,
  journal: () => require('../src/features/wellness/HealthScreen.tsx').HealthScreen,
  standalone: () => require('../src/features/health-sync/StandaloneHealthScreen.tsx').StandaloneHealthScreen,
  header: () => function HeaderFixture() { return React.createElement(require('../src/components/app/AppHeader.tsx').AppHeader, { title: 'Daily activity & targets', back: true }); },
  welcome: () => require('../src/features/auth/components/WelcomeScreen.tsx').WelcomeScreen,
  referral: () => require('../src/features/referrals/ReferralPanel.tsx').ReferralPanel,
  analytics: () => function FixtureAnalytics() { const Screen = require('../src/features/health-sync/HealthOverview.tsx').HealthOverview; const snapshot = { syncedAt: new Date().toISOString(), granted: ['Steps', 'SleepSession', 'HeartRate', 'Weight'], latestWeight: null, failed: [], days: [5100, 7200, null, 0, 9400, 6800, 3100].map((value, i) => ({ day: addDays(day, i-6), readings: { Steps: { value, sources: ['synthetic'] } } })) }; return React.createElement(Screen, { snapshot }); },
  activity: () => require('../src/features/activity/ActivityScreen.tsx').ActivityScreen,
  water: () => require('../src/features/wellness/WaterScreen.tsx').WaterScreen,
  medicines: () => require('../src/features/wellness/MedicineScreen.tsx').MedicineScreen,
  cycle: () => require('../src/features/wellness/CycleScreen.tsx').CycleScreen,
  health: () => require('../src/features/wellness/HealthScreen.tsx').HealthScreen,
  notifications: () => require('../src/features/settings/NotificationSettingsScreen.tsx').NotificationSettingsScreen,
  settings: () => require('../src/app/(account)/settings.tsx').default,
};
const key = mode.replace('-empty', '');
const Screen = screens[key]();
function DailyCarePreview() {
  return React.createElement(SafeAreaProvider, { initialMetrics: { frame: { x: 0, y: 0, width, height }, insets: { top: 0, left: 0, right: 0, bottom: 0 } } },
    React.createElement(View, { style: { width, height } }, React.createElement(Text, { style: { fontFamily: 'Inter_400Regular', color: '#586357', padding: 8, fontSize: 11 } }, 'Composition preview - synthetic data, '+theme), React.createElement(Screen)));
}
AppRegistry.registerComponent('DailyCareQA', () => DailyCarePreview);
const { element, getStyleElement } = AppRegistry.getApplication('DailyCareQA');
const out = path.join(root, '.impeccable/review/referrals-analytics');
fs.mkdirSync(out, { recursive: true });
const fonts = ['400Regular', '500Medium', '600SemiBold', '700Bold'].map((font) => `@font-face{font-family:Inter_${font};src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root, `node_modules/@expo-google-fonts/inter/${font}/Inter_${font}.ttf`)).toString('base64')})}`).join('');
const markup = ReactDOM.renderToStaticMarkup(element);
fs.writeFileSync(path.join(out, `${mode}-${theme}-${width}.html`), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+ReactDOM.renderToStaticMarkup(getStyleElement())+`<style>${fonts}body{margin:0;background:${theme === 'dark' ? '#121C17' : '#FFFDFA'}}</style></head><body>`+markup+'</body></html>');
console.log(`Composition preview: ${mode}, width ${width}. Synthetic records; native behavior is not exercised.`);
