import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this project. Next otherwise picks the highest lockfile it finds, and a stray
  // package-lock.json further up (e.g. in the home folder) made Turbopack watch that whole tree. Next always runs
  // from this folder (npm scripts, Dockerfile WORKDIR /app), and this also sets outputFileTracingRoot.
  turbopack: { root: process.cwd() },
  // Self-contained server bundle for the Docker image (Cloud Run).
  output: 'standalone',
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
