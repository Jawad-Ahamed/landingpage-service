'use client';
// The current year, filled in after mount so the server HTML never disagrees with the visitor's clock.
import { useEffect, useState } from 'react';

export default function Year() {
  const [y, setY] = useState(2026);
  useEffect(() => setY(new Date().getFullYear()), []);
  return <>{y}</>;
}
