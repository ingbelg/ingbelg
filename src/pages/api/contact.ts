import type { APIRoute } from 'astro';

// Server-side route — draait altijd live, wordt niet mee statisch gebouwd.
export const prerender = false;

const REQUIRED_FIELDS = ['naam', 'telefoon', 'email', 'dienst'] as const;

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Honeypot (T-29): onzichtbaar veld voor mensen, bots vullen het vaak wel in.
  if (data.website && String(data.website).trim()) {
    return new Response(JSON.stringify({ ok: true, delivered: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || !String(data[field]).trim()) {
      return new Response(JSON.stringify({ ok: false, error: 'missing_field', field }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Basisvalidatie aan de serverkant (de browser controleert dit ook, maar dit endpoint is publiek).
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email).trim())) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (Object.values(data).some((v) => String(v ?? '').length > 3000)) {
    return new Response(JSON.stringify({ ok: false, error: 'too_long' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const subject = `Offerteaanvraag — ${data.dienst}`;
  const body = [
    `Naam: ${data.naam}`,
    `Telefoon: ${data.telefoon}`,
    `E-mail: ${data.email}`,
    `Gemeente: ${data.gemeente || '-'}`,
    `Dienst: ${data.dienst}`,
    `Timing: ${data.timing || '-'}`,
    `Bron: ${data.source_block || '-'}`,
    data.premie_summary ? `Premie-check: ${data.premie_summary}` : null,
    '',
    'Project:',
    data.bericht || '-',
  ].filter(Boolean).join('\n');

  // Lead in Odoo CRM, naast de e-mail. Odoo Standard heeft geen externe API, dus we gebruiken het
  // publieke websiteformulier van Odoo zelf (/website/form/crm.lead). Faalt dit, dan komt de
  // aanvraag nog altijd per e-mail binnen — het antwoord aan de bezoeker hangt er niet van af.
  const odooFormUrl = import.meta.env.ODOO_LEAD_FORM_URL;
  const odooLead = odooFormUrl ? createOdooLead(odooFormUrl, data, subject, body) : Promise.resolve();

  // Provider: Resend (resend.com) — kies zelf een andere provider indien gewenst,
  // dit is de enige plek die dan moet wijzigen.
  const apiKey = import.meta.env.RESEND_API_KEY;
  const notifyTo = import.meta.env.CONTACT_NOTIFY_EMAIL || 'info@ingbelg.be';
  // Afzender: zonder eigen, in Resend geverifieerd domein kan Resend enkel naar het account-adres
  // zelf leveren (onboarding@resend.dev). Zet CONTACT_FROM_EMAIL zodra het domein is geverifieerd,
  // bv. "INGBELG website <noreply@ingbelg.be>".
  const fromAddress = import.meta.env.CONTACT_FROM_EMAIL || 'INGBELG website <onboarding@resend.dev>';

  if (!apiKey) {
    // Demo-omgeving: geen e-mailprovider gekoppeld. De aanvraag wordt gelogd
    // i.p.v. verstuurd. Vóór livegang: RESEND_API_KEY (+ evt. CONTACT_NOTIFY_EMAIL)
    // instellen in .env — zie .env.example.
    console.log('[api/contact] Geen RESEND_API_KEY ingesteld — aanvraag alleen gelogd:\n' + body);
    await odooLead;
    return new Response(JSON.stringify({ ok: true, delivered: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: notifyTo,
        subject,
        text: body,
        reply_to: data.email,
      }),
    });
    await odooLead;

    if (!res.ok) {
      console.error('[api/contact] Resend-fout:', await res.text());
      return new Response(JSON.stringify({ ok: false, error: 'send_failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, delivered: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/contact] Netwerkfout:', err);
    await odooLead;
    return new Response(JSON.stringify({ ok: false, error: 'network_error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Veldnamen = velden die Odoo via het websiteformulier op crm.lead toelaat.
// Gooit nooit: fouten worden enkel gelogd.
async function createOdooLead(url: string, data: Record<string, string>, subject: string, body: string) {
  const form = new FormData();
  form.set('name', data.gemeente ? `${subject} (${data.gemeente})` : subject);
  form.set('contact_name', data.naam);
  form.set('email_from', data.email);
  form.set('phone', data.telefoon);
  form.set('description', body);
  try {
    const res = await fetch(url, { method: 'POST', body: form, signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    if (!res.ok || !/"id"\s*:\s*\d+/.test(text)) {
      console.error('[api/contact] Odoo-lead niet aangemaakt:', res.status, text.slice(0, 300));
    }
  } catch (err) {
    console.error('[api/contact] Odoo-lead netwerkfout:', err);
  }
}
