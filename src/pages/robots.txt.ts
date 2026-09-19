import type { APIRoute } from 'astro';
import facts from '../data/site-facts.json';

export const prerender = true;

// robots.txt volgt de livegang-schakelaar (site-facts.json → launched).
// Voor livegang laten we crawlers toe om de noindex-meta te zien (een geblokkeerde pagina kan
// zijn noindex niet tonen); de sitemap melden we pas op het echte domein.
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(facts.siteUrl)).toString().replace(/\/$/, '');
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /api/'];
  if (facts.launched) lines.push('', `Sitemap: ${base}/sitemap.xml`);
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
