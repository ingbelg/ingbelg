/* Versturen van een opgestelde aanvraag: e-mail (hoofdkanaal) + Odoo-lead (nevenkanaal).
   Gedeeld door /api/contact (formulier op de site) en /api/lead-meta (leadformulier van Meta). */
import { resendChannel } from './resend';
import { odooChannel } from './odoo';
import type { ContactEnv, LeadMessage, SideChannel } from './types';

/** Leest de instellingen per variabele, zoals Astro/Vite ze in de serverbundel verwacht. */
export function contactEnv(): ContactEnv {
  return {
    RESEND_API_KEY: import.meta.env.RESEND_API_KEY,
    CONTACT_NOTIFY_EMAIL: import.meta.env.CONTACT_NOTIFY_EMAIL,
    CONTACT_FROM_EMAIL: import.meta.env.CONTACT_FROM_EMAIL,
    ODOO_LEAD_FORM_URL: import.meta.env.ODOO_LEAD_FORM_URL,
    ODOO_LEAD_TEAM_ID: import.meta.env.ODOO_LEAD_TEAM_ID,
    ODOO_LEAD_USER_ID: import.meta.env.ODOO_LEAD_USER_ID,
  };
}

// Nieuw kanaal (bv. Telegram)? Een SideChannel in src/lib/contact/ + één regel hieronder.
const sideChannels = (env: ContactEnv): SideChannel[] =>
  [odooChannel(env)].filter((c): c is SideChannel => c !== null);

export const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });

/** Stuurt de aanvraag weg en geeft het antwoord voor de aanroeper terug. */
export async function deliverLead(msg: LeadMessage, env: ContactEnv, tag = 'api/contact'): Promise<Response> {
  // Nevenkanalen starten meteen en lopen parallel met de e-mail; vóór het antwoord wachten we erop.
  const side = Promise.all(sideChannels(env).map((c) => c.deliver(msg)));

  const primary = resendChannel(env);
  if (!primary) {
    // Demo-omgeving: geen e-mailprovider gekoppeld. Vóór livegang: RESEND_API_KEY instellen — zie .env.example.
    console.log(`[${tag}] Geen RESEND_API_KEY ingesteld — aanvraag alleen gelogd:\n` + msg.body);
    await side;
    return json(200, { ok: true, delivered: false });
  }

  try {
    const { ok } = await primary.send(msg);
    await side;
    return ok ? json(200, { ok: true, delivered: true }) : json(502, { ok: false, error: 'send_failed' });
  } catch (err) {
    console.error(`[${tag}] Netwerkfout:`, err);
    await side;
    return json(502, { ok: false, error: 'network_error' });
  }
}
