import type { APIRoute } from 'astro';
import { parseLead } from '../../lib/contact/validate';
import { buildLeadMessage } from '../../lib/contact/message';
import { contactEnv, deliverLead, json } from '../../lib/contact/deliver';

// Server-side route — draait altijd live, wordt niet mee statisch gebouwd.
export const prerender = false;

// Deze route koppelt alleen de onderdelen: controleren → bericht opstellen → kanalen (src/lib/contact/deliver.ts).
export const POST: APIRoute = async ({ request }) => {
  const parsed = await parseLead(request);
  if (parsed.kind === 'invalid') return json(parsed.status, parsed.payload);
  if (parsed.kind === 'honeypot') return json(200, { ok: true, delivered: false });
  return deliverLead(buildLeadMessage(parsed.data), contactEnv());
};
