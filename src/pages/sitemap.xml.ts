import type { APIRoute } from 'astro';
import facts from '../data/site-facts.json';

export const prerender = true;

// Priorities/changefreq zijn bewust weggelaten (Google negeert ze); lastmod = datum van de build.
const PAGES = ['/', '/privacybeleid', '/cookiebeleid'];

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(facts.siteUrl)).toString().replace(/\/$/, '');
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map((p) => `  <url><loc>${base}${p === '/' ? '/' : p}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
