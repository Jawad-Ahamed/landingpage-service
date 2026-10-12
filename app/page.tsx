import { readFileSync } from 'node:fs';
import path from 'node:path';
import HomeEffects from '@/components/home/HomeEffects';

// The home page markup is the original landing page, served as static HTML (fully crawlable).
// Its demos are mounted by HomeEffects. Sections will move into React components as they are reworked.
const sections = readFileSync(path.join(process.cwd(), 'content/home/sections.html'), 'utf8');

export default function HomePage() {
  return (
    <>
      <main id="main" dangerouslySetInnerHTML={{ __html: sections }} />
      <HomeEffects />
    </>
  );
}
