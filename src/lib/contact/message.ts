/* Onderwerp en tekst van een aanvraag — dezelfde tekst gaat naar de e-mail en naar de Odoo-lead. */
import facts from '../../data/site-facts.json';
import { callbackDeadline } from '../callback';
import type { LeadData, LeadMessage } from './types';

/** Kanaal voor in de onderwerpregel en de leadnaam (zichtbaar op het Odoo-bord), afgeleid van de Herkomst-regel.
    Meta-leads hebben «(via Meta)» al in de dienst. Onbekende bron: enkel letters/cijfers, kort. */
export function channelLabel(herkomst: string): string {
  const h = herkomst.trim();
  if (!h || /^Meta-leadformulier/i.test(h)) return '';
  if (/Google Ads-klik/i.test(h)) return 'Google Ads';
  if (/ChatGPT-advertentie/i.test(h)) return 'ChatGPT';
  const source = h.split(/[\s/(]/)[0].toLowerCase();
  if (source === 'chatgpt' || source === 'openai') return 'ChatGPT';
  if (source === 'gbp') return 'Google-profiel';
  if (source === 'google' && /\/\s*cpc\b/i.test(h)) return 'Google Ads';
  return source.replace(/[^a-z0-9.-]/g, '').slice(0, 30);
}

export function buildLeadMessage(data: LeadData): LeadMessage {
  // Herkomst (UTM / advertentieklik) komt van de browser: één regel, kort gehouden.
  const herkomst = String(data.herkomst || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
  const channel = channelLabel(herkomst);
  const subject = `Offerteaanvraag — ${data.dienst}${channel ? ` (via ${channel})` : ''}`;
  // De site belooft een terugbelafspraak binnen X werkdag: zet de deadline zichtbaar bovenaan (mail én Odoo-lead).
  const deadline = callbackDeadline();
  const body = [
    deadline ? `TERUGBELLEN VÓÓR: ${deadline} (belofte: binnen ${facts.callbackWorkdays} werkdag)` : null,
    deadline ? '' : null,
    `Naam: ${data.naam}`,
    `Telefoon: ${data.telefoon}`,
    `E-mail: ${String(data.email ?? '').trim() || '-'}`,
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
