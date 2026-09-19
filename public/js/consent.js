/* INGBELG — Cookie-consent (Consent Mode v2, per categorie) + eenvoudige eventtracking (T-01/T-04)

   Categorieën:
   - noodzakelijk : altijd aan (enkel localStorage 'ingbelg_consent', onthoudt de keuze)
   - analytics    : Google Analytics 4, pas geladen na toestemming
   - external     : externe inhoud van derden (Google-reviews via Trustindex), pas geladen na toestemming
   Advertentie-signalen staan altijd op 'denied': deze site gebruikt geen advertenties. */
(function () {
  'use strict';

  var STORAGE_KEY = 'ingbelg_consent';
  var gaId = document.body.getAttribute('data-ga-id') || '';

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ---------- Opslag ---------- */
  var read = function () {
    var raw = null;
    try { raw = window.localStorage.getItem(STORAGE_KEY); } catch (e) { /* privé-modus */ }
    if (!raw) return null;
    try {
      var o = JSON.parse(raw);
      if (o && o.v === 2) return { analytics: !!o.analytics, external: !!o.external };
    } catch (e) { /* oude waarde 'granted'/'denied' (v1) → opnieuw vragen */ }
    return null;
  };
  var write = function (c) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: 2, analytics: !!c.analytics, external: !!c.external, ts: new Date().toISOString()
      }));
    } catch (e) { /* privé-modus */ }
  };

  /* ---------- Google Analytics ---------- */
  var loadGa = function () {
    if (!gaId || document.getElementById('ga4-script')) return;
    var s = document.createElement('script');
    s.id = 'ga4-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  };
  var applyAnalytics = function (on) {
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      analytics_storage: on ? 'granted' : 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (on) loadGa();
  };
  var clearGaCookies = function () {
    var parts = window.location.hostname.split('.');
    var domains = ['', window.location.hostname, '.' + window.location.hostname, '.' + parts.slice(-2).join('.')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat)/.test(name)) return;
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
  var btnSettings = $('#cookieSettings');
  var prefsOpen = false;

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
    var cur = read() || { analytics: false, external: false };
    if (prefAnalytics) prefAnalytics.checked = cur.analytics;
    if (prefExternal) prefExternal.checked = cur.external;
    setPrefsOpen(!!withPrefs);
    bar.hidden = false;
  };
  var hideBar = function () { if (bar) bar.hidden = true; };

  var save = function (c) {
    var prev = read();
    write(c);
    hideBar();
    var revoked = prev && ((prev.analytics && !c.analytics) || (prev.external && !c.external));
    if (revoked) {
      // Ingetrokken: analytics-cookies wissen en de pagina herladen zodat externe scripts verdwijnen.
      clearGaCookies();
      window.location.reload();
      return;
    }
    applyAnalytics(c.analytics);
    if (c.external) loadExternal();
  };

  var acceptBtn = $('#cookieAccept');
  var rejectBtn = $('#cookieReject');
  if (acceptBtn) acceptBtn.addEventListener('click', function () { save({ analytics: true, external: true }); });
  if (rejectBtn) rejectBtn.addEventListener('click', function () { save({ analytics: false, external: false }); });
  if (btnSettings) btnSettings.addEventListener('click', function () {
    if (!prefsOpen) { setPrefsOpen(true); return; }
    save({ analytics: !!(prefAnalytics && prefAnalytics.checked), external: !!(prefExternal && prefExternal.checked) });
  });

  /* Footer/cookiebeleid: "Cookie-instellingen" heropent de banner met de huidige keuze. */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); showBar(true); }
    var ext = e.target.closest && e.target.closest('[data-consent-external]');
    if (ext) {
      e.preventDefault();
      var cur = read() || { analytics: false, external: false };
      save({ analytics: cur.analytics, external: true });
    }
  });

  window.ingbelgConsent = { open: function () { showBar(true); }, get: read };

  /* ---------- Start ---------- */
  var stored = read();
  if (stored) {
    applyAnalytics(stored.analytics);
    if (stored.external) loadExternal();
  } else {
    showBar(false);
  }

  /* ---------- Eventtracking ---------- */
  window.ingbelgTrack = function (name, params) {
    window.dataLayer = window.dataLayer || [];
    window.gtag('event', name, params || {});
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) window.ingbelgTrack('click_call');
    else if (href.indexOf('wa.me') !== -1) window.ingbelgTrack('click_whatsapp');
  });
})();
