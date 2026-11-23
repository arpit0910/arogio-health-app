import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
it('shows an unavailable state for a valid ID opened under the wrong provider kind', () => {
  const jsx = (type: unknown, props: unknown) => ({ type, props });
  const deps: Record<string, unknown> = {
    './carePreferences': { useCarePreferences: () => ({ data: { saved: [], recent: [] } }) },
    react: { useState: (value: unknown) => [value, () => {}] },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': {},
    'expo-router': { useRouter: () => ({}), useLocalSearchParams: () => ({ id: 'hospital-id' }) },
    '@tanstack/react-query': { useQuery: () => ({ data: { kind: 'hospital' }, isPending: false, isError: false }) },
    '../../components/app/AppScreen': { AppScreen: 'screen' },
    '../../components/app/CareUI': { useCareStyles: () => ({}) },
    '../../components/app/PageIntro': {}, '../../components/ui/Button': {},
    '../../theme/AppearanceProvider': { usePalette: () => ({}) },
    '../../localization/LanguageProvider': { useTranslation: () => ({ t: (text: string) => text, language: 'en' }) },
    './api': {}, './CarePrimitives': { ResourceState: 'state' },
  };
  const module = { exports: {} as { CareDetailScreen: (props: unknown) => any } };
  vm.runInNewContext(ts.transpileModule(readFileSync('src/features/care-directory/CareDetailScreen.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, { module, exports: module.exports, require: (name: string) => deps[name] });
  const result = module.exports.CareDetailScreen({ fixedKind: 'doctor' });
  assert.equal(result.props.children.type, 'state');
  assert.match(result.props.children.props.empty, /not available in this directory/);
  assert.equal(result.props.children.props.loading, false);
});
