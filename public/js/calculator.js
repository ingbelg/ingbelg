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

  /* ---------- Richtprijzen isolatie per m² (incl. plaatsing, excl. btw) ---------- */
  var PRIJS_ISOLATIE = {
    hellend: { 12: 38, 14: 45, 16: 52 },
    plat: { 12: 85, 14: 95, 16: 105 }
  };
  var PRIJS_ASBEST_M2 = 30;

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

    var subtotal = verbouwpremie + asbestBonus;

    return {
      m2: m2,
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
      subtotalLow: subtotal,
      subtotalHigh: subtotal > 0 ? subtotal * 1.1 : 0,
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

    if (!r.inkomenIngevuld) {
      rows += '<li><span>Mijn VerbouwPremie</span><em>Vul uw jaarinkomen in voor een berekening&sup1;</em></li>';
    } else if (r.factuurTeLaag) {
      rows += '<li><span>Mijn VerbouwPremie</span><em>Factuurbedrag te laag (min. € 1.000 excl. btw)</em></li>';
    } else {
      rows += '<li><span>Mijn VerbouwPremie (' + CATEGORIE_LABEL[r.categorie] + ')</span>' +
        (r.premieEligible ? '<strong>' + fmt(r.verbouwpremie) + '</strong>' : '<em>Niet beschikbaar bij dit inkomen&sup2;</em>') +
        '</li>';
    }

    if (r.asbest) {
      rows += '<li><span>Asbestbonus</span>' +
        (r.asbestBonus > 0 ? '<strong>' + fmt(r.asbestBonus) + '</strong>' : '<em>Niet van toepassing bij dit inkomen</em>') +
        '</li>';
    }

    rows += '<li><span>Gemeentelijke premie' + (r.gemeente ? ' (' + r.gemeente + ')' : '') + '</span><em>Te bevestigen — varieert per gemeente</em></li>';

    var footnotes = '';
    if (!r.inkomenIngevuld) {
      footnotes += '<p class="calc__placeholder" style="margin-top:16px;font-size:13px">&sup1; Zonder jaarinkomen kunnen we uw inkomenscategorie niet bepalen.</p>';
    } else if (!r.premieEligible && !r.factuurTeLaag) {
      footnotes += '<p class="calc__placeholder" style="margin-top:16px;font-size:13px">&sup2; Sinds 1 maart 2026 komen enkel inkomenscategorie 3 en 4 nog in aanmerking voor de dakisolatiepremie.</p>';
    }

    result.innerHTML =
      '<p class="calc__placeholder" style="margin-bottom:-4px"><strong>' + typeLabels[r.type] + ' — ' + r.dikte + ' cm PIR</strong></p>' +
      '<ul class="calc__breakdown">' + rows + '</ul>' +
      '<div class="calc__total"><span>Geschatte totale premie</span><strong>' +
        (r.subtotalHigh > r.subtotalLow ? fmt(r.subtotalLow) + ' – ' + fmt(r.subtotalHigh) : fmt(r.subtotalLow)) +
      '</strong></div>' +
      '<a class="btn btn--line calc__cta" href="#contact">Vraag de exacte berekening aan</a>' +
      footnotes;
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    render(calculate(readForm()));
  });
})();
