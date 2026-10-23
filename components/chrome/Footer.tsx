import Link from 'next/link';
import { Lockup } from './Nav';
import { SITE } from '@/lib/site';
import Year from './Year';
import FooterEmail from './FooterEmail';
import type { FooterCol } from '@/lib/menu';

export default function Footer({ cols }: { cols: FooterCol[] }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__about">
            <Link className="brand" href="/" aria-label="MetaWurks home"><Lockup size={58} /></Link>
            <p>Less admin. More judgment.</p>
            <p style={{ marginTop: 10 }}>{SITE.address}<br />{SITE.phone} · <FooterEmail /></p>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <h2>{c.title}</h2>
              <ul>{c.links.map(l => <li key={l.label}>{l.href.startsWith('mailto:') ? <a href={l.href}>{l.label}</a> : <Link href={l.href}>{l.label}</Link>}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="footer__base">
          <span>© <Year /> MetaWurks</span>
        </div>
      </div>
    </footer>
  );
}
