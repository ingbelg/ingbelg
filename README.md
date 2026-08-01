# INGBELG — website

Premium one-page site voor **INGBELG — Algemene dak- en renovatiewerken**, gebouwd op **Astro**.
Nederlandstalig, wit fundament met merkrood accent (`#D3372C`).

## Structuur

```
src/
  pages/index.astro        De volledige pagina (secties, layout, collections-loops)
  pages/api/contact.ts     Server-endpoint voor het offerteformulier
  layouts/Layout.astro     <head>, fonts, css/js-includes
  components/GoogleReviews.astro   Integratiepunt voor het echte reviews-widget
  content/services/*.json  Diensten (7) — CMS-klare data
  content/gallery/*.json   Realisaties-galerij (12) — CMS-klare data
  content/testimonials/*.json  Demo-reviews (3, gemarkeerd als voorbeeld)
  content.config.ts        Schema's voor de collections hierboven
public/
  css/style.css           Alle styling + responsive breakpoints
  js/main.js              Menu, reveal-animaties, tellers, FAQ, lightbox, formulier, voor/na-slider
  js/calculator.js         Premie-calculator (Mijn VerbouwPremie-logica)
  assets/                 Logo, hero-video, dienst- en werk-foto's
astro.config.mjs           output:'server' + @astrojs/vercel — gehost op Vercel, adapter wisselbaar
.env.example                RESEND_API_KEY / CONTACT_NOTIFY_EMAIL voor het contactformulier
```

## Lokaal draaien

```bash
npm install
npm run dev
# http://localhost:4321
```

```bash
npm run build      # bouwt naar dist/ (index.html statisch, /api/contact server-side)
npm run preview    # bekijk de productiebuild lokaal
```

> De oudere `index.html` / `css/` / `js/` / `.claude/serve.ps1` op de root zijn de
> pre-Astro static versie en niet meer in gebruik — kunnen verwijderd worden zodra
> de Astro-versie is goedgekeurd.

## Secties

Topbalk (telefoon/e-mail/adres/WhatsApp) · sticky header met «Offerte aanvragen» ·
hero met dronevideo, trust-badge en motto · USP-strip · Over ons · merken/materialen ·
Diensten (7, incl. asbestverwijdering) · Realisaties met voor/na-slider + lightbox-galerij ·
Werkwijze (5 stappen) · Waarom INGBELG (8) · Premie-calculator · CTA-band · Testimonials
(demo) · FAQ · CTA-beeldbanner · Contact · Footer met trust-badges · sticky actiebalk mobiel.

## Typografie

Zoals op ingbelg.be: **Roboto Condensed** (koppen) + **Nunito** (tekst), via Google Fonts.

## Contactformulier

`js/main.js` post naar `/api/contact` (Astro server-route). Zonder `RESEND_API_KEY` in
`.env` wordt de aanvraag alleen gelogd (dev-fallback) — met een API-key van
[resend.com](https://resend.com) wordt echt een e-mail verstuurd naar `CONTACT_NOTIFY_EMAIL`.
Lukt de server-call niet (bv. bij puur statische hosting), dan valt het formulier terug
op een `mailto:`-link zoals voorheen.

## Google-reviews

`src/components/GoogleReviews.astro` is het integratiepunt voor het echte widget
(Elfsight, Trustindex, of een eigen Google Places-koppeling) — nu nog een demo-kop,
de rest van de pagina hoeft niet te wijzigen zodra dat er is.

## CMS-voorbereiding

Diensten, galerij en testimonials komen uit `src/content/**/*.json` (Astro content
collections, met schema-validatie in `src/content.config.ts`). Een headless CMS zoals
Decap CMS kan later rechtstreeks op deze bestanden aangesloten worden zonder dat de
pagina-code moet wijzigen.

## Gegevens

- Telefoon (enige nummer, overal): +32 488 87 60 61
- WhatsApp: +32 488 87 60 61
- E-mail: info@ingbelg.be
- Adres: Hoogstraat 59, 9620 Zottegem
- BTW: BE 0721.841.831
