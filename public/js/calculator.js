/* INGBELG — Premie-calculator (demoversie)
   Gebaseerd op de officiële Mijn VerbouwPremie-regels voor dakwerken
   (vlaanderen.be, geraadpleegd augustus 2026):
   - Sinds 1 maart 2026 komen enkel inkomenscategorie 3 en 4 nog in aanmerking
     voor de dakisolatiepremie (categorie 1 en 2 vallen weg).
   - Categorie 4: 50% van de factuur (excl. btw), max € 5.750.
   - Categorie 3: 35% van de factuur (excl. btw), max € 4.025.
   - Factuurbedrag moet minstens € 1.000 (excl. btw) bedragen.
   - Asbestbonus (enkel cat. 3/4, enkel i.c.m. dakisolatie): € 8/m²,
     begrensd op 50% van het netto factuurbedrag (geen m²-limiet meer
     sinds cat. 1/2 wegvielen — die hadden wel een cap van 100 m²).
   - Voorwaarde: woning aangesloten op elektriciteitsnet vóór 1/1/2006,
     nieuwe isolatie moet Rd ≥ 4,5 m²K/W halen.
   Inkomenscategorie-grenzen (bron: frankenergie.be-overzicht van de
   officiële Vlaamse tabel, per huishoudtype, +€4.420 per persoon ten laste):
     alleenstaand:  cat4 ≤ 24.750 | cat3 ≤ 43.240 | cat2 ≤ 55.020 | cat1 hoger
     koppel:        cat4 ≤ 37.110 | cat3 ≤ 60.520 | cat2 ≤ 78.610 | cat1 hoger
   Vuistregels voor illustratieve doeleinden — geen officiële simulatie.
   Vóór livegang: bedragen/grenzen herbevestigen op mijnverbouwpremie.be. */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };

  var form = $('#calcForm');
  var result = $('#calcResult');
  if (!form || !result) return;

  var fmt = function (n) {
    return '€ ' + Math.round(n).toLocaleString('nl-BE');
  };

  /* ---------- Richtprijzen isolatie per m² (incl. plaatsing, excl. btw) ----------
     Afgeleid uit twee echte INGBELG-offertes (2026): "Renoveren en isoleren
     hellend dak" (Zele, 84 m², 14 cm PIR) en "Vernieuwen en isoleren platdak
     aanbouw" (65 m², 14 cm PIR). Vaste onderdelen (werfinrichting/stelling/
     afvoer, dampscherm, onderdak, tengellatten, stormpan resp. bitumen-
     herstel + Resitrix-dakbedekking) blijven ongewijzigd; enkel de PIR-laag
     zelf (€65/m² bij 14 cm op beide offertes) wordt lineair herschaald naar
     12/16 cm. Nok, gevelpannen, bakgoten, Velux-vensters en afvoeren staan
     NIET in dit bedrag — die zijn per lopende meter/stuk en hangen af van de
     specifieke woning, niet van de dakoppervlakte. */
  var PRIJS_ISOLATIE = {
    hellend: { 12: 209, 14: 218, 16: 227 },
    plat: { 12: 171, 14: 180, 16: 190 }
  };
  /* Gemiddelde marktprijs asbestverwijdering dak (onderzocht 2026, geen
     eigen INGBELG-offerte): hechtgebonden golfplaten ~€8-11/m², leien/
     dakpannen ~€20-40/m², algemeen "hechtgebonden dak" gemiddeld €10-35/m²
     incl. afvoer. €25/m² als middenwaarde over materiaaltypes heen. */
  var PRIJS_ASBEST_M2 = 25;

  /* ---------- Inkomensgrenzen per categorie, per huishoudtype ---------- */
  var GRENZEN = {
    alleenstaand: { cat4: 24750, cat3: 43240, cat2: 55020 },
    koppel: { cat4: 37110, cat3: 60520, cat2: 78610 }
  };
  var TOESLAG_PER_PERSOON = 4420;

  /* ---------- Mijn VerbouwPremie — dakisolatie, per inkomenscategorie ---------- */
  var PREMIE = {
    cat4: { pct: 0.50, cap: 5750 },
    cat3: { pct: 0.35, cap: 4025 },
    ineligible: { pct: 0, cap: 0 }
  };
  var MIN_FACTUUR = 1000;
  var ASBEST_BONUS_M2 = 8;
  var LAMBDA_PIR = 0.022; // W/mK — typische lambda-waarde PIR-isolatie

  var typeLabels = { hellend: 'Hellend dak', plat: 'Plat dak' };

  var readForm = function () {
    return {
      type: $('#calcType').value,
      m2: $('#calcM2').value,
      dikte: $('#calcDikte').value,
      asbest: $('#calcAsbest').checked,
      btw10jaar: $('#calcBtw10jaar').checked,
      gezin: $('#calcGezin').value,
      personen: $('#calcPersonen').value,
      inkomen: $('#calcInkomen').value,
      gemeente: $('#calcGemeente').value
    };
  };

  var bepaalCategorie = function (gezin, personen, inkomen) {
    var basis = GRENZEN[gezin] || GRENZEN.koppel;
    var toeslag = Math.max(0, parseFloat(personen) || 0) * TOESLAG_PER_PERSOON;
    if (inkomen <= basis.cat4 + toeslag) return 'cat4';
    if (inkomen <= basis.cat3 + toeslag) return 'cat3';
    return 'ineligible';
  };

  var calculate = function (data) {
    var m2 = Math.max(0, parseFloat(data.m2) || 0);
    var dikte = parseFloat(data.dikte);
    var isolatiePrijsM2 = (PRIJS_ISOLATIE[data.type] && PRIJS_ISOLATIE[data.type][dikte]) || 0;

    var kostIsolatie = m2 * isolatiePrijsM2;
    var kostAsbest = data.asbest ? m2 * PRIJS_ASBEST_M2 : 0;
    var kostTotaal = kostIsolatie + kostAsbest;

    var inkomenIngevuld = data.inkomen !== '' && data.inkomen !== null;
    var inkomen = parseFloat(data.inkomen) || 0;
    var categorie = inkomenIngevuld ? bepaalCategorie(data.gezin, data.personen, inkomen) : null;
    var premieRegels = categorie ? PREMIE[categorie] : null;

    var factuurTeLaag = kostIsolatie > 0 && kostIsolatie < MIN_FACTUUR;
    var verbouwpremie = 0;
    if (premieRegels && premieRegels.pct > 0 && !factuurTeLaag) {
      verbouwpremie = Math.min(kostIsolatie * premieRegels.pct, premieRegels.cap);
    }

    var asbestBonus = 0;
    var asbestInAanmerking = categorie === 'cat3' || categorie === 'cat4';
    if (data.asbest && asbestInAanmerking && !factuurTeLaag) {
      asbestBonus = Math.min(m2 * ASBEST_BONUS_M2, kostTotaal * 0.5);
    }

    var totaal = verbouwpremie + asbestBonus;

    /* Btw: 6% i.p.v. 21% voor een privéwoning ouder dan 10 jaar (fin.belgium.be),
       los van de inkomenscategorie — geldt voor bijna elke klant. */
    var btwTarief = data.btw10jaar ? 0.06 : 0.21;
    var btwBedrag = kostTotaal * btwTarief;
    var nettoKostprijs = kostTotaal + btwBedrag - totaal;
    var btwVoordeel = data.btw10jaar ? kostTotaal * (0.21 - 0.06) : 0;

    return {
      m2: m2,
      geenOppervlakte: m2 <= 0,
      kostIsolatie: kostIsolatie,
      kostTotaal: kostTotaal,
      rWaarde: (dikte / 100) / LAMBDA_PIR,
      inkomenIngevuld: inkomenIngevuld,
      categorie: categorie,
      verbouwpremie: verbouwpremie,
      premieEligible: !!(premieRegels && premieRegels.pct > 0),
      factuurTeLaag: factuurTeLaag,
      asbest: data.asbest,
      asbestBonus: asbestBonus,
      asbestInAanmerking: asbestInAanmerking,
      totaal: totaal,
      btw10jaar: data.btw10jaar,
      btwTarief: btwTarief,
      btwBedrag: btwBedrag,
      nettoKostprijs: nettoKostprijs,
      btwVoordeel: btwVoordeel,
      gemeente: (data.gemeente || '').trim(),
      type: data.type,
      dikte: dikte
    };
  };

  /* ---------- Kostprijs leeft mee met de invoer ---------- */
  var updateKost = function () {
    var r = calculate(readForm());
    $('#calcKost').value = r.kostTotaal ? fmt(r.kostTotaal) : '';
  };
  ['calcType', 'calcM2', 'calcDikte', 'calcAsbest'].forEach(function (id) {
    var el = $('#' + id);
    el.addEventListener('input', updateKost);
    el.addEventListener('change', updateKost);
  });
  updateKost();

  var CATEGORIE_LABEL = { cat4: 'categorie 4', cat3: 'categorie 3', ineligible: 'categorie 1 of 2' };

  var render = function (r) {
    var rows = '';

    rows += '<li><span>Geschatte kostprijs werken</span><strong>' + fmt(r.kostTotaal) + '</strong></li>';

    rows += '<li><span>Rd-waarde isolatie (indicatief)</span><strong>R ' + r.rWaarde.toFixed(1) + '</strong></li>';

    var sup1 = false, sup2 = false, sup3 = false;

    if (r.geenOppervlakte) {
      rows += '<li><span>Mijn VerbouwPremie</span><em>Vul de dakoppervlakte in&sup1;</em></li>';
      sup1 = true;
    } else if (!r.inkomenIngevuld) {
      rows += '<li><span>Mijn VerbouwPremie</span><em>Vul uw jaarinkomen in voor een berekening&sup2;</em></li>';
      sup2 = true;
    } else if (r.factuurTeLaag) {
      rows += '<li><span>Mijn VerbouwPremie</span><em>Factuurbedrag te laag (min. € 1.000 excl. btw)</em></li>';
    } else {
      rows += '<li><span>Mijn VerbouwPremie (' + CATEGORIE_LABEL[r.categorie] + ')</span>' +
        (r.premieEligible ? '<strong>' + fmt(r.verbouwpremie) + '</strong>' : '<em>Niet beschikbaar bij dit inkomen&sup3;</em>') +
        '</li>';
      sup3 = !r.premieEligible;
    }

    if (r.asbest) {
      var asbestReden;
      if (r.geenOppervlakte) asbestReden = 'Vul de dakoppervlakte in';
      else if (!r.inkomenIngevuld) asbestReden = 'Vul uw jaarinkomen in';
      else if (r.factuurTeLaag) asbestReden = 'Niet van toepassing — factuurbedrag te laag';
      else if (!r.asbestInAanmerking) asbestReden = 'Niet van toepassing bij dit inkomen';
      else asbestReden = 'Niet van toepassing';

      rows += '<li><span>Asbestbonus</span>' +
        (r.asbestBonus > 0 ? '<strong>' + fmt(r.asbestBonus) + '</strong>' : '<em>' + asbestReden + '</em>') +
        '</li>';
    }

    rows += '<li><span>Gemeentelijke premie' + (r.gemeente ? ' (' + r.gemeente + ')' : '') + '</span><em>Te bevestigen — varieert per gemeente</em></li>';

    rows += '<li><span>Btw (' + (r.btwTarief * 100).toFixed(0) + ' %)</span><strong>' + fmt(r.btwBedrag) + '</strong></li>';

    var footnotes = '';
    if (sup1) {
      footnotes += '<p class="calc__placeholder" style="margin-top:16px;font-size:13px">&sup1; Zonder dakoppervlakte kunnen we geen kostprijs of premie berekenen.</p>';
    }
    if (sup2) {
      footnotes += '<p class="calc__placeholder" style="margin-top:16px;font-size:13px">&sup2; Zonder jaarinkomen kunnen we uw inkomenscategorie niet bepalen.</p>';
    }
    if (sup3) {
      footnotes += '<p class="calc__placeholder" style="margin-top:16px;font-size:13px">&sup3; Sinds 1 maart 2026 komen enkel inkomenscategorie 3 en 4 nog in aanmerking voor de dakisolatiepremie.</p>';
    }

    var btwVoordeelRow = r.btw10jaar
      ? '<div class="calc__total"><span>Uw btw-voordeel t.o.v. 21 %</span><strong>' + fmt(r.btwVoordeel) + '</strong></div>'
      : '<p class="calc__placeholder" style="margin-top:12px;font-size:13px">Vink hierboven aan of uw woning ouder dan 10 jaar is voor het btw-voordeel.</p>';

    result.innerHTML =
      '<p class="calc__placeholder" style="margin-bottom:-4px"><strong>' + typeLabels[r.type] + ' — ' + r.dikte + ' cm PIR</strong></p>' +
      '<ul class="calc__breakdown">' + rows + '</ul>' +
      '<div class="calc__total"><span>Geschatte totale premie</span><strong>' + fmt(r.totaal) + '</strong></div>' +
      '<div class="calc__total"><span>Uw geschatte netto kostprijs (incl. btw, na premie)</span><strong>' + fmt(r.nettoKostprijs) + '</strong></div>' +
      btwVoordeelRow +
      '<a class="btn btn--line calc__cta" href="#contact" data-service="Premie-check">Laat dit nakijken tijdens een gratis plaatsbezoek</a>' +
      footnotes;

    if (window.ingbelgTrack) window.ingbelgTrack('premie_check_complete', { totaal: Math.round(r.totaal) });

    var summaryField = $('input[name="premie_summary"]');
    if (summaryField) {
      summaryField.value = typeLabels[r.type] + ', ' + r.m2 + ' m², ' + r.dikte + ' cm PIR' +
        (r.asbest ? ', incl. asbestverwijdering' : '') +
        (r.categorie ? ', ' + CATEGORIE_LABEL[r.categorie] : '') +
        ', geschatte premie ' + fmt(r.totaal) +
        ', geschatte netto kostprijs ' + fmt(r.nettoKostprijs);
    }
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    render(calculate(readForm()));
  });
})();
