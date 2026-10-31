/* global __dirname */
// Static composition preview only; native motion must be checked on an Android device.
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

const { AppRegistry, Dimensions, View } = require('react-native-web');
const width = Number(process.argv[2] || 390);
const height = Number(process.argv[3] || 844);
const scheme = process.argv[4] || 'dark', fontScale = Number(process.argv[5] || 1);
if (!Number.isFinite(width) || !Number.isFinite(height) || width < 280 || height < 480) throw new Error('Use a phone or tablet viewport.');
Dimensions.set({ window: { width, height, scale: 1, fontScale }, screen: { width, height, scale: 1, fontScale } });
const load = Module._load;
Module._load = function(request, parent, ...rest) {
  if (request === 'expo-secure-store') return { getItemAsync: async () => null };
  return load.call(this, request, parent, ...rest);
};
const { colors: light, fonts } = require('../src/theme/tokens.ts');
const { darkColors } = require('../src/theme/AppearanceProvider.tsx');
const palette = scheme === 'light' ? light : darkColors;
Module._load = function(request, parent, ...rest) {
  if (request.endsWith('/AppearanceProvider')) return { usePalette: () => palette, useAppTheme: () => ({ ...palette, teal: palette.primary, white: palette.surface, fonts }) };
  if (request === 'expo-secure-store') return { getItemAsync: async () => null };
  return load.call(this, request, parent, ...rest);
};
const { LaunchArtwork } = require('../src/features/launch/LaunchArtwork.tsx');
function LaunchPreview() { return React.createElement(View, { style: { width, height } }, React.createElement(LaunchArtwork)); }
AppRegistry.registerComponent('LaunchQA', () => LaunchPreview);
const { element, getStyleElement } = AppRegistry.getApplication('LaunchQA');
const out = path.join(root, '.impeccable/review/launch-refresh');
fs.mkdirSync(out, { recursive: true });
const fontCSS = ['400Regular', '500Medium', '600SemiBold'].map((font) => {
  const data = fs.readFileSync(path.join(root, `node_modules/@expo-google-fonts/inter/${font}/Inter_${font}.ttf`)).toString('base64');
  return `@font-face{font-family:Inter_${font};src:url(data:font/ttf;base64,${data})}`;
}).join('') + `@font-face{font-family:PlusJakartaSans_600SemiBold;src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root,'node_modules/@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf')).toString('base64')})}`;
const markup = ReactDOM.renderToStaticMarkup(element);
fs.writeFileSync(path.join(out, `launch-${width}x${height}-${scheme}-${fontScale}.html`), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+ReactDOM.renderToStaticMarkup(getStyleElement())+`<style>${fontCSS}body{margin:0;background:${palette.background}}</style></head><body>`+markup+'</body></html>');
console.log(`Composition preview: ${width}x${height}. Native animation is not exercised by SSR.`);
