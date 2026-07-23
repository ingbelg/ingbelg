/* INGBELG — Premie-calculator (demoversie)
   Vereenvoudigde vuistregels voor illustratieve doeleinden.
   Vóór livegang: bedragen/percentages afstemmen met actuele Fluvius- en
   Vlaamse-overheidstarieven. */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };

  var form = $('#calcForm');
  var result = $('#calcResult');
  if (!form || !result) return;

  var fmt = function (n) {
    return '€ ' + Math.round(n).toLocaleString('nl-BE');
  };

  /* ---------- Tarieven (illustratief, demo) ---------- */
  var DAKISOLATIE = {
    hellend: { perM2: 6 },
    plat: { perM2: 5 },
    totaal: { perM2: 6 }
  };
  var R_FACTOR = { hoog: 1, midden: 0.4, laag: 0 };
  var INKOMEN_BONUS_M2 = { regulier: 0, verhoogd: 3 };
  var VLAAMSE_PCT = { regulier: 0.30, verhoogd: 0.40 };
  var VLAAMSE_CAP = { regulier: 10000, verhoogd: 15000 };
  var TOTAAL_BONUS = 2500;

  var calculate = function (data) {
    var m2 = Math.max(0, parseFloat(data.m2) || 0);
    var kost = Math.max(0, parseFloat(data.kost) || 0);
    var rFactor = R_FACTOR[data.rwaarde] != null ? R_FACTOR[data.rwaarde] : 0;
    var perM2 = DAKISOLATIE[data.type].perM2 + INKOMEN_BONUS_M2[data.inkomen];

    var fluvius = m2 * perM2 * rFactor;

    var vlaamsePct = VLAAMSE_PCT[data.inkomen];
    var vlaamseCap = VLAAMSE_CAP[data.inkomen];
    var vlaamse = Math.min(kost * vlaamsePct, vlaamseCap);

    var totaalBonus = 0;
    if (data.type === 'totaal' && data.bouwjaar === 'oud' && rFactor > 0) {
      totaalBonus = TOTAAL_BONUS;
    }

    var subtotal = fluvius + vlaamse + totaalBonus;

    return {
      fluvius: fluvius,
      vlaamse: vlaamse,
      totaalBonus: totaalBonus,
      subtotalLow: subtotal,
      subtotalHigh: subtotal * 1.12,
      gemeente: (data.gemeente || '').trim()
    };
  };

  var typeLabels = {
    hellend: 'Dakisolatie — hellend dak',
    plat: 'Dakisolatie — plat dak',
    totaal: 'Dakisolatie + zonnepanelen'
  };

  var render = function (r, data) {
    var rows = '';

    rows += '<li><span>Fluvius dakisolatiepremie</span>' +
      (r.fluvius > 0 ? '<strong>' + fmt(r.fluvius) + '</strong>' : '<em>Niet van toepassing bij deze R-waarde</em>') +
      '</li>';

    rows += '<li><span>Vlaamse renovatiepremie (Mijn VerbouwPremie)</span><strong>' + fmt(r.vlaamse) + '</strong></li>';

    rows += '<li><span>Totaalrenovatiebonus</span>' +
      (r.totaalBonus > 0 ? '<strong>' + fmt(r.totaalBonus) + '</strong>' : '<em>Voorwaarden niet vervuld</em>') +
      '</li>';

    rows += '<li><span>Gemeentelijke premie' + (r.gemeente ? ' (' + r.gemeente + ')' : '') + '</span><em>Te bevestigen — varieert per gemeente</em></li>';

    result.innerHTML =
      '<p class="calc__placeholder" style="margin-bottom:-4px"><strong>' + typeLabels[data.type] + '</strong></p>' +
      '<ul class="calc__breakdown">' + rows + '</ul>' +
      '<div class="calc__total"><span>Geschatte totale premie</span><strong>' + fmt(r.subtotalLow) + ' – ' + fmt(r.subtotalHigh) + '</strong></div>' +
      '<a class="btn btn--line calc__cta" href="#contact">Vraag de exacte berekening aan</a>';
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      type: $('#calcType').value,
      m2: $('#calcM2').value,
      rwaarde: $('#calcR').value,
      kost: $('#calcKost').value,
      bouwjaar: $('#calcBouwjaar').value,
      inkomen: $('#calcInkomen').value,
      gemeente: $('#calcGemeente').value
    };
    render(calculate(data), data);
  });
})();
