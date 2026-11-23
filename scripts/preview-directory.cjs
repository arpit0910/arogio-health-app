/* global __dirname */
globalThis.__DEV__ = false;
// Render actual screens with local CSV fixtures; no network, account or location access.
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
const root = path.resolve(__dirname, '..'), resolve = Module._resolveFilename, load = Module._load;
Module._resolveFilename = function(request, parent, ...rest) {
  if (request === 'react-native') request = 'react-native-web';
  if (request === 'react-native-svg') request = path.join(root, 'node_modules/react-native-svg/lib/commonjs/ReactNativeSVG.web.js');
  if (parent?.filename.includes('react-native-svg') && (request === './elements' || request === '../elements')) request += '.web';
  return resolve.call(this, request, parent, ...rest);
};
for (const extension of ['.ts', '.tsx']) Module._extensions[extension] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, file);
for (const extension of ['.png', '.jpg']) Module._extensions[extension] = (module, file) => { module.exports = { uri: 'data:image/' + (extension === '.jpg' ? 'jpeg' : 'png') + ';base64,' + fs.readFileSync(file).toString('base64') }; };
const React = require('react'), ReactDOM = require('react-dom/server'), { View, Text, AppRegistry, Dimensions } = require('react-native-web');
const width = Number(process.argv[2] || 390), scheme = process.argv[3] || 'light', screen = process.argv[4] || 'banks';
const language = process.argv[5] || 'en';
const translations = language === 'hi' ? require('../src/localization/hindi.ts').hindi : {};
Dimensions.set({ window: { width, height: 844, scale: 1, fontScale: 1 }, screen: { width, height: 844, scale: 1, fontScale: 1 } });
Module._load = function(request, parent, ...rest) { if (request === 'expo-secure-store') return {}; return load.call(this, request, parent, ...rest); };
const { colors, fonts } = require('../src/theme/tokens.ts'), palette = colors;
const { prepareImport } = require('D:/arogio_health_backend/dist/modules/health-resources/imports/import.js');
const article = prepareImport('articles', fs.readFileSync('C:/Users/arpit/Downloads/articles_export (3).csv')).articles[0];
const bank = prepareImport('blood-banks', fs.readFileSync('C:/Users/arpit/Downloads/blood_banks_export (7).csv')).banks.find(bank => bank.phone && bank.latitude != null);
const articles = [{ ...article, id: 'fixture', created_at: article.created_at.toISOString() }];
const coords = { latitude: 26.9, longitude: 75.8, time: 1793400000000 };
let stateIndex = 0;
Module._load = function(request, parent, ...rest) {
  if (request === 'expo-secure-store') return {};
  if (request.endsWith('/LanguageProvider')) return { useTranslation: () => ({ t: text => translations[text] || text, language, locale: language === 'hi' ? 'hi-IN' : 'en-IN' }) };
  if (request === 'react' && parent?.filename.endsWith('BloodBanksScreen.tsx')) return { ...React, useState: initial => { const index = stateIndex++; if (index === 2) initial = coords; if (index === 9) initial = { key: JSON.stringify([coords, '', '', false, 50, 1, 0]), data: { items: [{ ...bank, id: 'bank-fixture', distanceKm: 2.4 }], page: 1, hasNext: false, missingCoordinates: 17 }, error: '' }; return React.useState(initial); } };
  if (request.endsWith('/AppearanceProvider')) return { usePalette: () => palette, useAppTheme: () => ({ ...palette, teal: palette.primary, white: palette.surface, fonts }) };
  if (request.endsWith('/api/client')) return { apiClient: {} };
  if (request === 'expo-location') return {};
  if (request === 'expo-router') return { router: { push() {} }, useRouter: () => ({ push() {} }), useLocalSearchParams: () => ({ id: 'fixture' }) };
  if (request === '@tanstack/react-query') return { useQuery: options => ({ data: options.queryKey.length === 2 && options.queryKey[1] === 'fixture' ? articles[0] : { items: articles, hasNext: false }, isPending: false, isError: false, refetch() {} }) };
  if (request.endsWith('/AppScreen')) return { AppScreen: ({ title, children }) => React.createElement(View, { style: { padding: 20, gap: 24, maxWidth: 680, width: '100%', marginHorizontal: 'auto' } }, React.createElement(Text, { style: { color: palette.primary, fontFamily: fonts.semibold, fontSize: 19, paddingVertical: 12 } }, title), children) };
  return load.call(this, request, parent, ...rest);
};
const screens = require('../src/features/articles/ArticlesScreen.tsx'), banks = require('../src/features/blood-banks/BloodBanksScreen.tsx');
const EmergencyScreen = require('../src/features/emergency/EmergencyScreen.tsx').EmergencyScreen;
const Component = screen === 'emergency-screen' ? EmergencyScreen : screen === 'emergency' ? () => React.createElement(banks.EmergencyButton, { inline: true }) : screen === 'home-articles' ? screens.HomeArticles : screen === 'banks' ? banks.BloodBanksScreen : screen === 'article' ? screens.ArticleScreen : screens.ArticlesScreen;
AppRegistry.registerComponent('DirectoryPreview', () => Component);
const { element, getStyleElement } = AppRegistry.getApplication('DirectoryPreview');
const markup = ReactDOM.renderToStaticMarkup(element), css = ReactDOM.renderToStaticMarkup(getStyleElement());
const fontCSS = ['400Regular','500Medium','600SemiBold','700Bold'].map(font => `@font-face{font-family:Inter_${font};src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root,`node_modules/@expo-google-fonts/inter/${font}/Inter_${font}.ttf`)).toString('base64')})}`).join('');
const out = path.join(root, '.impeccable/review/directory'); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, `${screen}-${width}-${scheme}${language === "hi" ? "-hi" : ""}.html`), `<!doctype html><html><head><meta charset="utf-8">${css}<style>${fontCSS}html,body{width:${width}px;max-width:${width}px}body{margin:0;background:${palette.background}}</style></head><body>${markup}</body></html>`);

