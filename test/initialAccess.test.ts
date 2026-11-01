import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { requestInitialAccess } from '../src/features/onboarding/initialAccess.ts';

describe('Native access without an interstitial', () => {
  it('remembers the attempt before presenting sequential dialogs and continues after a denial', async () => {
    const calls: string[] = [];
    await requestInitialAccess({ alreadyAsked: async () => false, active: () => true,
      rememberAttempt: async () => { calls.push('remember'); },
      notifications: async () => { calls.push('notifications'); throw new Error('declined'); },
      motion: async () => { calls.push('motion'); },
    });
    assert.deepEqual(calls, ['remember', 'notifications', 'motion']);
  });
  it('does not repeat dialogs for a returning account or request access after sign-out', async () => {
    for (const [asked, active] of [[true, true], [false, false]]) {
      const unexpected = async () => { assert.fail('No access request should run'); };
      await requestInitialAccess({ alreadyAsked: async () => asked, active: () => active,
        rememberAttempt: unexpected, notifications: unexpected, motion: unexpected });
    }
  });
  it('does not open the next dialog after leaving the account', async () => {
    let active = true;
    await requestInitialAccess({ alreadyAsked: async () => false, active: () => active,
      rememberAttempt: async () => {}, notifications: async () => { active = false; },
      motion: async () => { assert.fail('Account is no longer active'); },
    });
  });
});
