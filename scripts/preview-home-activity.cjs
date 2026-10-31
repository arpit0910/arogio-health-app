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

const { AppRegistry, Dimensions } = require('react-native-web');

const { SafeAreaProvider } = require('react-native-safe-area-context');

const { View: RNView } = require('react-native-web');
const width = Number(process.argv[2] || 390), mode = process.argv[3] || 'empty';
const height = 1000;
Dimensions.set({ window: { width, height, scale: 1, fontScale: 1 }, screen: { width, height, scale: 1, fontScale: 1 } });
Module._extensions['.png'] = (module, file) => { module.exports = { uri: 'data:image/png;base64,' + fs.readFileSync(file).toString('base64') }; };
const load = Module._load;
const snapshot = { source: 'com.pebble.ring.app', syncedAt: '2026-10-31T09:00:00Z', granted: ['Steps','SleepSession','ExerciseSession'], failed: mode === 'cached' ? ['Steps'] : [], latestWeight: null,
  days: [{ day: '2026-10-31', readings: mode === 'cached' ? { Steps: { value: 3210, sources: ['com.pebble.ring.app'], checkedAt: '2026-10-31T08:00:00Z' } } : {} }] };
Module._load = function(request, parent, ...rest) {
  if (request.endsWith('/WellnessContext')) return { useWellness: () => ({ready:true,data:{activityTracking:{goals:{Steps:8000,ExerciseSession:30,SleepSession:8},days:[]}}}) };
  if (request === './PhoneStepsProvider') return { usePhoneSteps: () => ({enabled:false,totals:{}}) };
  if (request.endsWith('/HealthSyncProvider')) return { useHealthSync: () => ({ready:true,connected:true,busy:mode==='loading',source:{id:'com.pebble.ring.app',name:'Pebble Halo'},snapshot,selectedMetrics:snapshot.granted,error:mode==='cached'?'Some readings could not refresh. Previous values keep their earlier check time.':'',run:async()=>{}}) };
  if (request.endsWith('/useTrackingClock')) return { useTrackingClock: () => new Date('2026-10-31T09:00:00Z') };
  if (request === 'expo-secure-store') return { getItemAsync: async () => null, setItemAsync: async () => {} };
  if (request === 'expo-router') return { router:{push(){}} };
  return load.call(this,request,parent,...rest);
};
const { TodayActivity } = require('../src/features/activity/TodayActivity.tsx');
function Preview() { return React.createElement(SafeAreaProvider,{initialMetrics:{frame:{x:0,y:0,width,height},insets:{top:0,left:0,right:0,bottom:0}}},React.createElement(RNView,{style:{width,height}},React.createElement(TodayActivity))); }
AppRegistry.registerComponent('HomeActivityQA',()=>Preview);
const { element,getStyleElement } = AppRegistry.getApplication('HomeActivityQA');
const out=path.join(root,'.impeccable/review/home-sync');fs.mkdirSync(out,{recursive:true});
const fonts=['400Regular','500Medium','600SemiBold'].map(font=>`@font-face{font-family:Inter_${font};src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root,`node_modules/@expo-google-fonts/inter/${font}/Inter_${font}.ttf`)).toString('base64')})}`).join('');
const markup=ReactDOM.renderToStaticMarkup(element);
fs.writeFileSync(path.join(out,`${mode}-${width}.html`),'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+ReactDOM.renderToStaticMarkup(getStyleElement())+`<style>${fonts}body{margin:0;background:#00291E}</style></head><body>`+markup+'</body></html>');
