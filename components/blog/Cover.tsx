// Generated cover art for a post: a soft brand-wallpaper ground with a stack of "paper" sheets carrying the
// post's kicker and glyph. Pure CSS/HTML, crisp at any size, no image files. Tone follows the post's vertical.
import type { Post } from '@/lib/blog';

export default function Cover({ cover, size = 'md', className = '' }: { cover: Post['cover']; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div className={`cv cv--${cover.tone} cv--${size} ${className}`} aria-hidden="true">
      <div className="cv__grid" />
      <div className="cv__sheet cv__sheet--3" />
      <div className="cv__sheet cv__sheet--2" />
      <div className="cv__sheet cv__sheet--1">
        <span className="cv__badge"><svg><use href={`#i-${cover.glyph}`} /></svg></span>
        <span className="cv__kicker">{cover.kicker}</span>
        <span className="cv__lines"><i style={{ width: '88%' }} /><i style={{ width: '72%' }} /><i style={{ width: '80%' }} /><i style={{ width: '46%' }} /></span>
      </div>
    </div>
  );
}
