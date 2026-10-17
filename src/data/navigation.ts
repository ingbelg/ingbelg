/* Eén plek voor de diensten en de navigatielinks van de site.
   Nieuwe dienstpagina? Voeg ze hier toe (SERVICES + de lijsten eronder) — de footers en het
   formulier volgen vanzelf. Labels verschillen bewust per plek (startpagina vs. dienstpagina's). */

export interface NavLink {
  href: string;
  label: string;
}

export interface Service {
  /** Waarde in het offerteformulier (gaat zo naar e-mail en Odoo); moet uniek zijn. */
  value: string;
  /** Eigen pagina; zonder pagina linkt de footer van de startpagina naar #diensten. */
  page?: string;
  /** Label in de footer van de startpagina. */
  homeLabel?: string;
  /** Label in de footer van de dienstpagina's. */
  landingLabel?: string;
  /** Label in de keuzelijst van het offerteformulier. */
  formLabel: string;
}

export const SERVICES = {
  hellend: { value: 'Hellende daken', page: '/hellend-dak', homeLabel: 'Hellende daken', landingLabel: 'Hellend dak vernieuwen', formLabel: 'Hellend dak' },
  plat: { value: 'Platte daken', page: '/plat-dak-epdm', homeLabel: 'Platte daken', landingLabel: 'Plat dak (EPDM)', formLabel: 'Plat dak' },
  isolatie: { value: 'Dakisolatie', page: '/dakisolatie', homeLabel: 'Dakisolatie', landingLabel: 'Dakisolatie', formLabel: 'Dakisolatie' },
  asbest: { value: 'Asbestdak vervangen', page: '/asbestdak-vervangen', homeLabel: 'Asbestdak vervangen', landingLabel: 'Asbestdak vervangen', formLabel: 'Asbestdak vervangen' },
  gevel: { value: 'Gevelbekleding', page: '/gevelbekleding', homeLabel: 'Gevelbekleding', landingLabel: 'Gevelbekleding', formLabel: 'Gevelbekleding' },
  timmer: { value: 'Timmerwerken en dakkapellen', page: '/dakkapel-timmerwerken', homeLabel: 'Timmerwerken en dakkapellen', landingLabel: 'Dakkapel en timmerwerken', formLabel: 'Timmerwerken / dakkapel' },
  herstel: { value: 'Daklek / herstelling', page: '/dakherstelling', homeLabel: 'Daklek herstellen', landingLabel: 'Daklek herstellen', formLabel: 'Daklek / herstelling' },
  zon: { value: 'Zonnepanelen', homeLabel: 'Zonnepanelen', formLabel: 'Zonnepanelen' },
  eco: { value: 'Ecopanelen', homeLabel: 'Ecopanelen', formLabel: 'Ecopanelen' },
  totaal: { value: 'Totaalrenovatie', formLabel: 'Totaalrenovatie' },
  onbekend: { value: 'Weet ik nog niet', formLabel: 'Weet ik nog niet' },
} as const satisfies Record<string, Service>;

type Key = keyof typeof SERVICES;
/** Geldige waarde voor het veld "dienst" (typefout = bouwfout, geen stil kapot formulier). */
export type ServiceValue = (typeof SERVICES)[Key]['value'];
const pick = (keys: Key[], label: 'homeLabel' | 'landingLabel'): NavLink[] =>
  keys.map((k) => {
    const s: Service = SERVICES[k];
    return { href: s.page ?? '#diensten', label: s[label] ?? s.value };
  });

/** Footer "Diensten" op de startpagina. */
export const FOOTER_SERVICES_HOME = pick(['hellend', 'plat', 'isolatie', 'asbest', 'gevel', 'timmer', 'herstel', 'zon', 'eco'], 'homeLabel');

/** Footer "Diensten" op dienstpagina's en gidsen (+ twee algemene links onderaan). */
export const FOOTER_SERVICES_LANDING: NavLink[] = [
  ...pick(['hellend', 'plat', 'isolatie', 'asbest', 'gevel', 'timmer', 'herstel'], 'landingLabel'),
  { href: '/handig-om-te-weten', label: 'Handig om te weten' },
  { href: '/#diensten', label: 'Alle diensten' },
];

/** Footer "Navigatie" op de startpagina (ankers op dezelfde pagina). */
export const FOOTER_NAV_HOME: NavLink[] = [
  { href: '#over', label: 'Over ons' },
  { href: '#realisaties', label: 'Realisaties' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#voordelen', label: 'Onze afspraken' },
  { href: '#calculator', label: 'Premies & btw' },
  { href: '#faq', label: 'FAQ' },
  { href: '/handig-om-te-weten', label: 'Handig om te weten' },
  { href: '#contact', label: 'Contact' },
];

/** Keuzelijst "Wat moet er gebeuren?" in het offerteformulier (startpagina én dienstpagina's). */
export const FORM_SERVICES: { value: ServiceValue; label: string }[] = (
  ['hellend', 'plat', 'isolatie', 'asbest', 'gevel', 'timmer', 'zon', 'eco', 'herstel', 'totaal', 'onbekend'] as Key[]
).map((k) => ({ value: SERVICES[k].value, label: SERVICES[k].formLabel }));
