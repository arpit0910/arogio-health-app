import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { InfiniteQueryObserver, QueryClient } from '@tanstack/react-query';

const require = createRequire(import.meta.url);
function screen(failSecond = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  let observer: InfiniteQueryObserver<any>;
  let stop: () => void = () => {};
  let fail = failSecond, cursor = 0;
  const state: any[] = [];
  const calls: { term: string; page: number; category: string }[] = [];
  const dependencies: Record<string, unknown> = {
    react: { useState: (initial: any) => { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], (value: any) => { state[i] = value; }]; }, useMemo: (fn: () => unknown) => fn(), useEffect: () => {}, useRef: (value: unknown) => ({ current: value }) },
    '../../components/ui/AccessibleText': { AccessibleText: 'text', AccessibleTextInput: 'input' },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'react-native': { FlatList: 'list', View: 'view', Text: 'text', TextInput: 'input', ScrollView: 'scroll', ActivityIndicator: 'loading', StyleSheet: { create: (styles: unknown) => styles } },
    'expo-router': { useRouter: () => ({ push() {} }), useLocalSearchParams: () => ({}) },
    '@tanstack/react-query': {
      useQuery: () => ({ data: [{ name: 'Sleep', count: 4 }], refetch: async () => {} }),
      useInfiniteQuery: (options: any) => {
        if (!observer) { observer = new InfiniteQueryObserver(client, options); stop = observer.subscribe(() => {}); }
        else observer.setOptions(options);
        return observer.getCurrentResult();
      },
    },
    '../../localization/LanguageProvider': { useTranslation: () => ({ t: (text: string) => text, language: 'en' }) },
    '../../components/app/AppScreen': { AppScreen: 'screen' },
    '../../components/app/AppIcon': { AppIcon: 'icon' },
    '../../components/app/CareUI': { useCareStyles: () => ({}) },
    '../../components/ui/Button': { Button: 'button' },
    '../../components/ui/TouchTarget': { TouchTarget: 'touch' },
    '../../theme/AppearanceProvider': { usePalette: () => ({}) },
    '../care-directory/api': {}, './ArticleThumbnail': { ArticleThumbnail: 'image' },
    '../../theme/tokens': { fonts: {} },
    './ArticlesLibraryContent': { IconButton: 'icon-button', LibraryHeader: 'library-header', LibraryArticleCard: 'article-card', LibraryQuestion: 'question' },
    './articleLibraryStyles': { articleLibraryStyles: {} },
    './articleBookmarks': { loadArticleBookmarks: async () => [], saveArticleBookmarks: async () => {} },
    './articleLibraryModel': { filterSavedArticles: () => [] },
    '../../services/api/healthResourcesApi': { loadArticleCategories: async () => [], loadArticles: async (term: string, page: number, _signal: unknown, options: { category: string }) => {
      calls.push({ term, page, category: options.category });
      await new Promise<void>(resolve => setImmediate(resolve));
      if (page === 2 && fail) { fail = false; throw new Error('Offline'); }
      const ids = term || options.category ? ['filtered'] : page === 1 ? ['a', 'b'] : page === 2 ? ['b', 'c'] : ['d'];
      return { items: ids.map(id => ({ id })), page, hasNext: !term && !options.category && page < 3, categoryDetails: [], total: 4 };
    } },
  };
  const module = { exports: {} as { ArticlesLibraryScreen: () => any } };
  const code = ts.transpileModule(readFileSync('src/features/articles/ArticlesLibraryScreen.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports: module.exports, require: (name: string) => { if (!(name in dependencies)) throw new Error(name); return dependencies[name]; } });
  function render() { cursor = 0; const wrapper = module.exports.ArticlesLibraryScreen(); return wrapper.type(wrapper.props).props.children.props; }
  async function settle() { for (let i = 0; i < 30; i++) { await new Promise<void>(resolve => setImmediate(resolve)); if (!observer.getCurrentResult().isFetching) return; } throw new Error('Query did not settle'); }
  return { render, settle, calls, close: () => { stop(); client.clear(); } };
}
function find(element: any, predicate: (element: any) => boolean): any {
  if (!element) return undefined;
  if (Array.isArray(element)) return element.map(child => find(child, predicate)).find(Boolean);
  if (predicate(element)) return element;
  return find(element.props?.children, predicate);
}

describe('Article infinite scrolling', () => {
  it('appends pages once per request, removes overlapping IDs, and stops at the last page', async () => {
    const app = screen();
    try {
      app.render(); await app.settle();
      const list = app.render(); list.onEndReached(); list.onEndReached();
      await app.settle();
      assert.deepEqual(Array.from(app.render().data, (item: any) => item.id), ['a', 'b', 'c']);
      app.render().onEndReached(); await app.settle(); app.render().onEndReached();
      assert.deepEqual(app.calls.map(call => call.page), [1, 2, 3]);
      assert.deepEqual(Array.from(app.render().data, (item: any) => item.id), ['a', 'b', 'c', 'd']);
    } finally { app.close(); }
  });
  it('retains articles after a next-page failure and retries that page', async () => {
    const app = screen(true);
    try {
      app.render(); await app.settle(); app.render().onEndReached(); await app.settle();
      let list = app.render();
      assert.equal(list.data.length, 2);
      list.onEndReached(); await app.settle();
      assert.equal(app.calls.length, 2);
      find(list.ListFooterComponent, node => node.props?.title === 'Retry').props.onPress();
      await app.settle(); list = app.render();
      assert.equal(list.data.length, 3);
      assert.deepEqual(app.calls.map(call => call.page), [1, 2, 2]);
    } finally { app.close(); }
  });
  it('starts search and category changes at page one without mixing earlier results', async () => {
    const app = screen();
    try {
      app.render(); await app.settle(); app.render().onEndReached(); await app.settle();
      app.render().ListHeaderComponent.props.setSearch('rest');
      app.render().ListHeaderComponent.props.submitSearch();
      app.render(); await app.settle();
      assert.deepEqual(Array.from(app.render().data, (item: any) => item.id), ['filtered']);
      assert.equal(app.calls.at(-1)?.page, 1); assert.equal(app.calls.at(-1)?.term, 'rest');
      app.render().ListHeaderComponent.props.setCategory('Sleep');
      app.render(); await app.settle();
      assert.equal(app.calls.at(-1)?.category, 'Sleep'); assert.equal(app.calls.at(-1)?.page, 1);
    } finally { app.close(); }
  });
});
