// Customer testimonials. Only add quotes from real people, with their written permission, exactly as they
// said them (light edits for length are fine if they approve). The section stays hidden while this list is empty.
// FTC rules (16 CFR Part 465) prohibit fake or AI-written reviews and testimonials presented as genuine.
export type Testimonial = {
  quote: string;
  name: string;
  role: string;             // e.g. "Managing Partner"
  firm: string;             // e.g. "Lindqvist & Ortega CPAs"
  vertical: 'acct' | 'legal' | 'health' | 'fin';
  photo?: string;           // /assets/people/*.jpg (with permission)
  consentOn: string;        // date written permission was given, e.g. "2026-10-20"
};

export const TESTIMONIALS: Testimonial[] = [
  // {
  //   quote: '…',
  //   name: '…', role: '…', firm: '…', vertical: 'acct', consentOn: 'YYYY-MM-DD',
  // },
];
