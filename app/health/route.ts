// Liveness probe for the container and the CI smoke test. Never cached, never indexed.
export const dynamic = 'force-dynamic';

export function GET() {
  return new Response('ok\n', { headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' } });
}
