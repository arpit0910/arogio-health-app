/* global __dirname */
globalThis.__DEV__ = false;
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


const { AppRegistry, Dimensions, View, Text } = require('react-native-web');
const { SafeAreaProvider } = require('react-native-safe-area-context');
const width = Number(process.argv[2] || 390), mode = process.argv[3] || 'water', height = Number(process.argv[7] || 844);
const scheme = 'light', language = process.argv[5] || 'en';
const fontScale = Number(process.argv[6] || 1);
Module._extensions['.wav'] = module => { module.exports = 1; };
Module._extensions['.svg'] = (module, file) => { module.exports = { uri: 'data:image/svg+xml;base64,' + fs.readFileSync(file).toString('base64') }; };
for (const ext of ['.png', '.jpg']) Module._extensions[ext] = (module, file) => { module.exports = { uri: 'data:image/' + (ext === '.jpg' ? 'jpeg' : 'png') + ';base64,' + fs.readFileSync(file).toString('base64') }; };
const originalLoad = Module._load;
Module._load = function(request, parent, ...rest) { if(request === 'expo-secure-store') return {}; if(request === 'expo-audio') return { useAudioPlayer: () => ({ pause() {}, play() {} }), useAudioPlayerStatus: () => ({ isLoaded: true }) }; if(request === 'expo-speech') return {}; return originalLoad.call(this,request,parent,...rest); };
const tokens = require('../src/theme/tokens.ts');
const palette = tokens.colors;
const translate = require('../src/localization/model.ts').createTranslator(language);
Dimensions.set({ window: { width, height: 844, scale: 1, fontScale }, screen: { width, height: 844, scale: 1, fontScale } });
const { localDay, addDays, defaultCycleSettings } = require('../src/features/personal-wellness/domain.ts');
const day = localDay();
const empty = mode.endsWith('-empty');
const data = { activityTracking: { goals: { Steps: 8000, ActiveCaloriesBurned: 400, Nutrition: 2100, Distance: 5, ExerciseSession: 30, SleepSession: 7.5 }, days: [{ day, values: { Steps: 3200, ActiveCaloriesBurned: 150, Nutrition: 650, Distance: 2.2, ExerciseSession: 20, SleepSession: 7 } }] }, waterPlan: empty ? null : { version: 'preview', wakeTime: '07:00', sleepTime: '23:00', targetMl: 2000, servingMl: 250, timezone: 'Asia/Kolkata', remindersEnabled: true, pausedUntil: null },
  waterLogs: empty ? [] : [0, 1, 2].map((i) => ({ id: `example:${i}`, day, amountMl: 250, loggedAt: new Date().toISOString(), targetMl: 2000, taskId: null })), waterTasks: [],
  medicines: empty ? [] : [{ id: 'example-medicine', name: 'Example prescribed medicine with a longer name', notes: 'Example care instructions. Synthetic record for layout testing.', enabled: true, doses: [{ time: '08:00', amount: 'Example dose amount' }, { time: '20:00', amount: 'Example dose amount' }] }],
  cycleSettings: empty ? null : defaultCycleSettings('Asia/Kolkata'), periods: empty ? [] : [{ id: 'example-period', startDate: addDays(day, -18), endDate: addDays(day, -14) }], cycleEntries: [] };
const wellness = { ready: true, data, loading: false, busy: false, error: null, notice: null, scheduledThrough: null, refresh: async () => {}, save: async () => true };
const health = { apps: [], appsLoading: false, availability: 'available', source: null, connected: false, hasConnected: false, ready: true, busy: false, selectedMetrics: [], run: async () => {} };
if (mode.startsWith('connections-')) {
  const app = { id: 'com.pebble.ring.app', name: 'Pebble Halo', supportsHealthConnect: mode !== 'connections-unsupported', metrics: mode === 'connections-unsupported' ? [] : ['Steps', 'SleepSession', 'HeartRate'] };
  health.apps = [app];
  if (app.supportsHealthConnect) Object.assign(health, { source: app, enabled: true, connected: true, selectedMetrics: app.metrics,
    snapshot: { source: app.id, syncedAt: new Date().toISOString(), granted: app.metrics, failed: [], latestWeight: null,
      days: [{ day, readings: mode === 'connections-recorded' ? { Steps: { value: 70001, sources: [app.id] }, HeartRate: { value: 72, sources: [app.id] } } : {} }] } });
}
const fixtureEntry = (kind, name, index) => ({ id: `00000000-0000-4000-8000-${String(index).padStart(12,'0')}`, kind, name, nameHi:'', city:'', address:'Example locality', phone:'+910000000000', reviewedAt:'2026-11-01', sourceUrl:'https://example.invalid/', verification:'source-reviewed', details:{ providerType:kind === 'hospital' ? index === 1 ? 'Government Apex' : 'Private' : 'Medicine Guide', specialties:kind === 'hospital' ? ['Emergency Care','General Medicine'] : ['Salt composition & precautions'], qualifications:'', registration:'', languages:[], summary:'', precautions:'', latitude:null, longitude:null} });
const providerFixtures = [fixtureEntry('hospital','Sawai Man Singh (SMS) Hospital',1),fixtureEntry('hospital','Eternal Heart Care Centre',2),fixtureEntry('hospital','Apex Hospitals',3)];
const medicineFixtures = [fixtureEntry('medicine','Paracetamol 650 mg',4),fixtureEntry('medicine','Azithromycin 500 mg',5),fixtureEntry('medicine','Pantoprazole 40 mg',6)];
const { yogaExercises } = require('../src/features/meditation/exercises.ts');
const practiceFixtures = require('./fixtures/meditation-catalog.json');
const yogaFixtures = yogaExercises.map(exercise => ({
  ...exercise, kind: 'practice', title_en: exercise.title, title_hi: '', description_en: exercise.description, description_hi: '',
  preparation_en: exercise.preparation, preparation_hi: '', repeat: 1, videoId: null,
  steps: exercise.steps.map(step => ({ ...step, title_en: step.title, title_hi: '', instruction_en: step.instruction, instruction_hi: '' })),
}));
function useReminderPreviewState(initial) {
  let value = initial;
  if (initial === 0) value = mode === 'reminder-times' ? 1 : 2;
  else if (typeof initial === 'function') value = () => ({ ...data.medicines[0], form:'Tablet', startDate:day, doses:[{time:'08:00',amount:'Amount copied from label',meal:'after'}] });
  else if (initial && typeof initial === 'object' && Object.keys(initial).length === 0 && mode === 'reminder-options') value = {more:true,dates:true};
  return React.useState(value);
}
const load = Module._load;
Module._load = function(request, parent, ...rest) {
  if (request === 'react' && parent?.filename.endsWith('MedicineReminderScreen.tsx') && /^reminder-(times|review|options)$/.test(mode)) return { ...React, useState: useReminderPreviewState };
  if (request.endsWith('/AccessibilityPreferences')) return { useAccessibilityPreferences: () => ({large:fontScale > 1,voice:false,ready:true,error:'',set:async()=>{}}) };
  if (request.endsWith('/carePreferences') || request === './carePreferences') return { useCarePreferences: () => ({data:{saved:[],recent:[]},isPending:false,isError:false,isSuccess:true,toggle:async()=>{},remember:async()=>{}}) };
  if (request.endsWith('/safetyContact')) return { useSafetyContact: () => ({data:null,isPending:false,isError:false}) };
  if (request.endsWith('/FigmaAsset')) return { FigmaAsset: ({screen,name,width,height}) => { const map = require('../src/components/app/figmaAssets.ts').figmaAssets[screen]; const a = name.startsWith('@') ? Object.values(map)[Number(name.slice(1))] : map[name]; const w = width || (height ? height*a.width/a.height : a.width), h = height || w*a.height/a.width; return React.createElement('img', {src:a.source.uri,alt:'',style:{width:w,height:h,objectFit:'cover',flexShrink:0}}); } };
  if (request.endsWith('/LanguageProvider')) return { useTranslation: () => ({t:translate, language, locale: language === 'hi' ? 'hi-IN' : 'en-IN', ready:true}) };
  if (request.endsWith('/AppearanceProvider')) return { usePalette: () => palette, useAppTheme: () => ({...palette,teal:palette.primary,white:palette.surface,fonts:tokens.fonts}), useAppearance: () => ({colors:palette,scheme,preference:scheme,ready:true}) };
  if (request.endsWith('/InboxProvider')) return { useInbox: () => ({items:[]}) };
  if (request.endsWith('/AppSidebar')) return { useSidebar: () => ({ openSidebar() {}, isOpen: false }), SidebarButton: () => React.createElement(require('../src/components/ui/TouchTarget.tsx').TouchTarget,{style:{width:48,alignItems:'center',justifyContent:'center'}},React.createElement(require('../src/components/app/AppIcon.tsx').AppIcon,{name:'menu'})) };
  if (request.endsWith('/configuration/environment')) return { env: { apiUrl: 'https://example.invalid/api/v1' } };
  if (request.endsWith('/api/client')) return { apiClient: {} };
  if (request === './useMeditationLibrary' && ['yoga', 'guided', 'wellness-browse'].includes(mode)) return {
    useMeditationLibrary: (section) => ({
      items: [...yogaFixtures, ...practiceFixtures.items].filter(item => !section || item.section === section),
      query: { data: {}, isPending: false, isRefetching: false, isFetchingNextPage: false, refetch() {} },
    }),
  };
  if (request === '@react-native-community/datetimepicker') return {};
  if (request === './GoogleSignInButton') return { GoogleSignInButton: () => React.createElement(require('../src/components/ui/Button.tsx').Button, {title:'Continue with Google',variant:'social',leading:React.createElement(require('../src/features/authentication/components/GoogleIcon.tsx').GoogleIcon),onPress(){}}) };
  if (request === 'expo-location' || request === 'expo-image-picker' || request === 'expo-image-manipulator') return {};
  if (request === '@tanstack/react-query') return { useQueryClient: () => ({invalidateQueries:async()=>{}}), useInfiniteQuery: (options) => options.queryKey[0] === 'care-directory' ? ({data:{pages:[{items:providerFixtures,page:1,hasNext:false,coverage:'Example'}]},isPending:false,isError:false,isRefetching:false,isFetchingNextPage:false,refetch(){}}) : options.queryKey[0] === 'meditation-library' ? ({data: mode === 'meditation-offline' ? undefined : {pages:[empty ? {items:[], page:1, hasNext:false} : require('./fixtures/meditation-catalog.json')]}, isPending:false, isError:mode === 'meditation-offline', isRefetching:false, isFetchingNextPage:false, hasNextPage:false,refetch(){}}) : ({ data: { pages: [{ total: 2, items: [1, 2].map(id => ({ id: String(id), title_en: 'A little space for everyday wellbeing', title_hi: translate('A little space for yourself'), excerpt_en: 'Simple ideas for movement, rest and time for yourself.', excerpt_hi: translate('Ideas to explore, a moment to pause, and help when you need it.'), category: 'Mindfulness', category_hi: translate('Meditation'), author_name: 'Arogio editorial', created_at: '2026-11-04T08:00:00Z' })), categoryDetails: [] }] }, hasNextPage: false, isPending: false, isFetching: false, isRefetching: false, isFetchingNextPage: false, refetch() {} }), useQuery: (options) => ({isPending:false,isError:false,data:options?.queryKey?.[0] === 'medical-departments' ? [] : options?.queryKey?.[0] === 'home-discovery' ? {hospitals:{status:'available',items:providerFixtures},doctors:{status:'available',items:[]}} : options?.queryKey?.[0] === 'article-categories' ? [] : options?.queryKey?.[0] === 'health-medicine-library' ? {items:medicineFixtures,hasNext:false} : {items:[],hasNext:false},refetch(){}}) };
  if (request.endsWith('/WellnessContext') || request === './WellnessContext') return { useWellness: () => wellness };
  if (request.endsWith('/HealthSyncProvider')) return { useHealthSync: () => health };
  if (request.endsWith('/AuthContext')) return { useAuth: () => ({ user: mode.endsWith('-guest') ? null : { id: 'fixture', username:'Preview', fullName:'Preview User', email:'preview@example.test',profileCompletedAt:'2026-11-02',profileSetup:{location:'New Delhi'} } }) };
  if (request.endsWith('/PhoneStepsProvider') || request === './PhoneStepsProvider') return { usePhoneSteps: () => ({ enabled: false, totals: {}, status: 'Phone step counting is off.', busy: false, ready: true, toggle: async () => {}, clear: async () => {} }) };
  if (request === './storage' && parent?.filename.includes('health-records')) return { recordsAvailable:true };
  if (request === 'expo-document-picker') return { getDocumentAsync: async () => ({canceled:true}) };
  if (request.endsWith('/useHealthRecords') || request === './useHealthRecords') return {useHealthRecords: () => ({owner:'fixture',data:[],isPending:false,isError:false,refetch:async()=>{},add:async()=>{},remove:async()=>{}})};
  if (request === 'expo-secure-store') return { getItemAsync: async () => null, setItemAsync: async () => {} };
  if (request === 'expo-crypto') return { randomUUID: () => 'example-only' };
  if (request === 'expo-router') return { router: { push() {}, navigate() {}, setParams() {}, replace() {}, canGoBack: () => true, back() {} }, useFocusEffect() {}, useLocalSearchParams: () => ({}), useRouter: () => ({push(){},navigate(){},replace(){},setParams(){},canGoBack:()=>false}) };
  return load.call(this, request, parent, ...rest);
};
const screens = {
  records: () => require('../src/features/health-records/HealthRecordsScreen.tsx').HealthRecordsScreen,
  sos: () => require('../src/features/emergency/SafetyContactScreen.tsx').SafetyContactScreen,
  alarm: () => () => React.createElement(require('../src/features/personal-wellness/MedicineAlarmView.tsx').MedicineAlarmView, { medicine: { ...data.medicines[0], name: 'Ashwagandha', strength: '500', unit: 'mg', notes: 'With warm water', doses: [{ time: '14:30', amount: '1 tablet' }] }, day, time: '14:30', onDismiss() {}, onAction() {} }),
  reminder: () => require('../src/features/personal-wellness/MedicineReminderScreen.tsx').MedicineReminderScreen,
  setup: () => require('../src/features/profile/components/ProfileSetupScreen.tsx').ProfileSetupScreen,
  connect: () => require('../src/features/health-connections/HealthConnectScreen.tsx').HealthConnectScreen,
  jeeva: () => require('../src/features/jeeva-assistant/JeevaScreen.tsx').JeevaScreen,
  care: () => require('../src/features/care-directory/CareSearchScreen.tsx').CareSearchScreen,
  welcome: () => require('../src/features/authentication/components/WelcomeScreen.tsx').WelcomeScreen,
  audio: () => () => React.createElement(require('../src/components/app/AppScreen.tsx').AppScreen, {back:true, title:'Gentle breathing'}, React.createElement(require('../src/features/meditation/PracticeAudio.tsx').PracticeAudio, {running:false, cue:'Breathe in', language}), React.createElement(Text, {style:{color:palette.ink,fontSize:44,textAlign:'center',marginTop:24}}, '2:00')), 
  articles: () => require('../src/features/articles/ArticlesScreen.tsx').ArticlesScreen,
  explore: () => require('../src/app/(main)/explore.tsx').default,
  connections: () => require('../src/features/health-connections/HealthSyncScreen.tsx').HealthSyncScreen,
  meditation: () => require('../src/features/meditation/MeditationScreen.tsx').MeditationScreen,
  yoga: () => () => React.createElement(require('../src/features/meditation/YogaMeditationScreen.tsx').YogaMeditationScreen, {section:'yoga'}),
  guided: () => () => React.createElement(require('../src/features/meditation/YogaMeditationScreen.tsx').YogaMeditationScreen, {section:'meditation'}),
  'wellness-browse': () => require('../src/features/meditation/YogaMeditationScreen.tsx').YogaMeditationScreen,
  'practice-detail': () => () => {
    const { PracticeDetailIntro, PracticePrimaryAction } = require('../src/features/meditation/MeditationScreen.tsx');
    const footer = React.createElement(PracticePrimaryAction, { title:'Start practice', onPress() {} });
    return React.createElement(require('../src/components/app/AppScreen.tsx').AppScreen, {back:true, title:'Practice', footer},
      React.createElement(PracticeDetailIntro, { exercise: yogaExercises[0] }));
  },
  login: () => require('../src/features/authentication/components/AuthScreen.tsx').AuthScreen,
  signup: () => () => React.createElement(require('../src/features/authentication/components/AuthScreen.tsx').AuthScreen, {initialTab:'signup'}),
  home: () => require('../src/features/home-dashboard/HomeScreen.tsx').HomeScreen,
  emergency: () => require('../src/features/emergency/EmergencyScreen.tsx').EmergencyScreen,
  profile: () => require('../src/features/profile/components/AccountProfileScreen.tsx').AccountProfileScreen,
  edit: () => require('../src/features/profile/components/EditProfileScreen.tsx').EditProfileScreen,
  activity: () => require('../src/features/activity/ActivityScreen.tsx').ActivityScreen,
  water: () => require('../src/features/personal-wellness/WaterScreen.tsx').WaterScreen,
  medicines: () => require('../src/features/personal-wellness/MedicineScreen.tsx').MedicineScreen,
  cycle: () => require('../src/features/personal-wellness/CycleScreen.tsx').CycleScreen,
  health: () => require('../src/features/personal-wellness/HealthScreen.tsx').HealthScreen,
  notifications: () => require('../src/features/settings/NotificationSettingsScreen.tsx').NotificationSettingsScreen,
  settings: () => require('../src/app/(account)/settings.tsx').default,
};
const key = /^reminder-(times|review|options)$/.test(mode) ? 'reminder' : mode.replace(/-(empty|waiting|unsupported|recorded|offline|guest)$/, '');
const Screen = screens[key]();
function DailyCarePreview() {
  return React.createElement(SafeAreaProvider, { initialMetrics: { frame: { x: 0, y: 0, width, height }, insets: { top: 0, left: 0, right: 0, bottom: 0 } } },
    React.createElement(View, { style: { width, height } }, React.createElement(Screen), ...(['home','care','health','profile','jeeva'].includes(key) ? [React.createElement(require('../src/navigation/AppNavigation.tsx').StandaloneAppNavigation,{key:'navigation',selected:key === 'care' ? 'find-care' : key})] : [])));
}
AppRegistry.registerComponent('DailyCareQA', () => DailyCarePreview);
const { element, getStyleElement } = AppRegistry.getApplication('DailyCareQA');
const out = path.join(root, '.impeccable/review/ui-system');
fs.mkdirSync(out, { recursive: true });
const fonts = ['400Regular', '500Medium', '600SemiBold', '700Bold'].map((font) => `@font-face{font-family:Inter_${font};src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root, `node_modules/@expo-google-fonts/inter/${font}/Inter_${font}.ttf`)).toString('base64')})}`).join('');
const brandFonts = [['plus-jakarta-sans','600SemiBold','PlusJakartaSans_600SemiBold'],['plus-jakarta-sans','700Bold','PlusJakartaSans_700Bold'],['dm-sans','400Regular','DMSans_400Regular'],['dm-sans','500Medium','DMSans_500Medium']].map(([pkg,weight,name]) => `@font-face{font-family:${name};src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root,`node_modules/@expo-google-fonts/${pkg}/${weight}/${name}.ttf`)).toString('base64')})}`).join('');
const markup = ReactDOM.renderToStaticMarkup(element);
fs.writeFileSync(path.join(out, `${mode}-${width}-${scheme}-${language}${fontScale === 1 ? '' : '-large'}.html`), '<!doctype html><html translate="no"><head><meta name="google" content="notranslate"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+ReactDOM.renderToStaticMarkup(getStyleElement())+`<style>${fonts}${brandFonts}body{margin:0;background:${palette.background}}</style></head><body>`+markup+'</body></html>');
console.log(`Composition preview: ${mode}, width ${width}. Synthetic records; native behavior is not exercised.`);
