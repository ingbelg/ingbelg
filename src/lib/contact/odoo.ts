/* Nevenkanaal: lead in Odoo CRM. Odoo Standard heeft geen externe API, dus we gebruiken het publieke
   websiteformulier van Odoo zelf (/website/form/crm.lead). Faalt dit, dan komt de aanvraag nog altijd
   per e-mail binnen — het antwoord aan de bezoeker hangt er niet van af. */
import type { ContactEnv, LeadMessage, SideChannel } from './types';

/** Geeft null zonder ODOO_LEAD_FORM_URL. */
export function odooChannel(env: ContactEnv): SideChannel | null {
  const url = env.ODOO_LEAD_FORM_URL;
  if (!url) return null;
  return {
    // Veldnamen = velden die Odoo via het websiteformulier op crm.lead toelaat. Gooit nooit: fouten worden enkel gelogd.
    async deliver({ data, subject, body }: LeadMessage) {
      const form = new FormData();
      form.set('name', data.gemeente ? `${subject} (${data.gemeente})` : subject);
      form.set('contact_name', data.naam);
      form.set('email_from', data.email);
      form.set('phone', data.telefoon);
      form.set('description', body);
      // Verkoopteam en verkoper: Odoo bewaart die als verborgen velden in zijn eigen formulier,
      // niet als instelling — dus we sturen ze zelf mee (ID's staan in /contactus van Odoo).
      if (env.ODOO_LEAD_TEAM_ID) form.set('team_id', env.ODOO_LEAD_TEAM_ID);
      if (env.ODOO_LEAD_USER_ID) form.set('user_id', env.ODOO_LEAD_USER_ID);
      try {
        const res = await fetch(url, { method: 'POST', body: form, signal: AbortSignal.timeout(8000) });
        const text = await res.text();
        if (!res.ok || !/"id"\s*:\s*\d+/.test(text)) {
          console.error('[api/contact] Odoo-lead niet aangemaakt:', res.status, text.slice(0, 300));
        }
      } catch (err) {
        console.error('[api/contact] Odoo-lead netwerkfout:', err);
      }
    },
  };
}
