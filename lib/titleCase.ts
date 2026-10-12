// Headline Title Case (Chicago-style): capitalise every word except short articles, conjunctions and
// prepositions, unless first or last. Words that already carry deliberate capitals (MetaWurks, IRC, iManage,
// eClinicalWorks, 1:1, URLs) are left alone. Used for every h1–h3 on the site.
const MINOR = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet', 'as', 'at', 'by', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via', 'vs', 'vs.', 'from', 'into', 'with', 'over']);

function capWord(w: string): string {
  if (!/^[a-z]/.test(w)) return w;                    // starts with a digit, symbol or capital
  if (/[A-Z]/.test(w.slice(1))) return w;             // mixed case is intentional (iManage, eClinicalWorks)
  return w.charAt(0).toUpperCase() + w.slice(1);
}

// `start`/`end` say whether this piece begins or ends the whole headline (for headlines split across spans).
export function titleCase(s: string, { start = true, end = true }: { start?: boolean; end?: boolean } = {}): string {
  const parts = s.split(/(\s+)/);
  const words = parts.map((p, i) => ({ p, i })).filter(x => x.p.trim());
  const first = words[0]?.i;
  const last = words[words.length - 1]?.i;
  return parts.map((p, i) => {
    if (!p.trim() || p.startsWith('&')) return p;                // whitespace, or an HTML entity like &amp;
    const lead = p.match(/^[^A-Za-z0-9]*/)![0];
    const core = p.slice(lead.length);
    const bare = core.replace(/[^A-Za-z.]+$/, '').toLowerCase();
    const prevEndsSentence = i > 1 && /[.:?!—–]$/.test(parts[i - 2] || '');
    if (MINOR.has(bare) && !(start && i === first) && !(end && i === last) && !prevEndsSentence && core === core.toLowerCase()) return p;
    return lead + core.split('-').map((w, k) => (k > 0 && MINOR.has(w.toLowerCase()) ? w : capWord(w))).join('-');
  }).join('');
}

// A headline split into a plain part and a highlighted part (title + <span class="hl">).
export function titlePair(a: string, b?: string): [string, string] {
  const ta = titleCase(a, { end: !b });
  return [ta, b ? titleCase(b, { start: /[.:?!]\s*$/.test(a) }) : ''];
}
