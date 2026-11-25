import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { stepDelta } from '../src/features/activity/model.ts';
import { localDay, addDays, validDay } from '../src/features/personal-wellness/domain.ts';

it('reports background startup failure instead of silently switching Android to foreground-only tracking', async () => {
  const values: any[] = [], refs: any[] = [], effects: (() => void)[] = [];
  let stateCursor = 0, refCursor = 0, callback: ((count: number) => void) | undefined;
  const dependencies: Record<string, unknown> = {
    react: { createContext: () => ({ Provider: 'provider' }), useState: (initial: any) => { const i = stateCursor++; if (!(i in values)) values[i] = initial; return [values[i], (next: any) => { values[i] = next; }]; }, useRef: (initial: any) => { const i = refCursor++; return refs[i] ?? (refs[i] = { current: initial }); }, useEffect: (effect: () => void) => effects.push(effect) },
    'react/jsx-runtime': { jsx: (_type: unknown, props: unknown) => ({ props }) },
    'react-native': { Platform: { OS: 'android' }, AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } },
    'expo-secure-store': { getItemAsync: async () => JSON.stringify({ enabled: true, totals: {} }), setItemAsync: async () => {} },
    '../authentication/context/AuthContext': {}, '../personal-wellness/domain': { localDay, addDays, validDay }, './model': { stepDelta },
    './stepSensor': { phoneSensorState: async () => ({ available: true, granted: true }), watchPhoneSteps: async (next: (count: number) => void) => { callback = next; return { remove() {} }; } },
    './backgroundSteps': { startPersistentSteps: async () => { throw new Error('ForegroundServiceStartNotAllowed'); }, stopPersistentSteps: async () => {} },
  };
  const module = { exports: {} as { session: (props: object) => any } };
  const compiled = ts.transpileModule(readFileSync('src/features/activity/PhoneStepsProvider.tsx', 'utf8') + '\nexports.session = PhoneSession;', { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, require: (name: string) => { if (!(name in dependencies)) throw new Error(name); return dependencies[name]; }, setInterval: () => 1, clearInterval() {}, Date });
  function render() { stateCursor = 0; refCursor = 0; effects.length = 0; return module.exports.session({ owner: 'fixture' }).props.value; }
  render(); effects[1](); // Restore saved preferences.
  await new Promise<void>(resolve => setImmediate(resolve));
  render(); effects[2](); // Start tracking with the restored preference.
  await new Promise<void>(resolve => setImmediate(resolve));
  assert.equal(callback, undefined);
  assert.equal(render().totals[localDay()], undefined);
  assert.match(render().status, /Background counting could not start/);
});
