'use server';
import { submitLead, type SubmitResult } from '@/lib/leads/submit';

export async function sendLead(_prev: SubmitResult | null, form: FormData): Promise<SubmitResult> {
  return submitLead(Object.fromEntries(form.entries()));
}
