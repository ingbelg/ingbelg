/* Aanvraag uit een leadformulier van Meta (Facebook/Instagram), doorgestuurd door een koppeling
   (Google Sheets-script, Make of Zapier). Geen publiek formulier: enkel wie de sleutel kent, mag posten.
   Velden worden losjes gelezen, want elke koppeling noemt ze anders (full_name, phone_number, post_code…). */
import type { LeadData } from './types';

export type MetaParseResult =
  | { kind: 'ok'; data: LeadData }
  | { kind: 'invalid'; status: number; payload: Record<string, unknown> };

const pick = (raw: Record<string, unknown>, names: string[]): string => {
  for (const n of names) {
    const v = raw[n];
    if (v !== undefined && v !== null && String(v).trim()) return String(v).replace(/[\r\n]+/g, ' ').trim();
  }
  return '';
};

/** Vergelijkt zonder vroeg te stoppen (geen tijdslek over hoeveel tekens kloppen). */
function sameKey(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function parseMetaLead(request: Request, key: string | undefined): Promise<MetaParseResult> {
  if (!key) return { kind: 'invalid', status: 503, payload: { ok: false, error: 'not_configured' } };
  if (!sameKey(request.headers.get('x-lead-key') ?? '', key)) {
    return { kind: 'invalid', status: 401, payload: { ok: false, error: 'unauthorized' } };
  }

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return { kind: 'invalid', status: 400, payload: { ok: false, error: 'invalid_json' } };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { kind: 'invalid', status: 400, payload: { ok: false, error: 'invalid_json' } };
  }
  if (Object.values(raw).some((v) => String(v ?? '').length > 3000)) {
    return { kind: 'invalid', status: 400, payload: { ok: false, error: 'too_long' } };
  }

  const naam = pick(raw, ['naam', 'full_name', 'name', 'volledige_naam']);
  // Meta zet in exports en de Sheets-koppeling soms een typevoorvoegsel voor waarden ("p:+32…", "z:9620").
  const unprefix = (v: string) => v.replace(/^[a-z]{1,2}:(?=[+\d])/i, '');
  const telefoon = unprefix(pick(raw, ['telefoon', 'phone_number', 'phone', 'telefoonnummer']));
  if (!naam) return { kind: 'invalid', status: 400, payload: { ok: false, error: 'missing_field', field: 'naam' } };
  if (!telefoon) return { kind: 'invalid', status: 400, payload: { ok: false, error: 'missing_field', field: 'telefoon' } };

  // Een ongeldig adres zou de e-mail (reply-to) laten mislukken: dan gaat het mee in de tekst in plaats van in het veld.
  const rawEmail = pick(raw, ['email', 'e-mail', 'e_mail']);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawEmail) ? rawEmail : '';
  const postcode = unprefix(pick(raw, ['postcode', 'post_code', 'zip', 'zip_code']));
  const gemeente = pick(raw, ['gemeente', 'city', 'stad']);
  const dienst = pick(raw, ['dienst', 'service', 'wat_wilt_u_laten_doen']);
  const timing = pick(raw, ['timing', 'wanneer']);
  const campagne = pick(raw, ['campaign_name', 'campagne']);
  const advertentie = pick(raw, ['ad_name', 'advertentie']);
  const formulier = pick(raw, ['form_name', 'formulier']);
  const platform = pick(raw, ['platform']);
  const aangemaakt = pick(raw, ['created_time', 'aangemaakt']);
  const leadId = pick(raw, ['id', 'lead_id', 'leadgen_id']);
  const bericht = pick(raw, ['bericht', 'message', 'opmerking']);

  const herkomst = ['Meta-leadformulier', platform, campagne, advertentie].filter(Boolean).join(' / ');
  const details = [
    bericht,
    rawEmail && !email && `E-mail (ongeldig ingevuld): ${rawEmail}`,
    formulier && `Formulier: ${formulier}`,
    aangemaakt && `Ingevuld op: ${aangemaakt}`,
    leadId && `Meta-lead-ID: ${leadId}`,
  ].filter(Boolean).join('\n');

  return {
    kind: 'ok',
    data: {
      naam,
      telefoon,
      email,
      gemeente: [gemeente, postcode].filter(Boolean).join(' ') || '',
      // «Meta» altijd in de leadnaam, zodat deze leads in Odoo te filteren zijn.
      dienst: dienst ? `${dienst} (via Meta)` : 'Aanvraag via Meta-advertentie',
      timing,
      source_block: 'Meta-leadformulier (Facebook/Instagram)',
      herkomst,
      bericht: details,
    },
  };
}
