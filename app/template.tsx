// Re-mounts on every navigation: a short rise-in (600 ms, expo) so pages feel connected.
// Opacity starts at 0.6, never 0, so the first paint isn't held back.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
