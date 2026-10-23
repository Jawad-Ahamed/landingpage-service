// Unit tests for the composer's privacy check (lib/ask/submission.ts). Run: npm test
// Node runs the TypeScript module directly (type stripping), so no build step or test library is needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, needsPrivacyCheck, reduce } from '../lib/ask/submission.ts';

const file = { id: 'letter', name: 'Fictional_Engagement_Letter.txt', size: 2048 };
const withFile = { question: 'Summarize the fee terms', attachments: [file] };
const noFile = { question: 'What is a 1099-NEC?', attachments: [] };
const run = (state, ...actions) => actions.reduce(reduce, state);

test('a question with an attachment in Normal mode stops at the check and is not sent', () => {
  const s = run(initialState(), { type: 'submit', draft: withFile });
  assert.equal(s.status, 'review');
  assert.equal(s.mode, 'normal');
  assert.deepEqual(s.sent, []);
  assert.equal(s.pending.question, 'Summarize the fee terms');
  assert.deepEqual(s.pending.attachments, [file]);
});

test('questions without attachments skip the check', () => {
  const s = run(initialState(), { type: 'submit', draft: noFile });
  assert.equal(s.status, 'sending');
  assert.equal(needsPrivacyCheck('normal', noFile), false);
});

test('attachments sent in Private mode skip the check', () => {
  const s = run(initialState('private'), { type: 'submit', draft: withFile });
  assert.equal(s.status, 'sending');
  assert.equal(needsPrivacyCheck('private', withFile), false);
});

test('Switch to Private mode changes the mode before the question is released, keeping the draft', () => {
  const review = run(initialState(), { type: 'submit', draft: withFile });
  const s = reduce(review, { type: 'switchToPrivate' });
  assert.equal(s.mode, 'private');
  assert.equal(s.status, 'sending');
  assert.deepEqual(s.pending, review.pending);
  assert.deepEqual(s.sent, []);   // nothing went out while the mode was still Normal
  const done = reduce(s, { type: 'delivered', id: s.pending.id });
  assert.deepEqual(done.sent.map(m => [m.mode, m.question, m.attachments]), [['private', withFile.question, [file]]]);
});

test('Continue in Normal mode sends once without changing the mode', () => {
  const s = run(initialState(), { type: 'submit', draft: withFile }, { type: 'continueNormal' });
  assert.equal(s.mode, 'normal');
  const done = reduce(s, { type: 'delivered', id: s.pending.id });
  assert.equal(done.sent.length, 1);
  assert.equal(done.sent[0].mode, 'normal');
  assert.equal(done.mode, 'normal');
});

test('Cancel returns to the composer without sending or changing the mode', () => {
  const s = run(initialState(), { type: 'submit', draft: withFile }, { type: 'cancel' });
  assert.equal(s.status, 'idle');
  assert.equal(s.mode, 'normal');
  assert.equal(s.pending, null);
  assert.deepEqual(s.sent, []);
  // submitting the same draft again asks again: cancelling isn't consent
  assert.equal(reduce(s, { type: 'submit', draft: withFile }).status, 'review');
});

test('the check is not shown again for a submission once a choice is made', () => {
  const s = run(initialState(), { type: 'submit', draft: withFile }, { type: 'continueNormal' }, { type: 'submit', draft: withFile });
  assert.equal(s.status, 'sending');
  const done = reduce(s, { type: 'delivered', id: s.pending.id });
  assert.equal(done.status, 'idle');
  assert.equal(done.sent.length, 1);
});

test('repeated clicks never produce duplicate submissions', () => {
  // double-click Send
  let s = run(initialState(), { type: 'submit', draft: withFile }, { type: 'submit', draft: withFile });
  assert.equal(s.nextId, 2);
  // double-click a choice, plus a stray click on the other choices
  s = run(s, { type: 'switchToPrivate' }, { type: 'switchToPrivate' }, { type: 'continueNormal' }, { type: 'cancel' });
  assert.equal(s.status, 'sending');
  assert.equal(s.mode, 'private');
  const id = s.pending.id;
  s = run(s, { type: 'delivered', id }, { type: 'delivered', id });
  assert.equal(s.sent.length, 1);
});

test('the mode cannot change while a submission is pending', () => {
  const review = run(initialState(), { type: 'submit', draft: withFile });
  assert.equal(reduce(review, { type: 'setMode', mode: 'private' }).mode, 'normal');
  const sending = reduce(review, { type: 'continueNormal' });
  assert.equal(reduce(sending, { type: 'setMode', mode: 'private' }).mode, 'normal');
  assert.equal(reduce(initialState(), { type: 'setMode', mode: 'private' }).mode, 'private');
});

test('blank questions are ignored', () => {
  const s = reduce(initialState(), { type: 'submit', draft: { question: '   ', attachments: [file] } });
  assert.equal(s.status, 'idle');
});
