import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { launchAutoAdvance, launchDurations } from '../src/features/app-launch/launchTiming.ts';

function launchHarness(reader = false) {
  const values: any[] = [], refs: any[] = [], effects: (() => void | (() => void))[] = [];
  const callbacks: Record<string, (value: any) => void> = {}, timers = new Map<number, () => void>();
  let cursor = 0, refCursor = 0, timerId = 0, hidden = 0;
  const navigations: string[] = [], router = { replace: (path: string) => navigations.push(path) };
  class Value { value: any; constructor(value: any) { this.value = value; } setValue(value: any) { this.value = value; } interpolate() { return this.value; } }
  const dependencies: Record<string, any> = {
    react: { useState: (initial: any) => { const i = cursor++; if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial; return [values[i], (next: any) => { values[i] = typeof next === 'function' ? next(values[i]) : next; }]; }, useRef: (initial: any) => refs[refCursor++] ?? (refs[refCursor - 1] = { current: initial }), useCallback: (fn: any) => fn, useEffect: (fn: any) => effects.push(fn) },
    'react/jsx-runtime': { jsx: (type: any, props: any) => ({ type, props }), jsxs: (type: any, props: any) => ({ type, props }) },
    'react-native': { View: 'View', StyleSheet: { create: (value: any) => value }, Easing: { out: (v: any) => v, cubic: 'cubic' }, Animated: { Value, View: 'AnimatedView', timing: () => ({ start: (callback?: any) => callback?.({ finished: true }), stop() {} }) }, AccessibilityInfo: { isReduceMotionEnabled: async () => false, isScreenReaderEnabled: async () => reader, addEventListener: (event: string, cb: any) => { callbacks[event] = cb; return { remove() {} }; } }, AppState: { currentState: 'active', addEventListener: (_: string, cb: any) => { callbacks.appState = cb; return { remove() {} }; } }, BackHandler: { addEventListener: (_: string, cb: any) => { callbacks.back = cb; return { remove() {} }; } } },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    'expo-splash-screen': { hideAsync: async () => { hidden++; } }, 'expo-router': { useRouter: () => router },
    '../../theme/AppearanceProvider': { usePalette: () => ({ background: '#fff' }) },
    './LaunchArtwork': { LaunchArtwork: 'Artwork' }, './launchTiming': { launchAutoAdvance, launchDurations },
  };
  const module = { exports: {} as { LaunchSequence: (props: object) => any } };
  const code = ts.transpileModule(readFileSync('src/features/app-launch/LaunchSequence.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: (name: string) => { if (!(name in dependencies)) throw new Error(name); return dependencies[name]; }, setTimeout: (fn: () => void) => { timers.set(++timerId, fn); return timerId; }, clearTimeout: (id: number) => timers.delete(id) });
  function render() { cursor = 0; refCursor = 0; effects.length = 0; return module.exports.LaunchSequence({ children: 'app' }); }
  function find(node: any, type: string): any { if (node?.type === type) return node; return (Array.isArray(node) ? node : [node?.props?.children]).flat(Infinity).map(n => n && find(n, type)).find(Boolean); }
  return { remount: () => { values.length = 0; refs.length = 0; timers.clear(); return render(); }, render, effects, callbacks, timers, navigations, hidden: () => hidden, artwork: () => find(render(), 'Artwork')?.props, layout: () => find(render(), 'AnimatedView').props.onLayout(), runTimer: () => { const [id, fn] = [...timers][0]; timers.delete(id); fn(); } };
}

it('keeps the native splash until layout, progresses through all three scenes, then releases the app', async () => {
  const h = launchHarness();
  h.render(); h.effects[0]();
  await new Promise<void>(resolve => setImmediate(resolve));
  assert.equal(h.hidden(), 0);
  h.layout(); h.render(); h.effects[1]();
  assert.equal(h.hidden(), 1);
  for (const step of [0, 1, 2]) {
    assert.equal(h.artwork().step, step);
    h.effects[2](); h.runTimer();
  }
  assert.equal(h.artwork(), undefined);
});

it('pauses automatic progression in the background and for screen readers while keeping manual controls', async () => {
  for (const reader of [false, true]) {
    const h = launchHarness(reader); h.render(); h.effects[0]();
    await new Promise<void>(resolve => setImmediate(resolve));
    h.layout(); h.callbacks.appState('background'); h.render(); h.effects[2]();
    assert.equal(h.timers.size, 0);
    h.callbacks.appState('active'); h.render(); h.effects[2]();
    assert.equal(h.timers.size, reader ? 0 : 1);
    h.artwork().onStepChange(2);
    assert.equal(h.artwork().step, 2);
    h.artwork().onSkip();
    assert.equal(h.artwork(), undefined);
  }
});

it('navigates to sign in once and cancels a pending timer on cleanup', async () => {
  const h = launchHarness(); h.render(); h.effects[0]();
  await new Promise<void>(resolve => setImmediate(resolve));
  h.layout(); h.render(); const cleanup = h.effects[2]();
  assert.equal(h.timers.size, 1); if (typeof cleanup === 'function') cleanup();
  assert.equal(h.timers.size, 0);
  const controls = h.artwork(); controls.onSignIn(); controls.onSignIn();
  assert.deepEqual(h.navigations, ['/login']);
});


it('does not replay after login, logout or any child-provider remount in the same app session', async () => {
  const h = launchHarness(); h.render(); h.effects[0]();
  await new Promise<void>(resolve => setImmediate(resolve));
  h.layout(); h.artwork().onSignIn();
  assert.equal(h.artwork(), undefined);
  for (const transition of ['login', 'logout', 'login with another account']) {
    h.remount();
    assert.equal(h.artwork(), undefined, transition);
    h.effects[1]();
  }
  assert.deepEqual(h.navigations, ['/login']);
  // A new process/runtime still gets its normal opening introduction.
  assert.ok(launchHarness().artwork());
});
