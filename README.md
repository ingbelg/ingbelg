# INGBELG — website

Statische premium one-page site voor **INGBELG — Algemene dak- en renovatiewerken**.
Nederlandstalig, wit fundament met merkrood accent (`#D3372C`).

## Structuur

```
index.html            Volledige pagina (alle secties)
css/style.css         Alle styling + responsive breakpoints
js/main.js            Menu, reveal-animaties, tellers, FAQ, lightbox, formulier
assets/
  logo.png            Logo INGBELG
  hero.mp4            Dronevideo (achtergrond eerste scherm)
  services/*.jpg      Beelden per dienst
  work/*.jpg          Realisaties (galerij)
.claude/serve.ps1     Kleine lokale webserver (PowerShell) voor preview
```

## Secties

Topbalk (telefoon/e-mail/adres/WhatsApp) · sticky header met «Offerte aanvragen» ·
hero met dronevideo en gradient-scrim · USP-strip · Over ons · Diensten (6) ·
Realisaties met lightbox · Waarom INGBELG (6) · CTA-band · FAQ · Contact · Footer ·
sticky actiebalk op mobiel.

## Lokaal bekijken

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/serve.ps1
# http://localhost:5173
```

Openen via `file://` werkt ook, maar een server is netter (video + fonts).

## Typografie

Zoals op ingbelg.be: **Roboto Condensed** (koppen) + **Nunito** (tekst), via Google Fonts.

## Contactformulier

Er is geen backend. Het formulier valideert en opent daarna de mailclient
(`mailto:info@ingbelg.be`) met alle ingevulde gegevens. Wil je echte verzending
via de server, koppel dan `js/main.js` aan een endpoint (bv. Formspree of PHP-mailer).

## Gegevens

- Tel. algemeen: +32 497 55 05 05
- Tel. klantendienst: +32 488 87 60 61
- WhatsApp: +32 497 55 60 61
- E-mail: info@ingbelg.be
- Adres: Hoogstraat 59, 9620 Zottegem
- BTW: BE 0721.841.831
