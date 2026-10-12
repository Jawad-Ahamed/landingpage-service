// Fails if any content states a blocked claim affirmatively (e.g. "we are HIPAA compliant", "SOC 2 certified").
// Negations ("we don't claim HIPAA compliance") are fine. Run: npm run check:claims
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'components', 'content'];
const SKIP = new Set(['content/data/claims.ts']);
const BAD = [
  /\b(?:is|are|we're|we are|fully|100%)\s+HIPAA[- ]compliant/i,
  /\bHIPAA[- ]certified\b/i,
  /\bSOC ?2(?: Type (?:I|II|1|2))?[- ](?:certified|compliant|audited)\b/i,
  /\bwe (?:will |)sign (?:a |your )?BAA\b/i,
  /\bbank[- ]grade\b/i,
  /\bmilitary[- ]grade\b/i,
];

const files = [];
const walk = d => readdirSync(d).forEach(f => { const p = path.join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(tsx?|md|html)$/.test(f) && files.push(p); });
ROOTS.forEach(walk);

let fails = 0;
for (const f of files) {
  if (SKIP.has(f)) continue;
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    for (const re of BAD) if (re.test(line) && !/\b(?:don't|do not|not|never|no)\b[^.]{0,40}$/i.test(line.split(re)[0])) {
      console.error(`${f}:${i + 1}  ${line.trim().slice(0, 140)}`); fails++;
    }
  });
}
if (fails) { console.error(`\n${fails} blocked claim(s) found.`); process.exit(1); }
console.log(`check-claims: ${files.length} files clean.`);
