// One-off: Title Case the text of every h1–h3 in content/home/sections.html (tags and attributes untouched).
import { readFileSync, writeFileSync } from 'node:fs';
import { titleCase } from '../lib/titleCase';

const file = 'content/home/sections.html';
const html = readFileSync(file, 'utf8');
const out = html.replace(/(<h([1-3])\b[^>]*>)([\s\S]*?)(<\/h\2>)/g, (_m, open, _l, inner: string, close) => {
  const bits = inner.split(/(<[^>]+>)/);
  const texts = bits.map((b, i) => ({ b, i })).filter(x => !x.b.startsWith('<') && x.b.trim());
  let prev = '';
  for (const [k, t] of texts.entries()) {
    const start = k === 0 || /[.:?!]\s*$/.test(prev);
    bits[t.i] = titleCase(t.b, { start, end: k === texts.length - 1 });
    prev = t.b;
  }
  return open + bits.join('') + close;
});
writeFileSync(file, out);
