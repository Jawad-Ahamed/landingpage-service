'use client';
// SECTION TRANSITIONS (after Adaline and Unizen): no hard section edges, just one continuous canvas.
//   • Seams: a soft radial glow sits on every boundary between top-level sections and blooms as it scrolls
//     through the viewport (CSS scroll-driven animation). Hues drift cobalt → violet → teal down the page.
//   • Beams: each section opens with a thin light beam that drops into a glowing node above its pill label,
//     drawn as the section enters (scroll-linked).
// Everything is an overlay positioned from measurements (nothing injected into section markup), so it works
// on every page. Purely decorative (aria-hidden). Browsers without scroll timelines get the static, finished state.
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type Seam = { y: number; hue: number };
type Beam = { x: number; y: number };

const HUES = ['36,64,187', '139,108,255', '25,181,176'];   // cobalt, violet, teal (the hero's palette)

function measure(): { seams: Seam[]; beams: Beam[] } {
  const secs = Array.from(document.querySelectorAll<HTMLElement>('main#main > section'));
  const seams: Seam[] = [];
  const beams: Beam[] = [];
  secs.forEach((s, k) => {
    const top = s.getBoundingClientRect().top + window.scrollY;
    if (k > 0 && !s.classList.contains('shift')) seams.push({ y: top, hue: k % HUES.length });
    if (k === 0 || s.classList.contains('shift') || s.classList.contains('pg-hero')) return;
    const eb = s.querySelector<HTMLElement>('.eyebrow');
    if (!eb || eb.closest('.final')) return;
    const r = eb.getBoundingClientRect();
    if (r.width === 0) return;
    beams.push({ x: r.left + window.scrollX + Math.min(r.width / 2, 14), y: r.top + window.scrollY });
  });
  return { seams, beams };
}

export default function SectionThread() {
  const pathname = usePathname();
  const [geo, setGeo] = useState<{ seams: Seam[]; beams: Beam[] }>({ seams: [], beams: [] });

  useEffect(() => {
    let raf = 0;
    let t: ReturnType<typeof setTimeout> | undefined;
    const update = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setGeo(measure())); };
    update();
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(update, 120); });
    ro.observe(document.body);
    const late = setTimeout(update, 1400);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); clearTimeout(t); clearTimeout(late); };
  }, [pathname]);

  return (
    <div className="seams" aria-hidden="true">
      {geo.seams.map((s, k) => <span key={`s${k}`} className="seam" style={{ top: s.y, ['--seam' as string]: HUES[s.hue] }} />)}
      {geo.beams.map((b, k) => (
        <span key={`b${k}`} className="beam" style={{ left: b.x, top: b.y }}><i className="beam__line" /><i className="beam__node" /></span>
      ))}
    </div>
  );
}
