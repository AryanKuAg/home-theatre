import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Emit a fully static site (plain HTML/CSS/JS) instead of a server build,
  // so the output can be uploaded straight to an R2 bucket.
  output: 'export',
  distDir: 'dist',
  // Sites are served from a subpath (/template-sites/<slug>/), not the domain
  // root, so asset URLs must be relative to the page rather than absolute.
  // Static export only. `next dev` cannot serve a relative asset
  // prefix — it emits ./_next/... URLs that resolve against the wrong
  // directory, so nothing hydrates and the page sits on its loader.
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : undefined,
  // The default image loader needs a server; static export requires this.
  images: { unoptimized: true },
  // Pin the workspace root. Stray lockfiles further up the filesystem
  // otherwise make Next infer the home directory as the root.
  turbopack: { root: __dirname },
};

export default nextConfig;
