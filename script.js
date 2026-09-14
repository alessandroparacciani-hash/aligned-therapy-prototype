(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- */
  /* Header: scrolled state                                             */
  /* ---------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
  }

  /* ---------------------------------------------------------------- */
  /* Slide-out navigation menu                                          */
  /* ---------------------------------------------------------------- */
  var menuToggle = document.getElementById('menuToggle');
  var navMenu = document.getElementById('navMenu');
  var navScrim = document.getElementById('navScrim');

  function openMenu() {
    navMenu.classList.remove('is-closing');
    navMenu.classList.add('is-open');
    navScrim.hidden = false;
    requestAnimationFrame(function () { navScrim.classList.add('is-visible'); });
    menuToggle.setAttribute('aria-expanded', 'true');
    navMenu.setAttribute('aria-hidden', 'false');
    header.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    navMenu.classList.add('is-closing');
    navMenu.classList.remove('is-open');
    navScrim.classList.remove('is-visible');
    menuToggle.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');
    header.classList.remove('menu-open');
    document.body.style.overflow = '';
    setTimeout(function () { if (!navMenu.classList.contains('is-open')) navScrim.hidden = true; }, 220);
  }
  if (menuToggle && navMenu && navScrim) {
    menuToggle.addEventListener('click', function () {
      if (navMenu.classList.contains('is-open')) closeMenu(); else openMenu();
    });
    navScrim.addEventListener('click', closeMenu);
    navMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) closeMenu();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Hero load sequence + image settle                                  */
  /* ---------------------------------------------------------------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(function () {
      setTimeout(function () {
        hero.classList.add('is-loaded');
        hero.classList.add('is-settled');
      }, 80);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Generic reveal-on-scroll                                           */
  /* ---------------------------------------------------------------- */
  var revealSelectors = [
    '.how-it-works__heading', '.stats__intro', '.stats__quote', '.comparison__heading',
    '.comparison__table', '.comparison__aligned-col', '.bristol__header', '.bristol__card', '.therapist__body',
    '.testimonials__heading', '.testimonial-card', '.faq__heading',
    '.cta__heading', '.cta__copy', '.cta .btn'
  ];
  var revealTargets = document.querySelectorAll(revealSelectors.join(','));
  if (prefersReduced) {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  } else if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.22, rootMargin: '0px 0px -10% 0px' });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Therapist photo mask reveal (clip-path based, all three slides share one trigger point) */
  var therapistPhotos = document.querySelectorAll('.therapist__photo');
  if (therapistPhotos.length) {
    if (prefersReduced) {
      therapistPhotos.forEach(function (el) { el.classList.add('is-in'); });
    } else if ('IntersectionObserver' in window) {
      var photoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            photoObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      therapistPhotos.forEach(function (el) { photoObserver.observe(el); });
    } else {
      therapistPhotos.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Large statistic: count smoothly to its final value, once           */
  /* ---------------------------------------------------------------- */
  var statCard = document.querySelector('[data-stat-card]');
  var statNumberEl = document.querySelector('[data-stat-number]');
  var STAT_FINAL = 88;
  var STAT_DURATION = 750;
  function animateStatCount() {
    if (prefersReduced || !statNumberEl) {
      if (statNumberEl) statNumberEl.textContent = STAT_FINAL + '%';
      return;
    }
    var start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / STAT_DURATION);
      var eased = 1 - Math.pow(1 - t, 3);
      statNumberEl.textContent = Math.round(eased * STAT_FINAL) + '%';
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* Stat card + growth chart reveal (drives CSS --bar-h transitions) */
  var chartCard = document.querySelector('[data-chart-card]');
  [statCard, chartCard].forEach(function (card) {
    if (!card) return;
    if (prefersReduced) { card.classList.add('is-in'); if (card === statCard) animateStatCount(); return; }
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            if (entry.target === statCard) animateStatCount();
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      obs.observe(card);
    } else {
      card.classList.add('is-in');
      if (card === statCard) animateStatCount();
    }
  });

  /* ---------------------------------------------------------------- */
  /* FAQ accordion                                                      */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var trigger = item.querySelector('.faq-item__trigger');
    var panel = item.querySelector('.faq-item__panel');
    if (!trigger || !panel) return;
    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(function (openItem) {
        if (openItem === item) return;
        openItem.classList.remove('is-open');
        openItem.querySelector('.faq-item__panel').style.maxHeight = null;
        openItem.querySelector('.faq-item__trigger').setAttribute('aria-expanded', 'false');
      });
      if (isOpen) {
        item.classList.remove('is-open');
        panel.style.maxHeight = null;
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------------------------------------------------------- */
  /* Meet some of our therapists — 3-slide carousel                     */
  /* ---------------------------------------------------------------- */
  (function setupTherapistCarousel() {
    var col = document.getElementById('therapistCol');
    var body = document.getElementById('therapistBody');
    var prevBtn = document.getElementById('therapistPrev');
    var nextBtn = document.getElementById('therapistNext');
    if (!col || !body || !prevBtn || !nextBtn) return;

    var slides = Array.prototype.slice.call(col.querySelectorAll('.therapist__slide'));
    var copies = Array.prototype.slice.call(body.querySelectorAll('.therapist__copy'));
    var count = slides.length;
    var current = 0;

    function go(index) {
      index = (index + count) % count;
      if (index === current) return;
      current = index;
      slides.forEach(function (s) { s.classList.toggle('is-active', +s.dataset.index === current); });
      copies.forEach(function (c) { c.classList.toggle('is-active', +c.dataset.index === current); });
    }

    prevBtn.addEventListener('click', function () { go(current - 1); });
    nextBtn.addEventListener('click', function () { go(current + 1); });
  })();

  /* ---------------------------------------------------------------- */
  /* How It Works — scroll-scrubbed card stack                          */
  /* Per the motion brief: card 01 holds, card 02 slides up from below   */
  /* and settles over card 01 (a small peek of it remains), card 03      */
  /* repeats the same move over card 02. Continuously tied to scroll.    */
  /* ---------------------------------------------------------------- */
  (function setupHowItWorks() {
    var pin = document.getElementById('hiwPin');
    var cardsWrap = document.getElementById('hiwCards');
    var copyLeft = document.getElementById('hiwCopyLeft');
    var copyRight = document.getElementById('hiwCopyRight');
    var diagramCard = document.getElementById('hiwDiagramCard');
    if (!pin || !cardsWrap || !copyLeft || !copyRight) return;

    var copySteps = Array.prototype.slice.call(copyLeft.querySelectorAll('.hiw-copy__step'))
      .concat(Array.prototype.slice.call(copyRight.querySelectorAll('.hiw-copy__step')));

    var cards = [
      cardsWrap.querySelector('.hiw-card--chat'),
      cardsWrap.querySelector('.hiw-card--review'),
      cardsWrap.querySelector('.hiw-card--diagram')
    ];
    if (cards.indexOf(null) !== -1 || copySteps.length !== 3) return;

    if (prefersReduced) {
      pin.style.height = 'auto';
      cards.forEach(function (c) { c.style.position = 'static'; c.style.marginBottom = '24px'; });
      copySteps.forEach(function (s) { s.style.position = 'static'; s.style.opacity = '1'; s.style.marginBottom = '24px'; });
      if (diagramCard) diagramCard.classList.add('is-revealed');
      return;
    }

    var diagramRevealed = false;

    // Depth-slot dimensions for cards still approaching: depth 0 = active, 1 = mid (behind), 2 = back.
    var ACTIVE = { w: 576, h: 384 };
    var MID = { w: 552, h: 368 };
    var BACK = { w: 528, h: 352 };
    var LAYER_OFFSET = 16;
    var EXIT_DISTANCE = 600; // once a card has had its turn, it travels this far up and out — well clear of the frame
    var HOLD_FRACTION = 0.28; // trailing portion of the scroll distance spent holding on card 03

    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function smoothstep(edge0, edge1, x) {
      var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    }
    // depth in [0,2]: 0→1 interpolates active→mid, 1→2 interpolates mid→back
    function depthWidth(d) { d = clamp(d, 0, 2); return d <= 1 ? lerp(ACTIVE.w, MID.w, d) : lerp(MID.w, BACK.w, d - 1); }
    function depthHeight(d) { d = clamp(d, 0, 2); return d <= 1 ? lerp(ACTIVE.h, MID.h, d) : lerp(MID.h, BACK.h, d - 1); }

    function render(p) {
      // p spans [0, 2]: the continuous "active index" — 0 = card 01 active, 1 = card 02, 2 = card 03.
      var progress = clamp(p, 0, 2);

      cards.forEach(function (card, i) {
        var lag = progress - i; // <=0: upcoming/active (stacked below); >0: has had its turn (exits up)
        var w, h, offsetY, z, isExiting;
        if (lag <= 0) {
          var depth = -lag; // 0 = active, 1 = mid, 2 = back
          w = depthWidth(depth);
          h = depthHeight(depth);
          offsetY = LAYER_OFFSET * depth;
          z = Math.round((2 - depth) * 100);
          isExiting = false;
        } else {
          var t = clamp(lag, 0, 1);
          w = ACTIVE.w;
          h = ACTIVE.h;
          offsetY = -t * EXIT_DISTANCE;
          z = 300;
          isExiting = t > 0;
        }
        card.style.width = w + 'px';
        card.style.height = h + 'px';
        card.style.transform = 'translate(-50%, calc(-50% + ' + offsetY + 'px))';
        card.style.zIndex = z;
        card.style.pointerEvents = isExiting ? 'none' : 'auto';
      });

      if (!diagramRevealed && Math.abs(2 - progress) < 0.08 && diagramCard) {
        diagramRevealed = true;
        diagramCard.classList.add('is-revealed');
      }

      // Supporting copy: the outgoing card's text fully fades out before the incoming
      // card's text starts fading in — a clean sequential handoff, never a crossfade.
      copySteps.forEach(function (step) {
        var i = +step.dataset.step;
        var rel = progress - i; // 0 exactly when card i is active
        var o;
        if (rel <= 0) {
          o = smoothstep(-0.35, 0, rel); // fades in during the last 0.35 units of approach
        } else {
          o = 1 - smoothstep(0, 0.35, rel); // fades out during the first 0.35 units after
        }
        step.style.opacity = o;
        step.style.transform = 'translateY(' + (o < 0.5 ? (i === 0 ? -8 : 8) * (1 - o) : 0) + 'px)';
        step.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      });
    }

    function update() {
      var rect = pin.getBoundingClientRect();
      var stickyEl = pin.querySelector('.hiw-sticky');
      var stickyH = stickyEl.offsetHeight;
      var total = pin.offsetHeight - stickyH;
      if (total <= 0) { render(0); return; }
      // Matches the CSS `top: calc(50vh - (module-height / 2))` sticky trigger,
      // so progress starts the instant the module centers in the viewport —
      // no dead scroll before the first transition.
      var stickTop = (window.innerHeight / 2) - (stickyH / 2);
      var scrolled = stickTop - rect.top;
      var frac = clamp(scrolled / total, 0, 1);
      // The last HOLD_FRACTION of the scroll distance is dwell time: card 03 stays
      // fully settled so it doesn't disappear the moment it arrives.
      var activeFrac = clamp(frac / (1 - HOLD_FRACTION), 0, 1);
      render(activeFrac * 2);
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () { update(); ticking = false; });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render(0);
    update();
  })();

})();
