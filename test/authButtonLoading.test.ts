import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { it } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function renderAuthForm(name: 'LoginForm' | 'SignupForm') {
  const states: unknown[] = [];
  const refs: { current: unknown }[] = [];
  let stateIndex = 0, refIndex = 0, calls = 0, busy = false;
  let finish: () => void = () => undefined;
  const submit = () => {
    calls++;
    busy = true;
    return new Promise<void>(resolve => { finish = () => { busy = false; resolve(); }; });
  };
  const jsx = (type: unknown, props: Record<string, unknown>) => ({ type, props });
  const schema = { safeParse: (data: unknown) => ({ success: true, data }) };
  const dependencies: Record<string, unknown> = {
    react: {
      useState(initial: unknown) {
        const index = stateIndex++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value: unknown) => { states[index] = value; }];
      },
      useRef: (initial: unknown) => refs[refIndex++] ?? (refs[refIndex - 1] = { current: initial }),
    },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { View: 'View', StyleSheet: { create: (value: unknown) => value } },
    'react-native-svg': {},
    'expo-router': { useRouter: () => ({}) },
    '../../../localization/LanguageProvider': { useTranslation: () => ({ t: (text: string) => text }) },
    '../../../theme/AppearanceProvider': { usePalette: () => ({}) },
    '../../../theme/tokens': { fonts: {} },
    '../../../components/ui/AccessibleText': { AccessibleText: 'Text' },
    '../../../components/ui/TouchTarget': { TouchTarget: 'TouchTarget' },
    '../../../components/ui/Button': { Button: 'Button' },
    '../../../components/app/AppIcon': { AppIcon: 'AppIcon' },
    '../context/AuthContext': { useAuth: () => ({ login: submit, register: submit, isSubmitting: busy, clearError() {} }) },
    '../types': { loginSchema: schema, registerSchema: schema },
    './AuthIcon': { AuthIcon: 'AuthIcon' },
    './AuthField': { AuthField: 'AuthField' },
    './AuthPrimitives': { FormError: 'FormError' },
    './GoogleSignInButton': { GoogleSignInButton: 'GoogleButton' },
    './LoginForm': { AuthIntro: 'AuthIntro', loginStyles: {} },
  };
  const module = { exports: {} as Record<typeof name, (props: object) => unknown> };
  const file = readFileSync(`src/features/authentication/components/${name}.tsx`, 'utf8');
  const { outputText } = ts.transpileModule(file, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  vm.runInNewContext(outputText, { module, exports: module.exports, require: (key: string) => dependencies[key] });
  function find(node: any, type: string): any {
    if (node?.type === type) return node.props;
    return (Array.isArray(node) ? node : [node?.props?.children]).flat().map(child => child && find(child, type)).find(Boolean);
  }
  function render() {
    stateIndex = refIndex = 0;
    const form = module.exports[name]({});
    return { email: find(form, 'Button'), google: find(form, 'GoogleButton') };
  }
  return { render, calls: () => calls, finish: () => finish(), setExternalBusy: (value: boolean) => { busy = value; } };
}

for (const form of ['LoginForm', 'SignupForm'] as const) {
  it(`${form} shows the email spinner only for its own submission`, async () => {
    const h = renderAuthForm(form);
    h.setExternalBusy(true);
    assert.equal(h.render().email.disabled, true);
    assert.equal(h.render().email.loading, false);
    h.render().email.onPress();
    assert.equal(h.calls(), 0);
    h.setExternalBusy(false);
    h.render().email.onPress();
    assert.equal(h.render().email.loading, true);
    assert.equal(h.render().google.disabled, true);
    h.finish();
    await new Promise<void>(resolve => setImmediate(resolve));
    assert.equal(h.render().email.loading, false);
    assert.equal(h.render().email.disabled, false);
  });
}
