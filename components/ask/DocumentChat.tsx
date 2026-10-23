'use client';
// "Ask your documents" composer: attach files, ask a question, and pick Normal or Private mode for the conversation.
// Sending a question with an attachment in Normal mode opens a privacy check first (see lib/ask/submission.ts).
// This is a local preview: files are read by name and size only and never leave the browser, and no AI model is
// connected, so a sent question gets a plain "preview" note instead of an answer.
import { useEffect, useReducer, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Incognito } from '@/components/home/PrivateMode';
import { initialState, reduce } from '@/lib/ask/submission';
import type { Attachment, Mode } from '@/lib/ask/submission';

const SEND_DELAY = 700;   // a short, visible "sending" step so repeat clicks have something to bounce off
const MODE_LABEL: Record<Mode, string> = { normal: 'Normal mode', private: 'Private mode' };

const fmtSize = (b: number) => (b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
const fileLabel = (a: Attachment[]) => a.map(f => f.name).join(', ');

export default function DocumentChat() {
  const [state, dispatch] = useReducer(reduce, undefined, () => initialState());
  const [question, setQuestion] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [ready, setReady] = useState(false);   // false until React has taken over the server-rendered composer
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const backToDraft = useRef(false);   // set by Cancel/Escape: focus returns to the question once the dialog has closed
  const { mode, status, pending } = state;
  const lastSent = state.sent.at(-1)?.id;

  // On a slow first load the composer is visible before React takes it over. Anything typed by then (or a draft the
  // browser restored) is in the textarea but not in state, which left Send disabled and the privacy check unreachable.
  // Adopt that text once React is in control; the controls that need React stay disabled until then.
  useEffect(() => {
    const typed = input.current?.value;
    if (typed) setQuestion(typed);
    setReady(true);
  }, []);

  // Open or close the native modal dialog with the flow (it traps focus and makes the page behind it inert).
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (status === 'review' && !d.open) {
      d.showModal();
      d.querySelector<HTMLButtonElement>('.dq-dialog__btn--primary')?.focus();   // the safest choice gets focus
    }
    if (status !== 'review') {
      if (d.open) d.close();   // closing returns focus to the Send button that opened it…
      if (backToDraft.current) { backToDraft.current = false; input.current?.focus(); }   // …so after Cancel, move it on afterwards
    }
  }, [status]);

  // "Process" the released submission once. The mode is already final here: it changed in the same step.
  useEffect(() => {
    if (status !== 'sending' || !pending) return;
    const t = setTimeout(() => dispatch({ type: 'delivered', id: pending.id }), SEND_DELAY);
    return () => clearTimeout(t);
  }, [status, pending]);

  // Delivered: clear the composer for the next question.
  useEffect(() => {
    if (!lastSent) return;
    setQuestion('');
    setFiles([]);
    input.current?.focus();
  }, [lastSent]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    dispatch({ type: 'submit', draft: { question, attachments: files } });
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };
  const cancel = () => { backToDraft.current = true; dispatch({ type: 'cancel' }); };
  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const added = [...list].map(f => ({ id: `${f.name}-${f.size}-${f.lastModified}`, name: f.name, size: f.size }));
    setFiles(cur => [...cur, ...added.filter(a => !cur.some(c => c.id === a.id))]);
    if (picker.current) picker.current.value = '';   // so the same file can be picked again after removing it
  };

  const busy = !ready || status !== 'idle';
  const reviewFiles = pending?.attachments ?? [];

  return (
    <div className={`dq${mode === 'private' ? ' is-private' : ''}`} data-mode={mode} data-status={status}>
      <div className="dq__top">
        <div className="pm-switch dq__switch" role="group" aria-label="Conversation mode">
          <button type="button" aria-pressed={mode === 'normal'} disabled={busy} onClick={() => dispatch({ type: 'setMode', mode: 'normal' })}>Normal mode</button>
          <button type="button" aria-pressed={mode === 'private'} disabled={busy} onClick={() => dispatch({ type: 'setMode', mode: 'private' })}><Incognito />Private mode</button>
          <i className="pm-switch__pill" data-on={mode === 'private' ? 'private' : 'public'} aria-hidden="true" />
        </div>
        <p className="dq__mode" role="status" id="ask-mode">This conversation is in <b>{MODE_LABEL[mode]}</b>.</p>
      </div>

      <ol className="dq__thread" aria-label="Conversation" aria-live="polite">
        {state.sent.length === 0 && <li className="dq__empty">Attach a file, ask a question about it, then send. Nothing leaves this page.</li>}
        {state.sent.map(m => (
          <li key={m.id} className="dq__turn">
            <div className="dq__msg">
              <p>{m.question}</p>
              {m.attachments.length > 0 && <ul className="dq__files">{m.attachments.map(a => <li key={a.id} className="dq__file"><svg aria-hidden="true"><use href="#i-file" /></svg>{a.name}</li>)}</ul>}
              <span className={`dq__badge dq__badge--${m.mode}`}>{m.mode === 'private' && <Incognito />}Sent in {MODE_LABEL[m.mode]}</span>
            </div>
            <p className="dq__note">Preview only: no AI model is connected to this page, so there&apos;s no answer here. {m.attachments.length ? 'Your file stayed in this browser tab.' : 'Your question stayed in this browser tab.'}</p>
          </li>
        ))}
      </ol>

      <form className="dq__composer" onSubmit={submit} aria-label="Ask a question about your documents" aria-busy={status === 'sending'}>
        <label className="sr-only" htmlFor="ask-q">Your question</label>
        <textarea id="ask-q" ref={input} rows={2} value={question} placeholder="Ask anything about your documents…"
          onChange={e => setQuestion(e.target.value)} onKeyDown={onKey} readOnly={ready && busy} autoComplete="off" aria-describedby="ask-mode" />
        {files.length > 0 && (
          <ul className="dq__files" aria-label="Attached files">
            {files.map(f => (
              <li key={f.id} className="dq__file">
                <svg aria-hidden="true"><use href="#i-file" /></svg>{f.name}<small>{fmtSize(f.size)}</small>
                <button type="button" disabled={busy} aria-label={`Remove ${f.name}`} onClick={() => setFiles(cur => cur.filter(c => c.id !== f.id))}>×</button>
              </li>
            ))}
          </ul>
        )}
        <div className="dq__tools">
          <input ref={picker} id="ask-file" type="file" multiple className="sr-only" tabIndex={-1} disabled={busy}
            accept=".pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.png,.jpg,.jpeg" onChange={e => addFiles(e.target.files)} />
          <button type="button" className="dq__attach" disabled={busy} onClick={() => picker.current?.click()}>
            <svg aria-hidden="true"><use href="#i-plus" /></svg>Attach file
          </button>
          <span className="dq__grow" />
          <span className={`dq__chip${mode === 'private' ? ' is-private' : ''}`} aria-hidden="true">{mode === 'private' ? <><Incognito />Private mode</> : 'Normal mode'}</span>
          <button type="submit" className="dq__send" disabled={busy || !question.trim()}>
            <svg aria-hidden="true"><use href="#i-send" /></svg><span>{status === 'sending' ? 'Sending…' : 'Send'}</span>
          </button>
        </div>
      </form>

      <dialog ref={dialog} className="dq-dialog" aria-labelledby="dq-dialog-h" aria-describedby="dq-dialog-body"
        onCancel={e => { e.preventDefault(); cancel(); }} onClose={() => { if (status === 'review') cancel(); }}>
        <span className="dq-dialog__ico" aria-hidden="true"><Incognito /></span>
        <h2 id="dq-dialog-h">Review your document&apos;s privacy</h2>
        <div id="dq-dialog-body">
          <p>Your document may contain confidential or sensitive information. You&apos;re currently using <b>Normal mode</b>. Before continuing, consider whether this document should be handled in <b>Private mode</b>.</p>
          <p className="dq-dialog__fine">Private mode is designed to answer with MetaWurks&apos; own model instead of an outside AI provider. This check doesn&apos;t read your file; it appears whenever a question with an attachment is sent in Normal mode.</p>
        </div>
        {reviewFiles.length > 0 && (
          <p className="dq-dialog__files"><svg aria-hidden="true"><use href="#i-file" /></svg><span><span className="sr-only">Attached: </span>{fileLabel(reviewFiles)}</span></p>
        )}
        <div className="dq-dialog__actions">
          <button type="button" className="dq-dialog__btn dq-dialog__btn--primary" disabled={status !== 'review'} onClick={() => dispatch({ type: 'switchToPrivate' })}>
            <Incognito />Switch to Private mode
          </button>
          <button type="button" className="dq-dialog__btn" disabled={status !== 'review'} onClick={() => dispatch({ type: 'continueNormal' })}>Continue in Normal mode</button>
          <button type="button" className="dq-dialog__btn dq-dialog__btn--text" disabled={status !== 'review'} onClick={cancel}>Cancel and review document</button>
        </div>
      </dialog>
    </div>
  );
}
