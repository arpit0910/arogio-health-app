import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { restoreHealthPreference, showHealthConnectionPrompt } from '../src/features/health-sync/connection.ts';

describe('Single health source and Home prompt', () => {
  it('only invites a ready, never-connected account and does not flash during startup', () => {
    const fresh = restoreHealthPreference(null);
    assert.equal(showHealthConnectionPrompt(false, fresh.hasConnected), false);
    assert.equal(showHealthConnectionPrompt(true, fresh.hasConnected), true);
    const connected = restoreHealthPreference(JSON.stringify({ enabled: true, selected: ['Steps'], source: { id: 'example.source', name: 'Example' }, hasConnected: true }));
    assert.equal(connected.enabled, true);
    assert.equal(showHealthConnectionPrompt(true, connected.hasConnected), false);
    const disconnected = restoreHealthPreference(JSON.stringify({ ...connected, enabled: false }));
    assert.equal(showHealthConnectionPrompt(true, disconnected.hasConnected), false);
  });
  it('migrates both active and disconnected legacy records without mixing old sources or repeating Home onboarding', () => {
    for (const enabled of [true, false]) {
      const migrated = restoreHealthPreference(JSON.stringify({ enabled, selected: ['Steps'], background: true }));
      assert.equal(migrated.enabled, false);
      assert.equal(migrated.background, false);
      assert.equal(migrated.source, null);
      assert.equal(showHealthConnectionPrompt(true, migrated.hasConnected), false);
    }
  });
  it('does not activate a malformed source or revive unsupported metrics', () => {
    const value = restoreHealthPreference(JSON.stringify({ enabled: true, selected: ['Steps', 'unknown'], source: { id: '', name: 'All apps' }, hasConnected: false }));
    assert.equal(value.enabled, false);
    assert.deepEqual(value.selected, ['Steps']);
    assert.equal(value.source, null);
    assert.equal(value.hasConnected, false);
  });
});
