import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import '@/styles/site.css';
import '@/styles/pages.css';
import Nav from '@/components/chrome/Nav';
import Footer from '@/components/chrome/Footer';
import IconSprite from '@/components/chrome/IconSprite';
import SiteEffects from '@/components/chrome/SiteEffects';
import { MotionProvider } from '@/components/motion/Motion';
import JsonLd from '@/components/seo/JsonLd';
import { organization } from '@/lib/schema';
import { SITE } from '@/lib/site';
import { getFooter, getMenu } from '@/lib/menu';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  icons: { icon: '/assets/brand/metawurks-icon-64.png', apple: '/assets/brand/metawurks-mark.png' },
  robots: SITE.indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: '#FFFFFF',
};

// 'js' hides content that the page scripts reveal. If the scripts never finish (blocked, failed),
// drop 'js' after 4 s so the html:not(.js) fallbacks show everything.
// Theme: a saved choice wins, otherwise follow the OS; set before first paint so there is no flash.
const BOOT = `(function(r){r.classList.add('js');var t=null;try{t=localStorage.getItem('mw-theme');}catch(e){}if(t!=='dark'&&t!=='light'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}r.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'#0B101C':'#FFFFFF');setTimeout(function(){if(!r.classList.contains('js-ready'))r.classList.remove('js');},4000);})(document.documentElement);`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <IconSprite />
        <MotionProvider>
          <Nav menu={getMenu()} />
          {children}
          <Footer cols={getFooter()} />
        </MotionProvider>
        <SiteEffects />
        <JsonLd data={organization()} />
      </body>
    </html>
  );
}
