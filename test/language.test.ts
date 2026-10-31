import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createTranslator, validLanguage } from '../src/localization/model.ts';
import { hindi } from '../src/localization/hindi.ts';

describe('English and Hindi interface', () => {
  it('switches common navigation, settings, forms and service labels in both directions', () => {
    const hi = createTranslator('hi'), en = createTranslator('en');
    for (const label of ['Home','Health','Profile','Settings','Language','Medicines','Blood banks','Articles','Save targets','Date of birth','Emergency']) {
      assert.notEqual(hi(label), label); assert.equal(en(label), label);
    }
    assert.equal(hi('English'), 'English');
    assert.equal(hi('हिन्दी'), 'हिन्दी');
  });
  it('preserves names, numbers, whitespace, missing values and unknown user content', () => {
    const hi = createTranslator('hi');
    assert.equal(hi('Hi, Aarav $1'), 'नमस्ते, Aarav $1');
    assert.equal(hi('2.4 km away · straight-line'), '2.4 km दूर · सीधी रेखा में');
    assert.equal(hi('Page 2'), 'पेज 2');
    assert.equal(hi(' of '), ' में से ');
    assert.equal(hi('Vitamin D 1000 IU'), 'Vitamin D 1000 IU');
    assert.equal(hi(null), null); assert.equal(hi(0), 0); assert.equal(hi(undefined), undefined);
    assert.equal(hi('aarav@example.test'), 'aarav@example.test');
  });
  it('retains every interpolation in the translated catalogue', () => {
    for (const [source, translated] of Object.entries(hindi)) {
      const tokens = (text: string) => [...text.matchAll(/\{\d+\}/g)].map(match => match[0]).sort();
      assert.deepEqual(tokens(translated), tokens(source), source);
      assert.ok(translated.trim(), source);
    }
  });
  it('rejects unsupported persisted preferences and formats Hindi calendar labels', () => {
    assert.equal(validLanguage('hi'), true); assert.equal(validLanguage('en'), true);
    assert.equal(validLanguage('fr'), false); assert.equal(validLanguage(null), false);
    const date = new Date('2026-10-31T12:00:00Z');
    assert.notEqual(new Intl.DateTimeFormat('hi-IN', { month: 'long', timeZone: 'Asia/Kolkata' }).format(date), new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'Asia/Kolkata' }).format(date));
  });
});
