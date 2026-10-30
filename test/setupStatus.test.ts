import { it } from 'node:test';
import assert from 'node:assert/strict';
import { canEnterApp } from '../src/features/profile/setupStatus.ts';

it('allows saved deferral across sessions while leaving a fresh account in setup', () => {
  assert.equal(canEnterApp(null), false);
  assert.equal(canEnterApp({ profileCompletedAt: null, profileSetup: null }), false);
  assert.equal(canEnterApp({ profileCompletedAt: null, profileSetup: { setupDeferred: true, step: 1 } }), true);
  assert.equal(canEnterApp({ profileCompletedAt: null, profileSetup: { setupDeferred: 'true' } }), false);
  assert.equal(canEnterApp({ profileCompletedAt: '2026-10-30T00:00:00Z' }), true);
});
