import type { APIRoute } from 'astro';
import facts from '../data/site-facts.json';
import { SERVICES, type Service } from '../data/navigation';

export const prerender = true;

// llms.txt (formaat van llmstxt.org): korte samenvatting voor AI-assistenten.
// Alleen bevestigde feiten; cijfers komen uit site-facts.json en de diensten uit navigation.ts,
// zodat dit bestand mee verandert met de site. Google gebruikt llms.txt niet: verwacht er geen rankingeffect van.
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(facts.siteUrl)).toString().replace(/\/$/, '');
  const services = (Object.values(SERVICES) as Service[])
    .filter((s) => s.page)
    .map((s) => `- [${s.landingLabel ?? s.value}](${base}${s.page})`);
  const a = facts.address;
  const lines = [
    '# INGBELG',
    '',
    `> ${facts.legalName} (handelsnaam INGBELG) is een dakwerker uit ${a.city} (Oost-Vlaanderen, België): hellende en platte daken, asbestdaken vervangen, dakisolatie, dakherstellingen, gevelbekleding en dakkapellen, met een eigen vaste ploeg van ${facts.teamSize} vakmensen.`,
    '',
    `- Adres: ${a.street}, ${a.postalCode} ${a.city}, België`,
    `- Telefoon en WhatsApp: ${facts.phone}`,
    `- E-mail: ${facts.email}`,
    `- Ondernemingsnummer: ${facts.vat}`,
    `- Garantie: ${facts.warrantyYears} jaar op werk en materialen, vermeld in de offerte`,
    `- Google-reviews: ${facts.reviews.score} op 5 (${facts.reviews.count} reviews)`,
    `- Werkwijze: we bellen binnen ${facts.callbackWorkdays} werkdag terug voor een afspraak; offerte binnen ${facts.quoteHoursAfterVisit} uur na het gratis plaatsbezoek`,
    `- Werkgebied: ${a.city} en deelgemeenten, en de buurgemeenten Herzele, Sint-Lievens-Houtem, Oosterzele, Zwalm, Brakel, Geraardsbergen, Ninove, Oudenaarde, Erpe-Mere en Aalst; grotere projecten in Oost- en West-Vlaanderen, Vlaams-Brabant en Antwerpen`,
    '- Taal: Nederlands',
    '',
    '## Diensten',
    '',
    ...services,
    '',
    '## Uitleg over regels en premies',
    '',
    `- [Dakpremie 2026 (Mijn VerbouwPremie)](${base}/premies-dakwerken-2026)`,
    `- [Btw op dakwerken: 6 % of 21 %](${base}/btw-dakwerken)`,
    `- [Asbestdak: de regels in Vlaanderen](${base}/asbestdak-regels)`,
    `- [Renovatieverplichting bij EPC E of F](${base}/renovatieverplichting-epc)`,
    '',
    '## Contact',
    '',
    `- [Offerte aanvragen](${base}/#contact)`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
