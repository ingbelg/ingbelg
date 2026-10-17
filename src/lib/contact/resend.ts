/* Hoofdkanaal: e-mail via Resend (resend.com).
   Andere provider? Schrijf een nieuw PrimaryChannel en kies het in src/pages/api/contact.ts. */
import type { ContactEnv, LeadMessage, PrimaryChannel } from './types';

/** Geeft null zonder RESEND_API_KEY (demo-omgeving: de aanvraag wordt dan enkel gelogd). */
export function resendChannel(env: ContactEnv): PrimaryChannel | null {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return null;
  const notifyTo = env.CONTACT_NOTIFY_EMAIL || 'info@ingbelg.be';
  // Afzender: zonder eigen, in Resend geverifieerd domein kan Resend enkel naar het account-adres
  // zelf leveren (onboarding@resend.dev). CONTACT_FROM_EMAIL = bv. "INGBELG website <noreply@ingbelg.be>".
  const fromAddress = env.CONTACT_FROM_EMAIL || 'INGBELG website <onboarding@resend.dev>';

  return {
    async send({ data, subject, body }: LeadMessage) {
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
      if (!res.ok) console.error('[api/contact] Resend-fout:', await res.text());
      return { ok: res.ok };
    },
  };
}
