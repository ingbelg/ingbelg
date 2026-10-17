/* Gedeelde types voor het offerteformulier (/api/contact). */

/** Velden zoals het formulier ze stuurt (public/js/main.js). */
export type LeadData = Record<string, string>;

/** Een gevalideerde aanvraag, klaar om te versturen. */
export interface LeadMessage {
  data: LeadData;
  subject: string;
  body: string;
}

/** Instellingen uit de omgeving (Vercel env); alles optioneel, ontbrekend = kanaal uit. */
export interface ContactEnv {
  RESEND_API_KEY?: string;
  CONTACT_NOTIFY_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  ODOO_LEAD_FORM_URL?: string;
  ODOO_LEAD_TEAM_ID?: string;
  ODOO_LEAD_USER_ID?: string;
}

/** Hoofdkanaal: het antwoord aan de bezoeker hangt ervan af. Netwerkfouten mogen gooien. */
export interface PrimaryChannel {
  send(msg: LeadMessage): Promise<{ ok: boolean }>;
}

/** Nevenkanaal (CRM, melding…): mag nooit gooien en beïnvloedt het antwoord niet. */
export interface SideChannel {
  deliver(msg: LeadMessage): Promise<void>;
}
