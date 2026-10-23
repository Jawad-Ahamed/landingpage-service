'use client';
// The footer's email link. The footer lives in the root layout, which never sees the path, so this small client
// piece picks the address: the services pricing sheet's address on /services, the site address everywhere else.
import { usePathname } from 'next/navigation';
import { SERVICES_EMAIL, SITE } from '@/lib/site';

export default function FooterEmail() {
  const email = usePathname() === '/services' ? SERVICES_EMAIL : SITE.email;
  return <a href={`mailto:${email}`}>{email}</a>;
}
