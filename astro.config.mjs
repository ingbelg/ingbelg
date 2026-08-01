import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Output is 'server' so /api/contact can run server-side logic,
// while index.astro sets `export const prerender = true` to stay fully static.
// Hosted on Vercel — swap the adapter (vercel -> node/netlify) if the host
// ever changes, no other code changes needed.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
});
