import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as model from '../src/localization/model.ts';
type Node = { props: { value: { language: string; ready: boolean; saving: boolean; error: string; setLanguage: (value: string) => Promise<void> } } };
function session(storage: Map<string, string>, failWrite = false) {
  const values: unknown[] = [], effects: (() => void)[] = [], refs: { current: unknown }[] = [];
  let cursor = 0, refCursor = 0, first = true;
  const module = { exports: {} as { LanguageProvider: (props: object) => Node } };
  const code = ts.transpileModule(readFileSync(new URL('../src/localization/LanguageProvider.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const react = {
    createContext: () => ({ Provider: 'provider' }),
    useState: (initial: unknown) => { const index = cursor++; if (!(index in values)) values[index] = initial; return [values[index], (value: unknown) => { values[index] = value; }]; },
    useRef: (initial: unknown) => refs[refCursor++] ?? (refs[refCursor - 1] = { current: initial }),
    useEffect: (callback: () => void) => { if (first) effects.push(callback); },
    useMemo: (factory: () => unknown) => factory(),
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: (name: string) => {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx: (_type: unknown, props: unknown) => ({ props }) };
    if (name === 'react-native') return { Platform: { OS: 'android' } };
    if (name === './model') return model;
    if (name === 'expo-secure-store') return { getItemAsync: async (key: string) => storage.get(key) ?? null, setItemAsync: async (key: string, value: string) => { if (failWrite) throw new Error('Storage unavailable'); storage.set(key, value); } };
    throw new Error(name);
  } });
  function render() { cursor = 0; refCursor = 0; const node = module.exports.LanguageProvider({}); first = false; return node.props.value; }
  return { render, restore: async () => { render(); effects.forEach(effect => effect()); await new Promise<void>(resolve => setImmediate(resolve)); return render(); } };
}
describe('Saved language preference', () => {
  it('restores the choice after a restart and allows switching back to English', async () => {
    const storage = new Map<string, string>(), first = session(storage);
    const context = await first.restore(); assert.equal(context.ready, true);
    await context.setLanguage('hi'); assert.equal(first.render().language, 'hi');
    const restart = session(storage), restored = await restart.restore(); assert.equal(restored.language, 'hi');
    await restored.setLanguage('en'); assert.equal(restart.render().language, 'en');
    assert.equal((await session(storage).restore()).language, 'en');
  });
  it('keeps the current language if saving fails and safely ignores an unsupported saved value', async () => {
    const storage = new Map([['arogio.language.v1', 'unsupported']]), app = session(storage, true);
    const context = await app.restore(); assert.equal(context.language, 'en');
    await context.setLanguage('hi'); assert.equal(app.render().language, 'en'); assert.ok(app.render().error);
  });
});
