import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

it('uses the light palette even when the device and saved preference are dark', () => {
  const palette = { background: '#F7FAF7', ink: '#0A1F1B' };
  const module = { exports: {} as { useAppearance: () => any; usePalette: () => any } };
  const code = ts.transpileModule(readFileSync('src/theme/AppearanceProvider.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports,
    window: { localStorage: { getItem: () => 'dark' } },
    require: (name: string) => {
      if (name === 'react') return { createContext: (value: any) => ({ value }), useContext: (context: any) => context.value };
      if (name === 'react/jsx-runtime') return { jsx: () => null };
      if (name === './tokens') return { colors: palette, fonts: {} };
      if (name === 'react-native') return { useColorScheme: () => 'dark' };
      if (name === 'expo-secure-store') return { getItemAsync: async () => 'dark' };
      throw new Error(name);
    },
  });
  assert.equal(module.exports.useAppearance().scheme, 'light');
  assert.equal(module.exports.useAppearance().ready, true);
  assert.equal(module.exports.usePalette(), palette);
});

it('configures the native app and native splash for light appearance only', () => {
  const config = JSON.parse(readFileSync('app.json', 'utf8')).expo;
  assert.equal(config.userInterfaceStyle, 'light');
  assert.ok(config.plugins.includes('./plugins/with-light-only'));
  const splash = config.plugins.find((plugin: any) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen')[1];
  assert.equal(splash.dark, undefined);
});

it('replaces an old native night splash color and disables automatic darkening', () => {
  const actions: Record<string, (mod: any) => any> = {};
  const module = { exports: (_config: any) => ({}) };
  vm.runInNewContext(readFileSync('plugins/with-light-only.js', 'utf8'), { module,
    require: () => ({
      withAndroidColorsNight: (config: any, action: any) => { actions.night = action; return config; },
      withAndroidStyles: (config: any, action: any) => { actions.styles = action; return config; },
    }),
  });
  module.exports({ userInterfaceStyle: 'light', backgroundColor: '#F8FAF7' });
  const night = actions.night({ modResults: { resources: { color: [{ $: { name: 'splashscreen_background' }, _: '#00291E' }] } } });
  assert.equal(night.modResults.resources.color.length, 1);
  assert.equal(night.modResults.resources.color[0]._, '#F8FAF7');
  const styles = actions.styles({ modResults: { resources: { style: [{ $: { name: 'AppTheme', parent: 'Theme.AppCompat.DayNight.NoActionBar' }, item: [] }] } } });
  const theme = styles.modResults.resources.style[0];
  assert.equal(theme.$.parent, 'Theme.AppCompat.Light.NoActionBar');
  assert.equal(theme.item.find((item: any) => item.$.name === 'android:forceDarkAllowed')._, 'false');
});
