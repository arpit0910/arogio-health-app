import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { exercises, exerciseDuration, exercisePosition, clockTime } from '../src/features/meditation/exercises.ts';

describe('Meditation session timing', () => {
  it('matches the advertised exercise durations', () => {
    assert.deepEqual(exercises.map(exerciseDuration), [120, 180, 300, 120, 300, 60, 120, 150, 180]);
  });
  it('changes breathing phases at the boundary and repeats without a hold', () => {
    const exercise = exercises[0];
    assert.equal(exercisePosition(exercise, 3.9)?.step.title, 'Breathe in');
    assert.equal(exercisePosition(exercise, 4)?.step.title, 'Breathe out');
    assert.equal(exercisePosition(exercise, 8)?.step.title, 'Breathe in');
    assert.equal(exercisePosition(exercise, 119)?.remaining, 1);
    assert.equal(exercisePosition(exercise, 120), null);
    assert.equal(exercisePosition(exercise, 150), null);
  });
  it('advances across delayed ticks without losing the current instruction', () => {
    const exercise = exercises[1];
    assert.equal(exercisePosition(exercise, -1)?.step.title, 'Settle in');
    assert.equal(exercisePosition(exercise, 30)?.step.title, 'Notice your breath');
    assert.equal(exercisePosition(exercise, 95)?.step.title, 'Return gently');
    assert.equal(exercisePosition(exercise, 150)?.step.title, 'Take your time');
    assert.equal(exercisePosition(exercise, 180), null);
  });
  it('formats remaining seconds without a negative or premature zero', () => {
    assert.equal(clockTime(119.2), '2:00');
    assert.equal(clockTime(0.2), '0:01');
    assert.equal(clockTime(-1), '0:00');
  });
});
