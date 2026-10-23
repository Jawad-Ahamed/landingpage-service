// No-JS fallback for forms: a plain POST, then a redirect to the thanks page (or back with an error flag).
import { NextResponse } from 'next/server';
import { submitLead } from '@/lib/leads/submit';

const MAX_BYTES = 64 * 1024;   // a full contact form is a few KB; anything bigger isn't a person typing

// Only same-site paths may be redirect targets: "//evil.example" and "/\evil.example" are other origins to a browser.
function samePath(v: unknown, req: Request): string | null {
  if (typeof v !== 'string' || !v.startsWith('/') || v.startsWith('//') || /[\u0000-\u001f\u007f\\]/.test(v)) return null;
  try {
    const base = new URL(req.url);
    const u = new URL(v, base);
    return u.origin === base.origin ? `${u.pathname}${u.search}` : null;
  } catch { return null; }
}

// Reads the body but stops at MAX_BYTES, so a missing or lying Content-Length can't make us buffer more.
async function readCapped(req: Request): Promise<Uint8Array<ArrayBuffer> | null> {
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.byteLength; }
  return out;
}

export async function POST(req: Request) {
  if (Number(req.headers.get('content-length') || 0) > MAX_BYTES) return new NextResponse('Payload too large', { status: 413 });
  const body = await readCapped(req);
  if (!body) return new NextResponse('Payload too large', { status: 413 });
  let form: Record<string, FormDataEntryValue>;
  try {
    const parsed = await new Response(body, { headers: { 'content-type': req.headers.get('content-type') || '' } }).formData();
    form = Object.fromEntries(parsed.entries());
  } catch { return new NextResponse('Bad request', { status: 400 }); }
  const res = await submitLead(form);
  const back = samePath(form.page, req) || '/';
  const next = samePath(form.next, req) || back;
  return NextResponse.redirect(new URL(res.ok ? next : `${back}${back.includes('?') ? '&' : '?'}error=1`, req.url), 303);
}
