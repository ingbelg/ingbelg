/* INGBELG — Premie-calculator (demoversie)
   Gebaseerd op de Mijn VerbouwPremie-regels (dakisolatie), stand 2026:
   sinds 1 maart 2026 komen enkel inkomenscategorie 3 en 4 nog in aanmerking.
   Vuistregels voor illustratieve doeleinden — geen officiële simulatie.
   Vóór livegang: bedragen/percentages afstemmen met mijnverbouwpremie.be. */
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

  /* ---------- Mijn VerbouwPremie — dakisolatie, per inkomenscategorie (2026) ---------- */
  var INKOMEN = {
    hoog: { pct: 0, cap: 0, asbestBonus: false },
    regulier: { pct: 0.35, cap: 4025, asbestBonus: true },
    verhoogd: { pct: 0.50, cap: 5750, asbestBonus: true }
  };
  var ASBEST_BONUS_M2 = 8;
  var ASBEST_BONUS_MAX_M2 = 100;
  var LAMBDA_PIR = 0.022; // W/mK — typische lambda-waarde PIR-isolatie

  var typeLabels = { hellend: 'Hellend dak', plat: 'Plat dak' };

  var readForm = function () {
    return {
      type: $('#calcType').value,
      m2: $('#calcM2').value,
      dikte: $('#calcDikte').value,
      asbest: $('#calcAsbest').checked,
      inkomen: $('#calcInkomen').value,
      gemeente: $('#calcGemeente').value
    };
  };

  var calculate = function (data) {
    var m2 = Math.max(0, parseFloat(data.m2) || 0);
    var dikte = parseFloat(data.dikte);
    var isolatiePrijsM2 = (PRIJS_ISOLATIE[data.type] && PRIJS_ISOLATIE[data.type][dikte]) || 0;

    var kostIsolatie = m2 * isolatiePrijsM2;
    var kostAsbest = data.asbest ? m2 * PRIJS_ASBEST_M2 : 0;
    var kostTotaal = kostIsolatie + kostAsbest;

    var inkomen = INKOMEN[data.inkomen] || INKOMEN.hoog;
    var verbouwpremie = inkomen.pct > 0 ? Math.min(kostTotaal * inkomen.pct, inkomen.cap) : 0;

    var asbestBonus = 0;
    if (data.asbest && inkomen.asbestBonus) {
      asbestBonus = Math.min(m2, ASBEST_BONUS_MAX_M2) * ASBEST_BONUS_M2;
    }

    var subtotal = verbouwpremie + asbestBonus;

    return {
      m2: m2,
      kostTotaal: kostTotaal,
      rWaarde: (dikte / 100) / LAMBDA_PIR,
      verbouwpremie: verbouwpremie,
      inkomenEligible: inkomen.pct > 0,
      asbest: data.asbest,
      asbestBonus: asbestBonus,
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

  var render = function (r) {
    var rows = '';

    rows += '<li><span>Geschatte kostprijs werken</span><strong>' + fmt(r.kostTotaal) + '</strong></li>';

    rows += '<li><span>Rd-waarde isolatie (indicatief)</span><strong>R ' + r.rWaarde.toFixed(1) + '</strong></li>';

    rows += '<li><span>Mijn VerbouwPremie</span>' +
      (r.inkomenEligible ? '<strong>' + fmt(r.verbouwpremie) + '</strong>' : '<em>Niet beschikbaar bij dit inkomen&sup1;</em>') +
      '</li>';

    if (r.asbest) {
      rows += '<li><span>Asbestbonus</span>' +
        (r.asbestBonus > 0 ? '<strong>' + fmt(r.asbestBonus) + '</strong>' : '<em>Niet van toepassing bij dit inkomen</em>') +
        '</li>';
    }

    rows += '<li><span>Gemeentelijke premie' + (r.gemeente ? ' (' + r.gemeente + ')' : '') + '</span><em>Te bevestigen — varieert per gemeente</em></li>';

    var footnote = !r.inkomenEligible
      ? '<p class="calc__placeholder" style="margin-top:16px;font-size:13px">&sup1; Sinds 1 maart 2026 komen enkel inkomenscategorie 3 en 4 nog in aanmerking voor de dakisolatiepremie.</p>'
      : '';

    result.innerHTML =
      '<p class="calc__placeholder" style="margin-bottom:-4px"><strong>' + typeLabels[r.type] + ' — ' + r.dikte + ' cm PIR</strong></p>' +
      '<ul class="calc__breakdown">' + rows + '</ul>' +
      '<div class="calc__total"><span>Geschatte totale premie</span><strong>' +
        (r.subtotalHigh > r.subtotalLow ? fmt(r.subtotalLow) + ' – ' + fmt(r.subtotalHigh) : fmt(r.subtotalLow)) +
      '</strong></div>' +
      '<a class="btn btn--line calc__cta" href="#contact">Vraag de exacte berekening aan</a>' +
      footnote;
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    render(calculate(readForm()));
  });
})();
