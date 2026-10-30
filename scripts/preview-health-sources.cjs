/* global __dirname */
// Render source-picker states with synthetic installed apps. Native discovery is not simulated as verified.
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
const { healthMetrics } = require('../src/features/health-sync/model.ts');
const { SafeAreaProvider } = require('react-native-safe-area-context');
const width = Number(process.argv[2] || 390);
const mode = process.argv[3] || 'first';
const height = 1100;
Dimensions.set({ window: { width, height, scale: 1, fontScale: 1 }, screen: { width, height, scale: 1, fontScale: 1 } });
const fixtureApps = [{ id: 'example.alpha', name: 'Example Health', supportsHealthConnect: true, metrics: ['Steps'] }, { id: 'example.beta', name: 'Another Health App', supportsHealthConnect: true, metrics: ['SleepSession'] }, { id: 'example.long', name: 'A Health App With a Longer Display Name', supportsHealthConnect: false }];
const mock = { apps: mode === 'empty' ? [] : fixtureApps, appsLoading: false, appsError: '',
  source: mode === 'connected' ? fixtureApps[0] : null, selectedMetrics: healthMetrics.map((item) => item.key),
  connected: mode === 'connected', hasConnected: mode === 'connected', busy: false, ready: true, availability: 'available',
  background: false, error: '', refreshApps: async () => [], connectSource: async () => {}, enableBackground: async () => {}, disableBackground: async () => {}, disconnect: async () => {}, run: async () => {} };
const load = Module._load;
Module._load = function(request, parent, ...rest) {
  if (request.endsWith('/AuthContext')) return { useAuth: () => ({ user: { id: 'fixture' } }) };
  if (request === 'expo-secure-store') return { getItemAsync: async () => null, setItemAsync: async () => {} };
  if (request === './HealthSyncProvider' && parent?.filename.includes('health-sync')) return { useHealthSync: () => mock };
  if (request === './WellnessContext') return { useWellness: () => ({}) };
  if (request === 'expo-router') return { router: { push() {}, canGoBack: () => true } };
  return load.call(this, request, parent, ...rest);
};
const { HealthSourcePicker } = require('../src/features/health-sync/HealthSourcePicker.tsx');
const HealthSourceSettingsScreen = mode === 'connected' ? require('../src/features/health-sync/HealthSourceSettingsScreen.tsx').HealthSourceSettingsScreen : null;
function PickerPreview() {
  return mode === 'connected' ? React.createElement(SafeAreaProvider, { initialMetrics: { frame: { x: 0, y: 0, width, height }, insets: { top: 0, left: 0, right: 0, bottom: 0 } } }, React.createElement(View, { style: { width, height } }, React.createElement(HealthSourceSettingsScreen))) : React.createElement(View, { style: { width, padding: 24, gap: 20, backgroundColor: '#00291E' } },
    React.createElement(Text, { style: { color: '#B8D0C4', fontFamily: 'Inter_400Regular', fontSize: 13 } }, 'Preview - synthetic installed app list'), React.createElement(HealthSourcePicker));
}
AppRegistry.registerComponent('HealthSourcesQA', () => PickerPreview);
const { element, getStyleElement } = AppRegistry.getApplication('HealthSourcesQA');
const out = path.join(root, '.impeccable/review/health-sources');
fs.mkdirSync(out, { recursive: true });
const fonts = ['400Regular', '500Medium', '600SemiBold'].map((font) => `@font-face{font-family:Inter_${font};src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root, `node_modules/@expo-google-fonts/inter/${font}/Inter_${font}.ttf`)).toString('base64')})}`).join('');
const markup = ReactDOM.renderToStaticMarkup(element);
fs.writeFileSync(path.join(out, `${mode}-${width}.html`), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+ReactDOM.renderToStaticMarkup(getStyleElement())+`<style>${fonts}body{margin:0;background:#00291E}</style></head><body>`+markup+'</body></html>');
console.log(`Source picker composition: ${mode} at ${width}. Synthetic app list; native discovery is not exercised.`);
