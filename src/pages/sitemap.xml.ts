import type { APIRoute } from 'astro';

export const prerender = true;

const PAGES = ['/', '/privacybeleid', '/cookiebeleid'];

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') || '';
  const urls = PAGES.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
