import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { convertMeasurement, validBirthDate, validatePersonal, type SetupDraft } from '../src/features/profile/model.ts';
const personal = { dateOfBirth: '2001-03-17', weightValue: '70', weightUnit: 'kg', heightValue: '170', heightUnit: 'cm' } as SetupDraft;
describe('Profile setup data', () => {
  it('preserves picked birthdays across timezones and leap days', () => {
    const moduleUrl = new URL('../src/features/profile/model.ts', import.meta.url).href;
    for (const timezone of ['Asia/Kolkata', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
      const result = execFileSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e',
        `import { birthDateInitialValue, birthDateValue } from ${JSON.stringify(moduleUrl)};
         console.log(JSON.stringify(['2001-03-17', '2000-02-29', '1900-01-01'].map(value => birthDateValue(birthDateInitialValue(value)))));`],
        { encoding: 'utf8', env: { ...process.env, TZ: timezone }, stdio: ['pipe', 'pipe', 'pipe'] });
      assert.deepEqual(JSON.parse(result), ['2001-03-17', '2000-02-29', '1900-01-01'], timezone);
    }
  });
  it('rejects impossible, malformed and future birth dates', () => {
    for (const date of ['2001-02-29', '2000-02-30', '17 Mar 2001', '2999-01-01', '', '1899-12-31']) assert.equal(validBirthDate(date), false);
    assert.equal(validBirthDate('2000-02-29'), true);
  });
  it('converts unit changes while retaining equivalent measurements', () => {
    const lbs = convertMeasurement('70', 2.20462262);
    assert.equal(lbs, '154.3');
    assert.equal(convertMeasurement(lbs, 0.45359237), '70');
    assert.equal(convertMeasurement('', 2.54), '');
    assert.equal(validatePersonal({ ...personal, weightValue: lbs, weightUnit: 'lb', heightValue: '66.9', heightUnit: 'in' }), null);
  });
  it('blocks empty and out-of-range measurements', () => {
    assert.equal(validatePersonal(personal), null);
    for (const value of ['', 'NaN', '-1', '501']) assert.ok(validatePersonal({ ...personal, weightValue: value }));
    for (const value of ['', 'NaN', '49', '301']) assert.ok(validatePersonal({ ...personal, heightValue: value }));
  });
});
