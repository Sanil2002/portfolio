/**
 * Public site URL for SEO (metadata, sitemap, robots, Open Graph).
 * Uses NEXT_PUBLIC_SITE_URL if set; on Vercel it falls back to the project's
 * production domain automatically; locally, localhost.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/+$/, "");
