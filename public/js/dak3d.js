/* INGBELG — 'Uw dak, laag per laag' (startpagina).
   Vooraf gerenderde beelden (eigen Blender-model), geen WebGL.
   - Dit script zelf wordt pas geladen na de eerste interactie (zie RoofLayers.astro); beelden pas als de sectie op ~250 px is.
   - Telefoon (≤ 760 px): kleinere beelden uit /m/.
   - 'Minder beweging' of geen canvas: het stilstaande beeld blijft staan, alle stappen zichtbaar.
   - Tekenen alleen tijdens scrollen (requestAnimationFrame), geen lus in de achtergrond. */
(function () {
  var sec = document.querySelector('.dak3d');
  if (!sec) return;
  var canvas = sec.querySelector('.dak3d__canvas');
  var stage = sec.querySelector('.dak3d__stage');
  var oneCol = window.matchMedia('(max-width: 900px)');
  var steps = Array.prototype.slice.call(sec.querySelectorAll('.dak3d__step'));
  // stilstaand beeld (ook voor 'minder beweging'): pas nu invullen, het script laadt na de eerste interactie
  var poster = sec.querySelector('img.dak3d__poster[data-src]');
  if (poster) {
    if (poster.getAttribute('data-srcset')) poster.setAttribute('srcset', poster.getAttribute('data-srcset'));
    poster.src = poster.getAttribute('data-src');
  }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !canvas || !canvas.getContext || !('IntersectionObserver' in window)) return;

  var ctx = null;   // pas aanmaken als de sectie in de buurt komt
  var N = parseInt(sec.getAttribute('data-frames'), 10) || 57;
  var small = window.matchMedia('(max-width: 760px)').matches;
  var base = '/assets/dak3d/' + (small ? 'm' : 'd') + '/f';
  var imgs = new Array(N);
  var loaded = new Array(N);
  var started = false, ticking = false, current = -1, active = -1;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function load() {
    if (started) return;
    started = true;
    // eerst de beelden bij de stappen, dan de rest: zo is er snel iets te zien
    var order = [];
    steps.forEach(function (s) { order.push(+s.getAttribute('data-frame')); });
    for (var i = 0; i < N; i++) if (order.indexOf(i) < 0) order.push(i);
    var next = 0, running = 0;
    function pump() {
      while (running < 4 && next < order.length) {
        (function (i) {
          running++;
          var im = new Image();
          im.decoding = 'async';
          im.onload = function () { loaded[i] = true; running--; if (i === want()) draw(true); pump(); };
          im.onerror = function () { running--; pump(); };
          im.src = base + pad(i) + '.webp';
          imgs[i] = im;
        })(order[next++]);
      }
    }
    pump();
  }

  // leeslijn: midden van het scherm; op de telefoon staat het beeld bovenaan vast, dan het midden van de ruimte eronder
  function line() {
    if (!oneCol.matches) return window.innerHeight * 0.5;
    var b = stage.getBoundingClientRect().bottom;
    return b + (window.innerHeight - b) * 0.4;
  }

  // welk beeld hoort bij de huidige scrollpositie: tussen de middens van twee stappen wordt geïnterpoleerd
  function want() {
    var mid = line();
    var c = steps.map(function (s) { var r = s.getBoundingClientRect(); return r.top + r.height / 2; });
    var f = steps.map(function (s) { return +s.getAttribute('data-frame'); });
    if (mid <= c[0]) return f[0];
    for (var i = 0; i < c.length - 1; i++) {
      if (mid <= c[i + 1]) {
        var p = (mid - c[i]) / Math.max(1, c[i + 1] - c[i]);
        return Math.round(f[i] + p * (f[i + 1] - f[i]));
      }
    }
    return f[f.length - 1];
  }

  function nearestLoaded(i) {
    for (var d = 0; d < N; d++) {
      if (loaded[i - d]) return i - d;
      if (loaded[i + d]) return i + d;
    }
    return -1;
  }

  function draw(force) {
    var i = nearestLoaded(want());
    if (i < 0 || (i === current && !force)) return;
    current = i;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgs[i], 0, 0, canvas.width, canvas.height);
    if (!sec.classList.contains('is-live')) sec.classList.add('is-live');
  }

  function mark() {
    var mid = line(), best = 0, bd = Infinity;
    steps.forEach(function (s, i) {
      var r = s.getBoundingClientRect(); var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    if (best !== active) {
      if (active >= 0) steps[active].classList.remove('is-active');
      steps[best].classList.add('is-active');
      active = best;
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; mark(); draw(false); });
  }

  // bij het laden van de pagina doet dit script niets behalve twee observers zetten:
  // geen metingen (die dwingen een volledige lay-out af), geen klassen, geen listeners
  var near = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        if (!ctx) { ctx = canvas.getContext('2d'); sec.classList.add('is-js'); }
        var go = function () { load(); };
        if (document.readyState === 'complete') ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 200));
        else window.addEventListener('load', go, { once: true });
        near.disconnect();
      }
    });
  }, { rootMargin: '250px 0px' });
  near.observe(sec);

  var inView = false;
  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting && !inView) {
        inView = true;
        if (!ctx) { ctx = canvas.getContext('2d'); sec.classList.add('is-js'); }
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        onScroll();
      } else if (!e.isIntersecting && inView) {
        inView = false;
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    });
  }).observe(sec);
})();
