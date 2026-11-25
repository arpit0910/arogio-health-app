import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { exercises, exerciseDuration } from '../src/features/meditation/exercises.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const fixture = JSON.parse(readFileSync('scripts/fixtures/meditation-catalog.json', 'utf8'));
function catalog(request: (options: { path: string }) => Promise<unknown> = async () => fixture) {
  const exports: Record<string, any> = {};
  vm.runInNewContext(ts.transpileModule(readFileSync('src/features/meditation/catalog.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, require: (name: string) => name === 'zod' ? require('zod') : name === './exercises' ? { exercises } : { publicApi: { request } },
    URLSearchParams,
  });
  return exports;
}
function render(mode: string) {
  execFileSync(process.execPath, ['scripts/preview-ui-system.cjs', '390', mode, 'light', 'en'], { stdio: 'pipe' });
  return readFileSync(`.impeccable/review/ui-system/${mode}-390-light-en.html`, 'utf8');
}
describe('Published meditation catalog', () => {
  it('requests the yoga section before paginating its cards', async () => {
    const api = catalog(async ({ path }) => {
      const params = new URL(path, 'https://example.test').searchParams;
      assert.equal(params.get('section'), 'yoga');
      assert.equal(params.get('page'), '2');
      return { items: [], page: 2, hasNext: false };
    });
    assert.equal((await api.loadMeditationPage(2, undefined, 'yoga')).page, 2);
  });
  it('validates seeded API items and retains the guided timing and Hindi fallback', () => {
    const api = catalog(), item = api.meditationItemSchema.parse(fixture.items[0]);
    const practice = api.catalogExercise(item, false), hindi = api.catalogExercise(item, true);
    assert.equal(exerciseDuration(practice), 120);
    assert.equal(practice.section, 'breathing');
    assert.equal(hindi.title, item.title_hi);
    assert.equal(api.catalogExercise({ ...item, title_hi: '' }, true).title, item.title_en);
    assert.throws(() => api.meditationItemSchema.parse({ ...item, videoId: 'javascript:alert(1)' }));
    const available = api.availablePractices(fixture.items, false);
    assert.equal(available.filter((practice: { title: string }) => practice.title === item.title_en).length, 1);
    assert.deepEqual(Array.from(available, (practice: { id: string }) => practice.id), fixture.items.filter((entry: {kind: string}) => entry.kind === 'practice').map((entry: {id: string}) => entry.id));
  });
  it('keeps unpublished practices and videos out of an empty library', () => {
    const html = render('meditation-empty');
    assert.match(html, /New practices and videos will appear here when published/);
    assert.doesNotMatch(html, /s2NISyShKXM|Daily morning affirmations/);
    assert.doesNotMatch(html, /Gentle breathing|Evening wind-down/);
    assert.match(html, /Sound &amp; stillness/);
  });
  it('offers retry without resurrecting bundled content on a service error', () => {
    const html = render('meditation-offline');
    assert.match(html, /The library could not refresh/);
    assert.match(html, /Retry library/);
    assert.doesNotMatch(html, /Gentle breathing|Affirmations video/);
  });
});
