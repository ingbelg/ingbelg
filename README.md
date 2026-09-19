# INGBELG — website

One-page website voor **INGBELG — algemene dak- en renovatiewerken** (Zottegem, Oost-Vlaanderen).
Nederlandstalig, gebouwd met [Astro](https://astro.build) en gehost op Vercel.

## Stack

- **Astro** (`output: 'server'` + `@astrojs/vercel`): de startpagina wordt statisch voorgerenderd,
  `/api/contact` draait als serverfunctie.
- Vanilla JS in `public/js` (menu, animaties, premie-calculator, cookie-toestemming) en één stylesheet in `public/css`.
- Lettertypes lokaal via `@fontsource` (geen verbinding met Google Fonts).
- Content in Astro Content Collections (JSON) — aanpasbaar zonder de pagina-code aan te raken.

## Structuur

```
src/
  pages/index.astro          De volledige startpagina
  pages/privacybeleid.astro  Privacybeleid
  pages/cookiebeleid.astro   Cookiebeleid
  pages/404.astro            Pagina niet gevonden
  pages/api/contact.ts       Offerteformulier → e-mail (Resend)
  pages/robots.txt.ts        robots.txt (volgt de livegang-schakelaar)
  pages/sitemap.xml.ts       sitemap.xml
  layouts/Layout.astro       <head>, SEO-tags, JSON-LD, cookiebanner
  components/                Kleine herbruikbare stukken (LegalBar, LegalFoot)
  content/services/*.json    Diensten
  content/gallery/*.json     Realisaties-galerij
  data/site-facts.json       Eén bron voor contactgegevens, openingsuren, cijfers en de livegang-schakelaar
public/
  css/style.css              Alle styling
  js/                        main.js, calculator.js, consent.js
  assets/                    Logo, hero-video, foto's
vercel.json                  Beveiligingsheaders, redirects van oude URL's, noindex voor het preview-adres
astro.config.mjs             `site` volgt site-facts.json (launched + siteUrl)
```

## Lokaal draaien

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # productiebuild controleren
```

`astro preview` werkt niet met de Vercel-adapter; gebruik `npm run dev`.

## Omgevingsvariabelen

Zie `.env.example`. In Vercel instellen (Project → Settings → Environment Variables):

| Variabele | Doel |
|---|---|
| `RESEND_API_KEY` | E-mailprovider voor het offerteformulier. Zonder sleutel opent het formulier de e-mailapp van de bezoeker. |
| `CONTACT_NOTIFY_EMAIL` | Ontvanger van offerteaanvragen (standaard `info@ingbelg.be`). |
| `CONTACT_FROM_EMAIL` | Afzender, bv. `INGBELG website <noreply@ingbelg.be>`. Het domein moet in Resend geverifieerd zijn. |
| `PUBLIC_GA_ID` | Google Analytics 4 Measurement ID. Zonder waarde wordt Analytics nooit geladen. |

## Inhoud aanpassen

- **Contactgegevens, openingsuren, cijfers:** `src/data/site-facts.json`. Niet in de markup hardcoderen.
- **Diensten en foto's:** JSON-bestanden in `src/content/`. Afbeeldingen als WebP in `public/assets/`.
- **Teksten:** rechtstreeks in `src/pages/index.astro`.

## Livegang

De site staat standaard op `noindex`. In `src/data/site-facts.json`:

- `"launched": false` → geen indexatie, `robots.txt` zonder sitemap, canonical naar het preview-adres.
- `"launched": true` → indexeerbaar, canonical/Open Graph/JSON-LD/sitemap wijzen naar `siteUrl`.

Zet `launched` pas op `true` nadat het echte domein aan het Vercel-project gekoppeld is en werkt.

## Privacy en cookies

Analytics en externe inhoud (Google-reviews via Trustindex) laden pas na toestemming in de cookiebanner
(`public/js/consent.js`). Zonder toestemming worden geen verbindingen met die diensten gemaakt.
