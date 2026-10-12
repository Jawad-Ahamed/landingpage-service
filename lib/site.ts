// Site-wide constants. NEXT_PUBLIC_SITE_URL is the canonical origin (set it to the real domain at launch).
export const SITE = {
  name: 'MetaWurks',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://metawurks-landing.vercel.app').replace(/\/$/, ''),
  tagline: 'Private AI agents for accounting, law & healthcare firms',
  description:
    "Private AI agents for accounting, law and healthcare firms. MetaWurks runs your firm's admin: it pulls, matches and drafts inside the tools you already use. You review, your data is never sold.",
  email: 'admin@metawurks.com',
  phone: '+1 914-265-5072',
  address: '16192 Coastal Hwy, Lewes, DE 19958',
  appUrl: 'https://apps.metawurks.com',
  bookingUrl: 'https://calendly.com/gtm-metawurks/30min',
  // Search engines index the site only when this is explicitly turned on (after pending claims are confirmed).
  indexable: process.env.NEXT_PUBLIC_INDEXABLE === 'true',
};

export type NavLink = { label: string; href: string };

export const bookHref = (source: string) => `${SITE.bookingUrl}?utm_source=${source}`;

/** "QuickBooks'" vs "Xero's" */
export const possessive = (name: string) => (/s$/i.test(name) ? `${name}'` : `${name}'s`);
