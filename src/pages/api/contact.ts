import type { APIRoute } from 'astro';
import { parseLead } from '../../lib/contact/validate';
import { buildLeadMessage } from '../../lib/contact/message';
import { resendChannel } from '../../lib/contact/resend';
import { odooChannel } from '../../lib/contact/odoo';
import type { ContactEnv, SideChannel } from '../../lib/contact/types';

// Server-side route — draait altijd live, wordt niet mee statisch gebouwd.
export const prerender = false;

// Deze route koppelt alleen de onderdelen: controleren → bericht opstellen → kanalen.
// Nieuw kanaal (bv. Telegram)? Een SideChannel in src/lib/contact/ + één regel hieronder.
const sideChannels = (env: ContactEnv): SideChannel[] =>
  [odooChannel(env)].filter((c): c is SideChannel => c !== null);

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const parsed = await parseLead(request);
  if (parsed.kind === 'invalid') return json(parsed.status, parsed.payload);
  if (parsed.kind === 'honeypot') return json(200, { ok: true, delivered: false });

  // Bewust per variabele gelezen (zoals Astro/Vite ze in de serverbundel verwacht), niet als heel object.
  const env: ContactEnv = {
    RESEND_API_KEY: import.meta.env.RESEND_API_KEY,
    CONTACT_NOTIFY_EMAIL: import.meta.env.CONTACT_NOTIFY_EMAIL,
    CONTACT_FROM_EMAIL: import.meta.env.CONTACT_FROM_EMAIL,
    ODOO_LEAD_FORM_URL: import.meta.env.ODOO_LEAD_FORM_URL,
    ODOO_LEAD_TEAM_ID: import.meta.env.ODOO_LEAD_TEAM_ID,
    ODOO_LEAD_USER_ID: import.meta.env.ODOO_LEAD_USER_ID,
  };
  const msg = buildLeadMessage(parsed.data);
  // Nevenkanalen starten meteen en lopen parallel met de e-mail; vóór het antwoord wachten we erop.
  const side = Promise.all(sideChannels(env).map((c) => c.deliver(msg)));

  const primary = resendChannel(env);
  if (!primary) {
    // Demo-omgeving: geen e-mailprovider gekoppeld. Vóór livegang: RESEND_API_KEY instellen — zie .env.example.
    console.log('[api/contact] Geen RESEND_API_KEY ingesteld — aanvraag alleen gelogd:\n' + msg.body);
    await side;
    return json(200, { ok: true, delivered: false });
  }

  try {
    const { ok } = await primary.send(msg);
    await side;
    return ok ? json(200, { ok: true, delivered: true }) : json(502, { ok: false, error: 'send_failed' });
  } catch (err) {
    console.error('[api/contact] Netwerkfout:', err);
    await side;
    return json(502, { ok: false, error: 'network_error' });
  }
};
