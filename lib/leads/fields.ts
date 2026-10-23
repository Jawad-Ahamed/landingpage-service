// Field rules shared by the form (labels and required markers) and the server (validation). No zod here, so
// the client bundle stays small.
export const LEAD_KINDS = ['book', 'contact', 'resource', 'newsletter', 'roi'] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];

export type LeadField = 'name' | 'email' | 'firm' | 'firmType' | 'topic' | 'message';

/** Fields a person must fill in, per form kind. Email is always required. */
export const REQUIRED: Record<LeadKind, LeadField[]> = {
  book: ['name', 'email'],
  contact: ['name', 'email', 'message'],
  resource: ['name', 'email'],
  newsletter: ['email'],
  roi: ['name', 'email'],
};

export const TOPICS = [
  { value: 'sales', label: 'Evaluating MetaWurks for my firm' },
  { value: 'customer', label: 'I\'m an existing customer' },
  { value: 'privacy', label: 'Privacy or data request' },
  { value: 'general', label: 'Something else' },
] as const;

export const FIELD_LABEL: Record<LeadField, string> = {
  name: 'your name',
  email: 'your work email',
  firm: 'your firm',
  firmType: 'the type of firm',
  topic: 'a topic',
  message: 'a message',
};
