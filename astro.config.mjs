import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Output is 'server' so /api/contact can run server-side logic,
// while index.astro sets `export const prerender = true` to stay fully static.
// Hosted on Vercel — swap the adapter (vercel -> node/netlify) if the host
// ever changes, no other code changes needed.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // ⚠️ CONFIRM T-06: huidige Vercel-preview-URL, zet dit op het finale domein
  // (ingbelg.be?) zodra dat bekend is — sitemap.xml en canonical-tags gebruiken dit.
  site: 'https://ingbelg-site.vercel.app',
});
