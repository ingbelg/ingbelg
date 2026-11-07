import type { APIRoute } from 'astro';
import { parseMetaLead } from '../../lib/contact/meta-lead';
import { buildLeadMessage } from '../../lib/contact/message';
import { contactEnv, deliverLead, json } from '../../lib/contact/deliver';

export const prerender = false;

// Leads uit het Meta-leadformulier → zelfde e-mail en Odoo-lead als het formulier op de site.
// Afgeschermd met de sleutel META_LEAD_KEY (Vercel env, header x-lead-key); zonder sleutel staat de route uit (503).
export const POST: APIRoute = async ({ request }) => {
  const parsed = await parseMetaLead(request, import.meta.env.META_LEAD_KEY);
  if (parsed.kind === 'invalid') return json(parsed.status, parsed.payload);
  return deliverLead(buildLeadMessage(parsed.data), contactEnv(), 'api/lead-meta');
};
