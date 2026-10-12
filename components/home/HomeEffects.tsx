'use client';
// Mounts the home page's interactive demos (ported vanilla code in lib/home/initHome.ts) and tears them down on navigation.
import { useEffect } from 'react';
import { initHome } from '@/lib/home/initHome';

export default function HomeEffects() {
  useEffect(() => {
    const main = document.getElementById('main');
    return main ? initHome(main) : undefined;
  }, []);
  return null;
}
