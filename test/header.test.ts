import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const React = require('react');
const source = ts.transpileModule(readFileSync('src/components/app/AppHeader.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function header(signedIn: boolean, history: boolean) {
  const actions: string[] = [];
  const exports: Record<string, any> = {};
  const mocks: Record<string, unknown> = {
    'expo-router': { useRouter: () => ({ canGoBack: () => history, back: () => actions.push('back'), replace: (path: string) => actions.push(path) }) },
    'react-native': { Text: 'text', View: 'view', StyleSheet: { create: (styles: unknown) => styles }, useWindowDimensions: () => ({ width: 390 }) },
    '../ui/AccessibleText': { AccessibleText: 'text' },
    '../ui/TouchTarget': { TouchTarget: 'button' },
    './AppIcon': { AppIcon: 'icon' },
    '../../localization/LanguageProvider': { useTranslation: () => ({ t: (text: string) => text }) },
    '../../features/profile/setupStatus': { canEnterApp: (user: unknown) => Boolean(user) },
    '../../features/authentication/context/AuthContext': { useAuth: () => ({ user: signedIn ? {} : null }) },
    '../../navigation/AppSidebar': { SidebarButton: 'menu' },
    '../../features/notifications/NotificationBell': { NotificationBell: 'notifications' },
    '../../theme/AppearanceProvider': { usePalette: () => ({ ink: '#203E32' }) },
    '../../theme/tokens': { fonts: {}, typeStyles: { rowTitle: {} } },
    './CareUI': { CareBrand: 'brand' },
  };
  runInNewContext(source, {
    exports,
    require: (name: string) => name === 'react' ? React : name === 'react/jsx-runtime' ? require(name) : mocks[name],
  });
  const tree = exports.AppHeader({ back: true, title: 'Emergency' });
  const controls: any[] = [];
  function visit(element: any) {
    if (!element?.props) return;
    if (element.type === 'button') controls.push(element);
    React.Children.forEach(element.props.children, visit);
  }
  visit(tree);
  return { actions, back: controls.find(control => control.props.accessibilityLabel === 'Back') };
}

describe('Detail screen navigation', () => {
  it('shows a labelled back action that respects navigation history', () => {
    const result = header(true, true);
    assert.ok(result.back);
    result.back.props.onPress();
    assert.deepEqual(result.actions, ['back']);
  });
  it('returns signed-in deep links to Home when no history exists', () => {
    const result = header(true, false);
    result.back.props.onPress();
    assert.deepEqual(result.actions, ['/home']);
  });
  it('returns guest deep links to public Home when no history exists', () => {
    const result = header(false, false);
    result.back.props.onPress();
    assert.deepEqual(result.actions, ['/home']);
  });
});
