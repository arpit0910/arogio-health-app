import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { conversationForQuestion, type ChatMessage } from '../src/features/chat/model.ts';
describe('Jeeva conversation context', () => {
  it('trims questions and preserves follow-up turns in order', () => {
    const history: ChatMessage[] = [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hi' }];
    assert.deepEqual(conversationForQuestion(history, '  Next question  '), [...history, { role: 'user', content: 'Next question' }]);
    assert.equal(history.length, 2);
  });
  it('drops whole oldest turns to fit message and character budgets', () => {
    const history: ChatMessage[] = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `${i}` }));
    const bounded = conversationForQuestion(history, 'Question');
    assert.equal(bounded.length, 21);
    assert.equal(bounded[0].content, '10');
    const large: ChatMessage[] = history.map(message => ({ ...message, content: 'x'.repeat(2000) }));
    const boundedLarge = conversationForQuestion(large, 'Question');
    assert.ok(boundedLarge.reduce((sum, message) => sum + message.content.length, 0) <= 20000);
    assert.equal(boundedLarge[0].role, 'user');
    assert.equal(boundedLarge.at(-1)?.role, 'user');
  });
  it('rejects blank/oversized questions and excludes unfinished or oversized old replies', () => {
    assert.throws(() => conversationForQuestion([], ' '));
    assert.throws(() => conversationForQuestion([], 'x'.repeat(2001)));
    assert.equal(conversationForQuestion([{ role: 'user', content: 'Unanswered' }], 'New question').length, 1);
    assert.equal(conversationForQuestion([{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'x'.repeat(5000) }], 'New question').length, 1);
  });
});
