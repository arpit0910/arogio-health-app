import { it } from 'node:test';
import assert from 'node:assert/strict';
import { isPublicAccountPath } from '../src/navigation/publicAccess.ts';
import { HttpClient, ApiError } from '../src/services/api/httpClient.ts';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
it('opens only the intended public account routes', () => {
  for (const path of ['/emergency', '/blood-banks', '/meditation-video', '/articles', '/articles/real-id', '/care/real-id', '/hospitals', '/hospitals/real-id', '/doctors', '/medicine-library/real-id']) assert.equal(isPublicAccountPath(path), true);
  for (const path of ['/profile', '/data-export', '/water', '/activity', '/connected-health', '/care-records', '/settings', '/care', '/hospitals-private', '/doctors-records']) assert.equal(isPublicAccountPath(path), false);
});
it('does not send an already cancelled search to the network', async () => {
  const previous = globalThis.fetch; let calls = 0;
  globalThis.fetch = async () => { ++calls; throw new Error('Should not fetch'); };
  const controller = new AbortController(); controller.abort();
  try { await assert.rejects(() => new HttpClient('https://example.test', async () => null).request({ path: '/care', signal: controller.signal }), (error: unknown) => error instanceof ApiError && error.code === 'REQUEST_CANCELLED'); assert.equal(calls, 0); } finally { globalThis.fetch = previous; }
});
it('offers emergency navigation during restoration even when the global router is unbound', () => {
  const actions: string[] = [];
  const module = { exports: {} as { default: () => any } };
  const jsx = (type: unknown, props: unknown) => ({ type, props });
  const dependencies: Record<string, unknown> = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '../localization/LanguageProvider': { useTranslation: () => ({ t: (text: string) => text }) },
    '../features/profile/setupStatus': { canEnterApp: () => false },
    '../theme/AppearanceProvider': { usePalette: () => ({}) },
    'expo-router': { Redirect: 'redirect', router: { push: () => { throw new Error('Global router is unbound during recreation'); } }, useRouter: () => ({ push: (path: string) => actions.push(path) }) },
    'react-native': { View: 'view', ActivityIndicator: 'spinner' },
    '../features/authentication/context/AuthContext': { useAuth: () => ({ user: null, isLoading: true }) },
    '../features/authentication/components/WelcomeScreen': { WelcomeScreen: 'welcome' },
    '../components/ui/Button': { Button: 'button' },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/index.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, { module, exports: module.exports, require: (name: string) => dependencies[name] });
  const node = module.exports.default();
  const button = node.props.children[1].props.children;
  assert.equal(button.props.title, 'Emergency contacts'); button.props.onPress();
  assert.deepEqual(actions, ['/emergency']);
});
