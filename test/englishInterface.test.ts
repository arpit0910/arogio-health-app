import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createTranslator } from '../src/localization/model.ts';

test('English profile, settings and welcome contain no hard-coded Hindi interface text', () => {
  for (const screen of ['profile', 'settings', 'welcome']) {
    execFileSync(process.execPath, ['scripts/preview-ui-system.cjs', '390', screen, 'light', 'en'], { stdio: 'pipe' });
    const html = readFileSync(`.impeccable/review/ui-system/${screen}-390-light-en.html`, 'utf8');
    const visible = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]*>/g, '');
    assert.doesNotMatch(visible, /\p{Script=Devanagari}/u, screen);
    assert.match(visible, /English/);
    assert.match(visible, /Hindi/);
  }
});

test('language controls use the selected display language without translating personal names', () => {
  const en = createTranslator('en'), hi = createTranslator('hi');
  assert.equal(en('App language'), 'App language');
  assert.equal(en('Hindi'), 'Hindi');
  assert.match(hi('App language'), /\p{Script=Devanagari}/u);
  assert.match(hi('Hindi'), /\p{Script=Devanagari}/u);
  const name = 'आरव';
  assert.equal(en(name), name);
});
