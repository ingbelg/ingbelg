/* Onderwerp en tekst van een aanvraag — dezelfde tekst gaat naar de e-mail en naar de Odoo-lead. */
import facts from '../../data/site-facts.json';
import { callbackDeadline } from '../callback';
import type { LeadData, LeadMessage } from './types';

export function buildLeadMessage(data: LeadData): LeadMessage {
  const subject = `Offerteaanvraag — ${data.dienst}`;
  // De site belooft een terugbelafspraak binnen X werkdag: zet de deadline zichtbaar bovenaan (mail én Odoo-lead).
  const deadline = callbackDeadline();
  // Herkomst (UTM / advertentieklik) komt van de browser: één regel, kort gehouden.
  const herkomst = String(data.herkomst || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
  const body = [
    deadline ? `TERUGBELLEN VÓÓR: ${deadline} (belofte: binnen ${facts.callbackWorkdays} werkdag)` : null,
    deadline ? '' : null,
    `Naam: ${data.naam}`,
    `Telefoon: ${data.telefoon}`,
    `E-mail: ${data.email}`,
    `Gemeente: ${data.gemeente || '-'}`,
    `Dienst: ${data.dienst}`,
    `Timing: ${data.timing || '-'}`,
    `Bron: ${data.source_block || '-'}`,
    herkomst ? `Herkomst: ${herkomst}` : null,
    data.premie_summary ? `Premie-check: ${data.premie_summary}` : null,
    '',
    'Project:',
    data.bericht || '-',
  ].filter(Boolean).join('\n');
  return { data, subject, body };
}
