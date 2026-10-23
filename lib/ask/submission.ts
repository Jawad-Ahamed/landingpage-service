// Submission flow for the "Ask your documents" composer. A question sent with an attachment in Normal mode
// stops at a privacy check first; the visitor then switches to Private mode, continues in Normal mode, or goes
// back to review the draft. Pure and dependency-free so it can be tested with `node --test`.
//
// The check never inspects the file: it can't tell whether a document is confidential, so it asks every time
// a question goes out with an attachment in Normal mode.

export type Mode = 'normal' | 'private';
export type Attachment = { id: string; name: string; size: number };
export type Draft = { question: string; attachments: Attachment[] };
export type Sent = { id: number; question: string; attachments: Attachment[]; mode: Mode };

export type State = {
  mode: Mode;
  /** idle: composer open · review: privacy check showing · sending: one submission in flight */
  status: 'idle' | 'review' | 'sending';
  pending: (Draft & { id: number }) | null;
  sent: Sent[];
  nextId: number;
};

export type Action =
  | { type: 'submit'; draft: Draft }
  | { type: 'switchToPrivate' }
  | { type: 'continueNormal' }
  | { type: 'cancel' }
  | { type: 'setMode'; mode: Mode }
  | { type: 'delivered'; id: number };

export const initialState = (mode: Mode = 'normal'): State => ({ mode, status: 'idle', pending: null, sent: [], nextId: 1 });

export const needsPrivacyCheck = (mode: Mode, draft: Draft) => mode === 'normal' && draft.attachments.length > 0;

export function reduce(s: State, a: Action): State {
  switch (a.type) {
    case 'submit': {
      // One submission at a time: repeat clicks while the check is open or a send is in flight do nothing.
      if (s.status !== 'idle' || !a.draft.question.trim()) return s;
      const pending = { question: a.draft.question.trim(), attachments: a.draft.attachments, id: s.nextId };
      return { ...s, nextId: s.nextId + 1, pending, status: needsPrivacyCheck(s.mode, a.draft) ? 'review' : 'sending' };
    }
    // The mode changes in the same step that releases the submission, so it's never sent in Normal mode first.
    case 'switchToPrivate':
      return s.status === 'review' ? { ...s, mode: 'private', status: 'sending' } : s;
    case 'continueNormal':
      return s.status === 'review' ? { ...s, status: 'sending' } : s;
    // Back to the composer; the draft itself lives in the composer and is left as it was.
    case 'cancel':
      return s.status === 'review' ? { ...s, status: 'idle', pending: null } : s;
    case 'setMode':
      return s.status === 'idle' ? { ...s, mode: a.mode } : s;
    case 'delivered': {
      const p = s.pending;
      if (s.status !== 'sending' || !p || p.id !== a.id) return s;
      return { ...s, status: 'idle', pending: null, sent: [...s.sent, { id: p.id, question: p.question, attachments: p.attachments, mode: s.mode }] };
    }
  }
}
