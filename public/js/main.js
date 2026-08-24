/* INGBELG — interacties */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Jaartal in footer ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header ---------- */
  var header = $('#header');
  var onScroll = function () {
    header.classList.toggle('is-stuck', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobiel menu ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  var closeNav = function () {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', closeNav); });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var sibs = Array.prototype.slice.call(el.parentNode.children).filter(function (n) {
          return n.classList && n.classList.contains('reveal');
        });
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 90 + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Tellers ---------- */
  var counters = $$('[data-count]');
  var runCounter = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600, t0 = null;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ---------- Actieve nav-link ---------- */
  var sections = $$('section[id]');
  var navLinks = $$('.nav > ul > li > a');
  var setActive = function () {
    var pos = window.scrollY + 140, current = 'top';
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
  };
  setActive();
  window.addEventListener('scroll', setActive, { passive: true });

  /* ---------- FAQ: één item tegelijk open ---------- */
  var faqItems = $$('#faqList .faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* ---------- Voor/na sliders ---------- */
  $$('.ba__slider').forEach(function (slider) {
    var range = $('.ba__range', slider);
    var after = $('.ba__img--after', slider);
    var handle = $('.ba__handle', slider);
    if (!range || !after || !handle) return;
    var updateBa = function () {
      var v = range.value;
      after.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
      handle.style.left = v + '%';
    };
    range.addEventListener('input', updateBa);
    updateBa();
  });

  /* ---------- Lightbox ---------- */
  var figures = $$('#gallery .gal');
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCount = $('#lbCount');
  var idx = 0;

  var show = function (i) {
    idx = (i + figures.length) % figures.length;
    var img = figures[idx].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCount.textContent = (idx + 1) + ' / ' + figures.length;
  };
  var openLb = function (i) {
    show(i);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  var closeLb = function () {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  figures.forEach(function (f, i) {
    f.addEventListener('click', function () { openLb(i); });
  });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  $('#lbNext').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  window.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* ---------- Formulier ---------- */
  var form = $('#offerteForm');
  var msg = $('#formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'cform__msg';
    msg.textContent = '';

    var ok = true;
    $$('input, select, textarea', form).forEach(function (f) {
      f.classList.remove('is-error');
      if (f.hasAttribute('required')) {
        var valid = f.type === 'checkbox' ? f.checked : f.value.trim() !== '';
        if (valid && f.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim());
        if (!valid) { f.classList.add('is-error'); ok = false; }
      }
    });

    if (!ok) {
      msg.className = 'cform__msg err';
      msg.textContent = 'Vul alstublieft alle verplichte velden correct in.';
      return;
    }

    var d = new FormData(form);
    var payload = {
      naam: d.get('naam'),
      telefoon: d.get('telefoon'),
      email: d.get('email'),
      gemeente: d.get('gemeente') || '',
      dienst: d.get('dienst'),
      bericht: d.get('bericht') || ''
    };

    var fallbackToMailto = function () {
      var body =
        'Naam: ' + payload.naam + '\n' +
        'Telefoon: ' + payload.telefoon + '\n' +
        'E-mail: ' + payload.email + '\n' +
        'Gemeente: ' + (payload.gemeente || '-') + '\n' +
        'Dienst: ' + payload.dienst + '\n\n' +
        'Project:\n' + (payload.bericht || '-');

      window.location.href = 'mailto:info@ingbelg.be'
        + '?subject=' + encodeURIComponent('Offerteaanvraag — ' + payload.dienst)
        + '&body=' + encodeURIComponent(body);

      msg.className = 'cform__msg ok';
      msg.textContent = 'Bedankt! Uw e-mailprogramma opent met de aanvraag. Wij antwoorden binnen 48 uur.';
      form.reset();
    };

    msg.className = 'cform__msg';
    msg.textContent = 'Verzenden…';

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('server responded ' + res.status);
      return res.json();
    }).then(function () {
      msg.className = 'cform__msg ok';
      msg.textContent = 'Bedankt! Uw aanvraag is verstuurd. Wij antwoorden binnen 48 uur.';
      form.reset();
    }).catch(function () {
      // Server niet bereikbaar (bv. statische hosting zonder /api) — terugval op mailto.
      fallbackToMailto();
    });
  });
})();
