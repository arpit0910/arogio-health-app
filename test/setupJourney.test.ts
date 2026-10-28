import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resumeSetup, setupPayload, validateSetupStep } from '../src/features/profile/setupJourney.ts';
import { profileDraft } from '../src/features/profile/profileViewModel.ts';
import type { SafeUser } from '../src/features/auth/types.ts';

const empty = profileDraft({ profileSetup: {} } as SafeUser);
const ready = { ...empty, healthGoals: ['improve_sleep'], dateOfBirth: '2001-03-17', weightValue: '70', heightValue: '170', activityLevel: 'lightly_active' };
describe('Three-step setup journey', () => {
  it('resumes legacy and new drafts at the first unfinished required task', () => {
    assert.equal(resumeSetup(empty), 0);
    assert.equal(resumeSetup({ ...empty, healthGoals: ['improve_sleep'] }), 1);
    assert.equal(resumeSetup({ ...ready, activityLevel: '' }), 2);
    assert.equal(resumeSetup(ready), 2);
  });
  it('allows goals before measurements but never marks incomplete health data complete', () => {
    assert.equal(validateSetupStep({ ...empty, healthGoals: ['improve_sleep'] }, 0), null);
    assert.ok(validateSetupStep(empty, 0));
    assert.ok(validateSetupStep({ ...ready, weightValue: '' }, 1));
    assert.ok(validateSetupStep({ ...ready, activityLevel: '' }, 2));
    assert.ok(validateSetupStep({ ...ready, healthGoals: [] }, 2));
    assert.equal(validateSetupStep(ready, 2), null);
  });
  it('keeps server step compatibility, optional data and update choices without inventing measurements', () => {
    const first = setupPayload({ ...empty, healthGoals: ['improve_sleep'] }, 0);
    assert.equal(first.step, 1);
    assert.equal(first.complete, false);
    assert.equal('weightValue' in first, false);
    assert.equal('heightValue' in first, false);
    assert.equal(setupPayload(ready, 1).step, 2);
    const last = setupPayload({ ...ready, gender: 'female', location: 'Jaipur', productUpdates: false }, 2);
    assert.equal(last.step, 7);
    assert.equal(last.complete, true);
    assert.equal(last.weightValue, 70);
    assert.equal(last.location, 'Jaipur');
    assert.equal(last.productUpdates, false);
  });
  it('requires explicit opt-in for new update preferences and preserves existing consent', () => {
    assert.equal(empty.healthReminders, false);
    assert.equal(empty.tipsAndInsights, false);
    assert.equal(empty.productUpdates, false);
    assert.equal(profileDraft({ profileSetup: { healthReminders: true } } as SafeUser).healthReminders, true);
  });
});
