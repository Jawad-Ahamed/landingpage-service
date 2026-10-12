import { readFileSync } from 'node:fs';
import path from 'node:path';

// The shared <symbol> sprite (icons are used as <svg><use href="#i-…"/></svg> across every page).
const sprite = readFileSync(path.join(process.cwd(), 'content/home/sprite.svg'), 'utf8');

export default function IconSprite() {
  return <div aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: sprite }} />;
}
