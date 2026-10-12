// No-JS fallback for forms: a plain POST, then a redirect to the thanks page (or back with an error flag).
import { NextResponse } from 'next/server';
import { submitLead } from '@/lib/leads/submit';

export async function POST(req: Request) {
  const form = Object.fromEntries((await req.formData()).entries());
  const res = await submitLead(form);
  const back = typeof form.page === 'string' && form.page.startsWith('/') ? form.page : '/';
  const next = typeof form.next === 'string' && form.next.startsWith('/') ? form.next : back;
  return NextResponse.redirect(new URL(res.ok ? next : `${back}?error=1`, req.url), 303);
}
