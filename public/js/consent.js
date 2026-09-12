/* INGBELG — Cookie-consent (Consent Mode v2) + eenvoudige eventtracking (T-01/T-04) */
(function () {
  'use strict';

  var STORAGE_KEY = 'ingbelg_consent'; // 'granted' | 'denied'
  var gaId = document.body.getAttribute('data-ga-id') || '';

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

  var updateConsent = function (granted) {
    window.gtag('consent', 'update', {
      ad_storage: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
    });
    if (granted) loadGa();
  };

  var stored = null;
  try { stored = window.localStorage.getItem(STORAGE_KEY); } catch (e) { /* privé-modus */ }

  if (stored === 'granted') {
    updateConsent(true);
  } else if (stored !== 'denied') {
    var bar = document.getElementById('cookiebar');
    if (bar) bar.hidden = false;
  }

  var setConsent = function (granted) {
    try { window.localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied'); } catch (e) { /* privé-modus */ }
    updateConsent(granted);
    var bar = document.getElementById('cookiebar');
    if (bar) bar.hidden = true;
  };

  var acceptBtn = document.getElementById('cookieAccept');
  var rejectBtn = document.getElementById('cookieReject');
  if (acceptBtn) acceptBtn.addEventListener('click', function () { setConsent(true); });
  if (rejectBtn) rejectBtn.addEventListener('click', function () { setConsent(false); });

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
