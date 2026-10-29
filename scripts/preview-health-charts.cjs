/* global __dirname */
// Render the shipping React Native components with synthetic data for visual QA.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
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
const { AppRegistry, Text, View } = require('react-native-web');
const { HealthChart, WeeklyShare } = require('../src/features/health-sync/HealthCharts.tsx');
const { healthMetrics } = require('../src/features/health-sync/model.ts');
const steps = [5100, 7200, null, 0, 9400, 6800, 3100];
const snapshot = { syncedAt: '2026-10-29T08:00:00Z', granted: healthMetrics.map((m) => m.key), latestWeight: null, failed: [],
  days: steps.map((value, i) => ({ day: `2026-10-${23+i}`, readings: { Steps: { value, sources: ['example.source'] }, HeartRate: { value: value == null ? null : 65+i*2, sources: ['example.source'] }, SleepSession: { value: value == null ? null : 6+i/4, sources: ['example.source'] } } })) };
const element = React.createElement;
function Preview() {
  return element(View, { style: { width: 390, maxWidth: '100%', padding: 24, gap: 20, backgroundColor: '#FFFDFA' } },
    element(Text, { style: { fontFamily: 'Inter_600SemiBold', fontSize: 26, color: '#203E32' } }, 'Connected health'),
    element(Text, { style: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#586357' } }, 'Visual QA - synthetic readings, not health records'),
    element(HealthChart, { snapshot, metric: 'Steps' }), element(WeeklyShare, { snapshot, metric: 'Steps' }),
    element(Text, { style: { fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#203E32' } }, 'Heart rate'), element(HealthChart, { snapshot, metric: 'HeartRate' }),
    element(Text, { style: { fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#203E32' } }, 'Sleep'), element(HealthChart, { snapshot, metric: 'SleepSession' }),
    element(Text, { style: { fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#203E32' } }, 'Empty state'), element(HealthChart, { snapshot, metric: 'Weight' }));
}
AppRegistry.registerComponent('HealthChartQA', () => Preview);
const { element: app, getStyleElement } = AppRegistry.getApplication('HealthChartQA');
const out = path.join(root, '.impeccable/review/health-charts');
fs.mkdirSync(out, { recursive: true });
// Font paths are taken from the installed Expo font package.
const regular = fs.readFileSync(path.join(root, 'node_modules/@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf')).toString('base64');
const semibold = fs.readFileSync(path.join(root, 'node_modules/@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf')).toString('base64');
fs.writeFileSync(path.join(out, 'charts.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+ReactDOM.renderToStaticMarkup(getStyleElement())+`<style>@font-face{font-family:Inter_400Regular;src:url(data:font/ttf;base64,${regular})}@font-face{font-family:Inter_600SemiBold;src:url(data:font/ttf;base64,${semibold})}body{margin:0;background:#FFFDFA}</style></head><body>`+ReactDOM.renderToStaticMarkup(app)+'</body></html>');
console.log('Rendered shipping charts with synthetic fixtures.');
