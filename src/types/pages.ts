/* Gegevens voor LandingPage.astro, per soort pagina een eigen type (geen velden die een soort niet gebruikt).
   Een dienstpagina met gidsvelden (of omgekeerd) is zo een typefout in plaats van een stil genegeerd veld. */
import type { ServiceValue } from '../data/navigation';

export interface Img { src: string; alt: string; w: number; h: number }

/** Velden die elke pagina heeft. */
interface PageBase {
  slug: string;                 // bv. "hellend-dak" (zonder slash)
  title: string;
  description: string;
  dienst: ServiceValue;         // dienst uit src/data/navigation.ts (vooraf gekozen in het formulier)
  serviceType: string;
  eyebrow: string;
  h1Main: string;
  h1Sub: string;
  lead: string;
  crumb: string;                // korte naam in het kruimelpad (zichtbaar + BreadcrumbList)
  hero: { src: string; alt: string; srcset?: string };
  ogImage?: string;
  problems: { h: string; p: string; link?: { href: string; label: string } }[];
  problemsTitle?: string;       // standaard: "Herkent u dit?" (HTML toegestaan: <em>)
  steps: { h: string; p: string }[];
  note?: { title: string; text: string };                  // extra blok (premie/btw/asbestregels)
  related?: { text: string; href: string; label: string }; // verwijzing naar een verwante uitlegpagina (boven de CTA)
  faq: { q: string; a: string }[];
}

/** Dienstpagina: Service-schema + blok "wat we doen". */
export interface ServicePageData extends PageBase {
  kind?: 'service';
  doTitle: string;              // HTML toegestaan: <em>
  doLead: string;
  doTicks: string[];
  doImages: [Img, Img];
  ba?: boolean;                 // voor/na-sliders tonen
  photos?: Img[];
}

/** Uitlegpagina (gids): Article-schema, bronnen en controledatum. */
export interface GuidePageData extends PageBase {
  kind: 'guide';
  parent: { name: string; href: string }; // tussenstap in het kruimelpad (Handig om te weten)
  published: string;            // ISO-datum eerste publicatie, bv. "2026-10-03"
  updated: string;              // ISO-datum laatste controle met de bronnen (zichtbaar + dateModified)
  guide: { h: string; paras?: string[]; list?: string[]; bullets?: boolean; table?: { head: string[]; rows: string[][] } }[];
  sources: { label: string; href: string }[];
}

/** Overzicht van uitlegpagina's (CollectionPage). */
export interface OverviewPageData extends PageBase {
  kind: 'overview';
  articles: { href: string; title: string; text: string; tag: string; img: string; alt: string; w: number; h: number }[];
}

export type LandingData = ServicePageData | GuidePageData | OverviewPageData;
