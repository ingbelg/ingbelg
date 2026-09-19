import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Eén schakelaar voor livegang: src/data/site-facts.json → "launched" + "siteUrl".
//  - launched:false  → site = preview-domein, pagina's krijgen noindex, robots.txt zonder sitemap.
//  - launched:true   → site = siteUrl (het echte domein), pagina's zijn indexeerbaar, sitemap wordt gemeld.
// Canonical-tags, Open Graph, JSON-LD, sitemap.xml en robots.txt volgen automatisch deze waarde.
const facts = JSON.parse(readFileSync(new URL('./src/data/site-facts.json', import.meta.url), 'utf8'));
const PREVIEW_URL = 'https://ingbelg.vercel.app';

// Output is 'server' so /api/contact can run server-side logic,
// while index.astro sets `export const prerender = true` to stay fully static.
// Hosted on Vercel — swap the adapter (vercel -> node/netlify) if the host
// ever changes, no other code changes needed.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: facts.launched ? facts.siteUrl : PREVIEW_URL,
});
