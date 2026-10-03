/* INGBELG — Cookie-consent (Consent Mode v2, per categorie) + eenvoudige eventtracking (T-01/T-04)

   Categorieën:
   - noodzakelijk : altijd aan (enkel localStorage 'ingbelg_consent', onthoudt de keuze)
   - analytics    : Google Analytics 4, pas geladen na toestemming
   - external     : externe inhoud van derden (Google-reviews via Trustindex), pas geladen na toestemming
   - marketing    : Google Ads (conversiemeting), ENKEL actief als PUBLIC_ADS_ID is ingesteld (data-ads-id op <body>).
                    Zonder dat ID bestaat deze categorie niet en blijven alle advertentie-signalen op 'denied'. */
(function () {
  'use strict';

  var STORAGE_KEY = 'ingbelg_consent';
  var body = document.body;
  var gaId = body.getAttribute('data-ga-id') || '';
  var adsId = body.getAttribute('data-ads-id') || '';
  var hasAds = !!adsId;
  /* Conversielabels van Google Ads (optioneel): event van de site → label uit het Ads-account. */
  var adsLabels = {
    lead_form_submit: body.getAttribute('data-ads-lead-label') || '',
    click_call: body.getAttribute('data-ads-call-label') || '',
    click_whatsapp: body.getAttribute('data-ads-whatsapp-label') || ''
  };

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ---------- Opslag ---------- */
  var read = function () {
    var raw = null;
    try { raw = window.localStorage.getItem(STORAGE_KEY); } catch (e) { /* privé-modus */ }
    if (!raw) return null;
    try {
      var o = JSON.parse(raw);
      if (o && o.v === 2) {
        /* Advertenties net ingeschakeld en de bezoeker kreeg de marketingvraag nog niet → opnieuw vragen. */
        if (hasAds && typeof o.marketing === 'undefined') return null;
        return { analytics: !!o.analytics, external: !!o.external, marketing: hasAds && !!o.marketing };
      }
    } catch (e) { /* oude waarde 'granted'/'denied' (v1) → opnieuw vragen */ }
    return null;
  };
  var write = function (c) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: 2, analytics: !!c.analytics, external: !!c.external, marketing: hasAds && !!c.marketing,
        ts: new Date().toISOString()
      }));
    } catch (e) { /* privé-modus */ }
  };

  /* ---------- Google tag (Analytics en/of Ads) ---------- */
  var configured = { ga: false, ads: false };
  var loadGtag = function () {
    var id = gaId || adsId;
    if (!id || document.getElementById('gtag-script')) return;
    var s = document.createElement('script');
    s.id = 'gtag-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.gtag('js', new Date());
  };
  var applyConsent = function (c) {
    var ads = hasAds && c.marketing ? 'granted' : 'denied';
    window.gtag('consent', 'update', {
      ad_storage: ads,
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_user_data: ads,
      ad_personalization: ads
    });
    if (c.analytics || (hasAds && c.marketing)) loadGtag();
    if (c.analytics && gaId && !configured.ga) { window.gtag('config', gaId); configured.ga = true; }
    if (hasAds && c.marketing && !configured.ads) { window.gtag('config', adsId); configured.ads = true; }
  };
  var clearGoogleCookies = function () {
    var parts = window.location.hostname.split('.');
    var domains = ['', window.location.hostname, '.' + window.location.hostname, '.' + parts.slice(-2).join('.')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl|_gac)/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + (d ? ';domain=' + d : '');
      });
    });
  };

  /* ---------- Externe inhoud (Trustindex-widgets) ---------- */
  var loadExternal = function () {
    $$('.ti-slot[data-ti]').forEach(function (slot) {
      if (slot.getAttribute('data-loaded')) return;
      slot.setAttribute('data-loaded', '1');
      slot.innerHTML = '';
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://cdn.trustindex.io/loader.js?' + slot.getAttribute('data-ti');
      slot.appendChild(s);
    });
  };

  /* ---------- Banner ---------- */
  var bar = $('#cookiebar');
  var prefs = $('#cookiePrefs');
  var prefAnalytics = $('#prefAnalytics');
  var prefExternal = $('#prefExternal');
  var prefMarketing = $('#prefMarketing');
  var btnSettings = $('#cookieSettings');
  var prefsOpen = false;
  var none = { analytics: false, external: false, marketing: false };

  var setPrefsOpen = function (open) {
    prefsOpen = open;
    if (prefs) prefs.hidden = !open;
    if (btnSettings) {
      var label = btnSettings.querySelector('span');
      if (label) label.textContent = open ? 'Keuze opslaan' : 'Instellingen';
    }
  };
  var showBar = function (withPrefs) {
    if (!bar) return;
    var cur = read() || none;
    if (prefAnalytics) prefAnalytics.checked = cur.analytics;
    if (prefExternal) prefExternal.checked = cur.external;
    if (prefMarketing) prefMarketing.checked = cur.marketing;
    setPrefsOpen(!!withPrefs);
    bar.hidden = false;
  };
  var hideBar = function () { if (bar) bar.hidden = true; };

  var save = function (c) {
    var prev = read();
    write(c);
    hideBar();
    var revoked = prev && ((prev.analytics && !c.analytics) || (prev.external && !c.external) || (prev.marketing && !c.marketing));
    if (revoked) {
      // Ingetrokken: Google-cookies wissen en de pagina herladen zodat externe scripts verdwijnen.
      clearGoogleCookies();
      window.location.reload();
      return;
    }
    applyConsent(c);
    if (c.external) loadExternal();
  };

  var acceptBtn = $('#cookieAccept');
  var rejectBtn = $('#cookieReject');
  if (acceptBtn) acceptBtn.addEventListener('click', function () { save({ analytics: true, external: true, marketing: true }); });
  if (rejectBtn) rejectBtn.addEventListener('click', function () { save(none); });
  if (btnSettings) btnSettings.addEventListener('click', function () {
    if (!prefsOpen) { setPrefsOpen(true); return; }
    save({
      analytics: !!(prefAnalytics && prefAnalytics.checked),
      external: !!(prefExternal && prefExternal.checked),
      marketing: !!(prefMarketing && prefMarketing.checked)
    });
  });

  /* Footer/cookiebeleid: "Cookie-instellingen" heropent de banner met de huidige keuze. */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); showBar(true); }
    var ext = e.target.closest && e.target.closest('[data-consent-external]');
    if (ext) {
      e.preventDefault();
      var cur = read() || none;
      save({ analytics: cur.analytics, external: true, marketing: cur.marketing });
    }
  });

  window.ingbelgConsent = { open: function () { showBar(true); }, get: read };

  /* ---------- Start ---------- */
  var stored = read();
  if (stored) {
    applyConsent(stored);
    if (stored.external) loadExternal();
  } else {
    showBar(false);
  }

  /* ---------- Eventtracking ---------- */
  window.ingbelgTrack = function (name, params) {
    window.dataLayer = window.dataLayer || [];
    window.gtag('event', name, params || {});
    /* Google Ads-conversie: enkel met toestemming voor marketing en als er een label is ingesteld. */
    var label = adsLabels[name];
    var cur = read();
    if (hasAds && label && cur && cur.marketing) {
      window.gtag('event', 'conversion', { send_to: adsId + '/' + label });
    }
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) window.ingbelgTrack('click_call');
    else if (href.indexOf('wa.me') !== -1) window.ingbelgTrack('click_whatsapp');
  });
})();
