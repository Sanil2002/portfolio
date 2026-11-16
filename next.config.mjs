/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  transpilePackages: ['three'],
  // Lets verification builds use a separate folder from the dev server.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    // Local placeholder SVGs only; sandboxed so they can't run scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};
