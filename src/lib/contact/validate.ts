/* Inlezen en controleren van een aanvraag.
   Volgorde is bewust: ongeldige JSON → honeypot → verplichte velden → e-mail → lengte. */
import type { LeadData } from './types';

const REQUIRED_FIELDS = ['naam', 'telefoon', 'email', 'dienst'] as const;

export type ParseResult =
  | { kind: 'ok'; data: LeadData }
  | { kind: 'honeypot' }
  | { kind: 'invalid'; status: number; payload: Record<string, unknown> };

export async function parseLead(request: Request): Promise<ParseResult> {
  let data: LeadData;
  try {
    data = await request.json();
  } catch {
    return { kind: 'invalid', status: 400, payload: { ok: false, error: 'invalid_json' } };
  }

  // Honeypot (T-29): onzichtbaar veld voor mensen, bots vullen het vaak wel in.
  if (data.website && String(data.website).trim()) return { kind: 'honeypot' };

  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || !String(data[field]).trim()) {
      return { kind: 'invalid', status: 400, payload: { ok: false, error: 'missing_field', field } };
    }
  }

  // Basisvalidatie aan de serverkant (de browser controleert dit ook, maar dit endpoint is publiek).
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email).trim())) {
    return { kind: 'invalid', status: 400, payload: { ok: false, error: 'invalid_email' } };
  }
  if (Object.values(data).some((v) => String(v ?? '').length > 3000)) {
    return { kind: 'invalid', status: 400, payload: { ok: false, error: 'too_long' } };
  }
  return { kind: 'ok', data };
}
