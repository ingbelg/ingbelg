import type { APIRoute } from 'astro';
import facts from '../data/site-facts.json';

export const prerender = true;

// Priorities/changefreq zijn bewust weggelaten (Google negeert ze).
// lastmod = datum van de laatste INHOUDELIJKE wijziging van die pagina (met de hand bijhouden).
// Niet de builddatum: dan "wijzigt" elke deploy alle pagina's en negeert Google lastmod.
// Uitlegpagina's: zelfde datum als `updated` in het paginabestand.
// Privacy-/cookiebeleid staan er bewust niet in (geen zoekwaarde; ze blijven gewoon bereikbaar via links).
const PAGES: [string, string][] = [
  ['/', '2026-10-04'],
  ['/hellend-dak', '2026-10-03'],
  ['/plat-dak-epdm', '2026-10-03'],
  ['/asbestdak-vervangen', '2026-10-03'],
  ['/gevelbekleding', '2026-10-03'],
  ['/dakkapel-timmerwerken', '2026-10-03'],
  ['/dakherstelling', '2026-10-04'],
  ['/premies-dakwerken-2026', '2026-10-03'],
  ['/asbestdak-regels', '2026-10-03'],
  ['/renovatieverplichting-epc', '2026-10-04'],
  ['/handig-om-te-weten', '2026-10-04'],
];

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(facts.siteUrl)).toString().replace(/\/$/, '');
  const urls = PAGES.map(([p, lastmod]) => `  <url><loc>${base}${p}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
