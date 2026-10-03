/* Gedeelde FAQ-antwoorden voor de dienstpagina's. Teksten komen woordelijk van de startpagina
   (src/pages/index.astro → faqItems), zodat er één bevestigde waarheid blijft. Cijfers uit site-facts.json. */
import facts from './site-facts.json';

export const faqKost = {
  q: 'Wat kost een nieuw dak?',
  a: 'Dat hangt af van de oppervlakte, het type dak en wat er onder de pannen zit. Daarom geven we geen prijs aan de telefoon, wel een offerte binnen 48 uur na het plaatsbezoek, per post uitgeschreven. Met de premie-check op de startpagina ziet u vooraf al wat u terugkrijgt.',
};

export const faqGratis = {
  q: 'Zijn het plaatsbezoek en de offerte gratis?',
  a: 'Ja. Het plaatsbezoek en de offerte zijn gratis en vrijblijvend. Pas als u de offerte ondertekent, gaan we aan de slag.',
};

export const faqBtw = {
  q: 'Betaal ik 6 % of 21 % btw?',
  a: 'Is uw woning ouder dan 10 jaar en gebruikt u ze vooral als privéwoning? Dan betaalt u 6 % btw op de werken in plaats van 21 %. Wij passen dat correct toe op de factuur. Voor een woning jonger dan 10 jaar geldt 21 %.',
};

export const faqPremie = {
  q: 'Kan ik nog genieten van premies?',
  a: 'Ja, als u in inkomenscategorie 3 of 4 valt. Sinds 1 maart 2026 krijgen de twee hoogste inkomenscategorieën geen dakpremie meer. Voor categorie 4 gaat het om maximaal 50 % van de factuur (tot € 5.750), voor categorie 3 om maximaal 35 % (tot € 4.025). Voorwaarde: het dak wordt tegelijk nieuw geïsoleerd, met een Rd-waarde van minstens 4,5 m²K/W. Soms komen er gemeentelijke premies bij. Tijdens het plaatsbezoek rekenen we het samen na.',
};

export const faqRegen = {
  q: 'Wat als het regent tijdens de werken?',
  a: "Dan blijft uw woning droog. Elk dakvlak dat open ligt, dekken we aan het einde van de werkdag af met ons eigen zeil. Ook als er 's nachts een onverwachte bui valt.",
};

export const faqGarantie = {
  q: 'Welke garantie krijg ik?',
  a: `${facts.warrantyYears} jaar schriftelijke garantie op het uitgevoerde werk en de materialen. U krijgt het garantiedocument bij de oplevering.`,
};

export const faqVergunning = {
  q: 'Heb ik een vergunning nodig?',
  a: 'Voor het vernieuwen van een dak in dezelfde vorm meestal niet. Verandert de vorm, de hoogte of komt er een dakkapel bij, dan vaak wel. Informeer altijd bij uw gemeente; wij bezorgen u de technische gegevens voor de aanvraag.',
};

/* Vijf afspraken (zelfde inhoud als "Onze afspraken" op de startpagina), met per dienst een eigen planningszin. */
export function steps(planning: string, tussen?: { h: string; p: string }) {
  return [
    { h: 'Gratis plaatsbezoek', p: 'We komen ter plaatse, bekijken uw dak van dichtbij en luisteren naar wat u wilt en wat u wilt uitgeven.' },
    { h: `Offerte binnen ${facts.quoteHoursAfterVisit} uur na het plaatsbezoek`, p: 'Per post uitgeschreven: wat we doen, met welk materiaal, wat het kost. En ook wat er niet in zit.' },
    { h: 'Startdatum en planning op papier', p: planning },
    tussen ?? { h: 'Elke avond waterdicht, elke dag opgeruimd', p: "Open dakvlakken gaan 's avonds onder ons zeil. Containers, valbeveiliging en opruim zitten in de prijs. Uw tuin en oprit blijven heel." },
    { h: `${facts.warrantyYears} jaar schriftelijke garantie`, p: 'Op het werk en de materialen, bij de oplevering op papier. En daarna blijven we gewoon bereikbaar.' },
  ];
}
