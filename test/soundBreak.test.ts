import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

it('exposes loading, a bounded failure and a working sound reload', () => {
  const states: any[] = [], effects: (() => void)[] = [];
  let cursor = 0, loaded = false, reloads = 0, timeout: (() => void) | undefined;
  const player = { pause() {}, play() {}, replace() { ++reloads; } };
  const dependencies: Record<string, unknown> = {
    '../../components/ui/AccessibleText': { AccessibleText: 'Text' },
    react: { useState: (initial: any) => { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], (next: any) => { states[i] = typeof next === 'function' ? next(states[i]) : next; }]; }, useRef: (initial: any) => ({ current: initial }), useCallback: (fn: unknown) => fn, useEffect: (effect: () => void) => effects.push(effect) },
    'react/jsx-runtime': { jsx: (type: unknown, props: unknown) => ({ type, props }), jsxs: (type: unknown, props: unknown) => ({ type, props }) },
    'react-native': { View: 'View', Text: 'Text', Image: 'Image', AppState: { addEventListener: () => ({ remove() {} }) } },
    'expo-router': { useFocusEffect() {} }, 'expo-audio': { useAudioPlayer: () => player, useAudioPlayerStatus: () => ({ isLoaded: loaded }) },
    '../../components/ui/Button': { Button: 'Button' }, '../../components/ui/TouchTarget': { TouchTarget: 'TouchTarget' },
    '../../components/app/CareUI': { useCareStyles: () => ({}) }, '../../theme/AppearanceProvider': { usePalette: () => ({}) },
    '../../localization/LanguageProvider': { useTranslation: () => ({ t: (value: string) => value }) }, './exercises': { clockTime: () => '5:00' },
  };
  const module = { exports: {} as { SoundBreak: () => any } };
  const compiled = ts.transpileModule(readFileSync('src/features/meditation/SoundBreak.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, require: (name: string) => { if (name.includes('/assets/')) return 1; if (!(name in dependencies)) throw new Error(name); return dependencies[name]; }, setTimeout: (fn: () => void) => { timeout = fn; return 1; }, clearTimeout() {} });
  function render() { cursor = 0; effects.length = 0; return module.exports.SoundBreak(); }
  function button(node: any): any { if (!node) return undefined; if (node?.type === 'Button') return node.props; return (Array.isArray(node) ? node : [node?.props?.children]).flat(Infinity).map(button).find(Boolean); }
  let tree = render();
  assert.equal(button(tree).title, 'Loading sound...');
  effects.forEach(effect => effect());
  timeout!();
  tree = render();
  assert.equal(button(tree).title, 'Retry sound');
  assert.equal(button(tree).disabled, false);
  button(tree).onPress();
  assert.equal(reloads, 1);
  assert.equal(button(render()).title, 'Loading sound...');
  loaded = true;
  assert.equal(button(render()).title, 'Play sound');
});
