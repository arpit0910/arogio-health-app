import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function render(width: number, mode: string) {
  execFileSync(process.execPath, ['scripts/preview-home-activity.cjs', String(width), mode], { cwd: resolve('.'), stdio: 'pipe' });
  return readFileSync(resolve(`.impeccable/review/home-sync/${mode}-${width}.html`), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
}
describe('Home health and activity rendering', () => {
  it('keeps all three cards and recovery controls visible when no app readings exist', () => {
    const html = render(390, 'empty');
    for (const metric of ['Steps', 'Movement', 'Sleep']) assert.match(html, new RegExp(`${metric}: No reading today`));
    assert.match(html, /Health &amp; activity/);
    assert.match(html, /Manage health apps/);
    assert.match(html, /Refresh readings/);
    assert.match(html, /31 Oct 2026/);
    assert.match(html, /2:30 PM IST/);
  });
  it('distinguishes a cached reading’s check time from the latest attempt and exposes sync errors', () => {
    const html = render(320, 'cached');
    assert.match(html, /Steps: 3,210/);
    assert.match(html, /1:30 PM IST/);
    assert.match(html, /2:30 PM IST/);
    assert.match(html, /Some readings could not refresh/);
    assert.match(html, /Pebble Halo/);
    assert.match(html, /Movement: No reading today/);
  });
});
