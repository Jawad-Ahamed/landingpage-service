import Link from 'next/link';
import { Fragment } from 'react';

// Renders the tiny inline markup used in content strings: **bold** and [label](/href). Nothing else.
export default function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        const b = /^\*\*([^*]+)\*\*$/.exec(p);
        if (b) return <strong key={i}>{b[1]}</strong>;
        const l = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
        if (l) return l[2].startsWith('/') ? <Link key={i} href={l[2]}>{l[1]}</Link> : <a key={i} href={l[2]} rel="noopener" target="_blank">{l[1]}</a>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}
