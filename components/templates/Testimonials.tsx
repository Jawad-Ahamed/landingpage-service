import { TESTIMONIALS, type Testimonial } from '@/content/data/testimonials';
import { SectionHead } from './blocks';
import { Stagger, StaggerItem } from '@/components/motion/Motion';

// Real customer quotes only (see content/data/testimonials.ts). Renders nothing until there are some.
export default function Testimonials({ vertical, title = 'Firms that handed off', hl = 'the busywork.' }: { vertical?: Testimonial['vertical']; title?: string; hl?: string }) {
  const items = TESTIMONIALS.filter(t => !vertical || t.vertical === vertical).slice(0, 3);
  if (!items.length) return null;
  return (
    <section className="section" aria-labelledby="tm-h">
      <div className="container">
        <SectionHead eyebrow="From our customers" title={title} hl={hl} />
        <Stagger className="tm">
          {items.map(t => (
            <StaggerItem key={t.name} as="article" className="tm__card">
              <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
              <div className="tm__who">
                <span className="tm__avatar">{t.photo ? <img src={t.photo} alt="" /> : t.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
                <span><b>{t.name}</b>{t.role}, {t.firm}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
