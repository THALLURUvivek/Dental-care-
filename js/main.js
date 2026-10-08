/* =========================================================
   LUMINA DENTAL — Animations & Interactions
   ========================================================= */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------------------------------------------------------
     1. PRELOADER
  --------------------------------------------------------- */
  function runPreloader() {
    const pre = $('#preloader');
    const bar = pre ? pre.querySelector('.preloader__bar span') : null;

    const finish = () => {
      document.body.classList.remove('is-loading');
      initHero();
    };

    if (!pre) { finish(); return; }

    if (!hasGSAP || prefersReduced) {
      if (bar) bar.style.width = '100%';
      setTimeout(() => { pre.style.display = 'none'; finish(); }, 400);
      return;
    }

    const tl = gsap.timeline();
    tl.to(bar, { width: '100%', duration: 1.1, ease: 'power2.inOut' })
      .to(pre.querySelector('.preloader__inner'), { y: -24, opacity: 0, duration: .5, ease: 'power2.in' }, '-=.15')
      .to(pre, {
        yPercent: -100, duration: .8, ease: 'power4.inOut',
        onComplete: () => { pre.style.display = 'none'; }
      }, '-=.1')
      .add(finish, '-=.5');
  }

  /* ---------------------------------------------------------
     2. TEXT SPLITTER (word-level reveal)
  --------------------------------------------------------- */
  function splitWords(el) {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = '';
    const frag = document.createDocumentFragment();

    text.split(/\s+/).forEach((word, i, arr) => {
      const line = document.createElement('span');
      line.className = 'line';
      line.setAttribute('aria-hidden', 'true');

      const inner = document.createElement('span');
      inner.className = 'word';
      inner.textContent = word;

      line.appendChild(inner);
      frag.appendChild(line);
      if (i < arr.length - 1) frag.appendChild(document.createTextNode(' '));
    });

    el.appendChild(frag);
    return $$('.word', el);
  }

  /* ---------------------------------------------------------
     3. HERO ENTRANCE
  --------------------------------------------------------- */
  let heroDone = false;
  function initHero() {
    if (heroDone) return;
    heroDone = true;

    const title = $('.hero__title');
    const words = title ? splitWords(title) : [];

    if (!hasGSAP || prefersReduced) {
      if (title) title.style.opacity = 1;
      $$('[data-hero]').forEach(el => { el.style.opacity = 1; });
      startCounters();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    /* only tween elements that actually exist on this page */
    const add = (sel, vars, pos) => {
      const els = $$(sel);
      if (els.length) tl.from(els, vars, pos);
    };

    if (words.length) {
      gsap.set(words, { yPercent: 115, rotate: 5 });
      tl.to(words, { yPercent: 0, rotate: 0, duration: 1, stagger: .055 }, 0);
    }

    add('[data-hero="1"]', { y: 24, opacity: 0, duration: .7 }, .1);
    add('[data-hero="2"]', { y: 26, opacity: 0, duration: .75 }, '-=.45');
    add('[data-hero="3"]', { y: 26, opacity: 0, duration: .75 }, '-=.5');
    tl.call(startCounters, null, '-=.5');
    add('[data-hero="4"]', { y: 26, opacity: 0, duration: .75 }, '-=.55');
    add('[data-hero="5"]', { scale: .92, opacity: 0, duration: 1.05, ease: 'power4.out' }, '-=1.05');
    add('[data-hero="6"]', { x: -46, opacity: 0, duration: .8 }, '-=.6');
    add('[data-hero="7"]', { x: 46, opacity: 0, duration: .8 }, '-=.7');

    /* floating decorations */
    $$('[data-float]').forEach((el, i) => {
      gsap.to(el, {
        y: i % 2 === 0 ? -18 : 16,
        x: i % 2 === 0 ? 8 : -8,
        rotation: i % 2 === 0 ? 8 : -6,
        duration: 3 + i * .45,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    /* subtle parallax on hero image */
    const heroImg = $('.hero__img');
    if (heroImg && window.gsap && window.ScrollTrigger) {
      gsap.to(heroImg, {
        yPercent: 10, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 }
      });
    }
  }

  /* ---------------------------------------------------------
     4. SCROLL REVEALS
  --------------------------------------------------------- */
  function initReveals() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    if (!hasGSAP || prefersReduced || !window.ScrollTrigger) {
      items.forEach(el => { el.style.opacity = 1; });
      return;
    }

    items.forEach(el => {
      const dir = el.dataset.reveal;
      const from = { opacity: 0, duration: .95, ease: 'power3.out' };

      if (dir === 'left')   from.x = -60;
      if (dir === 'right')  from.x = 60;
      if (dir === 'up')     from.y = 52;
      if (dir === 'down')   from.y = -52;
      if (dir === 'scale')  { from.scale = .9; from.y = 34; }

      gsap.fromTo(el, from, {
        opacity: 1, x: 0, y: 0, scale: 1,
        duration: from.duration, ease: from.ease,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* stagger children of grids for a richer cascade */
    $$('.row.g-4').forEach(row => {
      const kids = Array.from(row.children);
      if (kids.length < 3) return;
      if (kids.some(k => k.hasAttribute('data-reveal'))) return;
      gsap.fromTo(kids,
        { y: 46, opacity: 0 },
        {
          y: 0, opacity: 1, duration: .8, stagger: .1, ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 85%', once: true }
        });
    });
  }

  /* ---------------------------------------------------------
     5. COUNTERS
  --------------------------------------------------------- */
  let countersStarted = false;
  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;

    $$('.counter').forEach(el => {
      const raw = String(el.dataset.count || '0');
      const target = parseFloat(raw);
      const decimals = raw.indexOf('.') > -1 ? (raw.split('.')[1] || '').length : 0;

      const animate = () => {
        if (!hasGSAP || prefersReduced) { el.textContent = raw; return; }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.9, ease: 'power2.out',
          onUpdate: () => { el.textContent = obj.v.toFixed(decimals); }
        });
      };

      if (window.ScrollTrigger) {
        ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: animate });
      } else {
        animate();
      }
    });
  }

  /* ---------------------------------------------------------
     6. NAVBAR / SCROLL FX
  --------------------------------------------------------- */
  function initScrollFx() {
    const nav = $('#mainNav');
    const progress = $('#scrollProgress');
    const backTop = $('#backTop');
    const links = $$('.navbar .nav-link[href]');

    /* split nav links: same-page anchors vs. other pages */
    const pageLinks = links.filter(l => l.getAttribute('href').indexOf('#') !== 0);
    const hashLinks = links.filter(l => l.getAttribute('href').indexOf('#') === 0);
    const sections = hashLinks
      .map(l => document.querySelector(l.getAttribute('href')))
      .filter(Boolean);

    /* highlight the current page in the navbar */
    const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    pageLinks.forEach(l => {
      const href = (l.getAttribute('href').split('?')[0] || 'index.html').toLowerCase();
      l.classList.toggle('active', href === currentFile);
    });

    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;

      if (nav) nav.classList.toggle('scrolled', y > 40);
      if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      if (backTop) backTop.classList.toggle('show', y > 600);

      let current = '';
      sections.forEach(sec => { if (y >= sec.offsetTop - 140) current = '#' + sec.id; });
      hashLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === current));

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (backTop) {
      backTop.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
    }

    /* smooth anchor scroll with nav offset */
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();

        const off = window.innerWidth < 992 ? 70 : 84;
        const top = target.getBoundingClientRect().top + window.scrollY - off;

        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });

        const offcanvasEl = $('#navMenu');
        if (offcanvasEl && offcanvasEl.classList.contains('show')) {
          const oc = bootstrap.Offcanvas.getInstance(offcanvasEl);
          if (oc) oc.hide();
        }
      });
    });
  }

  /* ---------------------------------------------------------
     7. CUSTOM CURSOR
  --------------------------------------------------------- */
  function initCursor() {
    const dot = $('#cursorDot'), ring = $('#cursorRing');
    if (!dot || !ring || !hasGSAP || prefersReduced) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const xD = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' });
    const yD = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
    const xR = gsap.quickTo(ring, 'x', { duration: .42, ease: 'power3' });
    const yR = gsap.quickTo(ring, 'y', { duration: .42, ease: 'power3' });

    window.addEventListener('mousemove', e => {
      xD(e.clientX); yD(e.clientY); xR(e.clientX); yR(e.clientY);
    });

    const hoverables = 'a, button, .service-card, .team-card, .price-card, input, select, textarea, .testimonial-card';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverables)) ring.classList.add('is-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverables)) ring.classList.remove('is-hover');
    });
  }

  /* ---------------------------------------------------------
     8. TESTIMONIAL SLIDER
  --------------------------------------------------------- */
  function initSlider() {
    const track = $('#testimonialTrack');
    if (!track) return;

    const slides = $$('.testimonial-slide', track);
    const dotsWrap = $('#sliderDots');
    const prev = $('#sliderPrev'), next = $('#sliderNext');
    let index = 0, timer = null;

    const perView = () => {
      const w = window.innerWidth;
      return w >= 1200 ? 3 : w >= 768 ? 2 : 1;
    };
    const maxIndex = () => Math.max(0, slides.length - perView());

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      b.addEventListener('click', () => { index = i; update(); restart(); });
      dotsWrap.appendChild(b);
    });

    const dots = $$('button', dotsWrap);

    function update() {
      index = Math.min(Math.max(index, 0), maxIndex());
      const offset = -(index * (100 / perView()));
      if (hasGSAP && !prefersReduced) {
        gsap.to(track, { xPercent: offset, duration: .8, ease: 'power3.out' });
      } else {
        track.style.transform = 'translateX(' + offset + '%)';
      }
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(() => {
        index = index >= maxIndex() ? 0 : index + 1;
        update();
      }, 5000);
    }

    prev.addEventListener('click', () => { index--; if (index < 0) index = maxIndex(); update(); restart(); });
    next.addEventListener('click', () => { index++; if (index > maxIndex()) index = 0; update(); restart(); });

    /* touch / swipe */
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 45) return;
      if (diff > 0) { index = index >= maxIndex() ? 0 : index + 1; }
      else { index = index <= 0 ? maxIndex() : index - 1; }
      update(); restart();
    }, { passive: true });

    window.addEventListener('resize', update);
    update(); restart();
  }

  /* ---------------------------------------------------------
     9. TILT EFFECT (cards)
  --------------------------------------------------------- */
  function initTilt() {
    if (!hasGSAP || prefersReduced || window.matchMedia('(hover: none)').matches) return;

    $$('.service-card, .team-card, .price-card').forEach(card => {
      const xTo = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3' });
      const yTo = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3' });
      gsap.set(card, { transformPerspective: 900 });

      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width - .5) * 7);
        yTo(-((e.clientY - r.top) / r.height - .5) * 7);
      });
      card.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------------------------------------------------------
     10. PARALLAX ELEMENTS
  --------------------------------------------------------- */
  function initParallax() {
    if (!hasGSAP || !window.ScrollTrigger || prefersReduced) return;

    const pairs = [
      ['.about__img--sub', -40],
      ['.about__dots', 60],
      ['.why__badge', -50],
      ['.hero__blob--1', 90],
      ['.hero__blob--2', -70],
      ['.appointment__shell', 0]
    ];

    pairs.forEach(([sel, distance]) => {
      const el = $(sel);
      if (!el || distance === 0) return;
      gsap.to(el, {
        y: distance, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });

    /* section headers slight rise */
    $$('.section-title').forEach(t => {
      gsap.from(t, {
        backgroundPositionX: '100%',
        scrollTrigger: { trigger: t, start: 'top 90%', end: 'top 50%', scrub: 1 }
      });
    });
  }

  /* ---------------------------------------------------------
     11. FORMS
  --------------------------------------------------------- */
  function initForms() {
    const form = $('#apptForm');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        let valid = true;

        $$('[required]', form).forEach(f => {
          const ok = f.value.trim() !== '' &&
            (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
          f.classList.toggle('is-invalid', !ok);
          if (!ok) valid = false;
        });

        if (!valid) {
          if (hasGSAP && !prefersReduced) gsap.fromTo(form, { x: -9 }, { x: 0, duration: .5, ease: 'elastic.out(1,.35)' });
          return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const success = $('#formSuccess');
        btn.disabled = true;
        btn.innerHTML = 'Sending…';

        setTimeout(() => {
          success.classList.remove('d-none');
          form.reset();
          btn.disabled = false;
          btn.innerHTML = 'Confirm Booking <i class="bi bi-arrow-right ms-2"></i>';
          if (hasGSAP && !prefersReduced) {
            gsap.fromTo(success, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out' });
          }
        }, 900);
      });

      $$('#apptForm .form-control, #apptForm .form-select').forEach(f =>
        f.addEventListener('input', () => f.classList.remove('is-invalid')));
    }

    const news = $('#newsForm');
    if (news) {
      news.addEventListener('submit', e => {
        e.preventDefault();
        const input = news.querySelector('input');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) return;
        const btn = news.querySelector('button');
        btn.innerHTML = '<i class="bi bi-check-lg"></i>';
        input.value = '';
        setTimeout(() => { btn.innerHTML = '<i class="bi bi-send-fill"></i>'; }, 2600);
      });
    }

    /* min date = today */
    const dateInput = $('#date');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
  }

  /* ---------------------------------------------------------
     12. MAGNETIC BUTTONS
  --------------------------------------------------------- */
  function initMagnetic() {
    if (!hasGSAP || prefersReduced || window.matchMedia('(hover: none)').matches) return;

    $$('.btn-brand, .slider-btn, .back-top').forEach(btn => {
      const xTo = gsap.quickTo(btn, 'x', { duration: .4, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: .4, ease: 'power3' });

      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .32);
        yTo((e.clientY - r.top - r.height / 2) * .42);
      });
      btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------------------------------------------------------
     13. AUTH PAGES
  --------------------------------------------------------- */
  const USER_KEY = 'luminaUser';
  const CREDS_KEY = 'luminaCreds';

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; }
  }

  function getCreds() {
    try { return JSON.parse(localStorage.getItem(CREDS_KEY)); } catch (e) { return null; }
  }

  /* tiny non-reversible-ish hash — demo only, there is no backend */
  function hashStr(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return String(h);
  }

  function markBad(f, msg) {
    f.classList.add('is-invalid');
    const field = f.closest('.field');
    if (field) {
      field.classList.add('is-bad');
      const fb = field.querySelector('.invalid-feedback');
      if (fb && msg) fb.textContent = msg;
    }
  }

  function initNavAuthState() {
    const cta = $('.nav-cta');
    if (!cta) return;
    const user = getUser();
    if (user) {
      cta.setAttribute('href', 'dashboard.html');
      cta.innerHTML = '<i class="bi bi-grid-1x2-fill"></i> Dashboard';
    }
  }

  function initAuth() {
    /* signup -> signin hand-off: welcome banner + pre-filled email */
    const alertBox = $('#authAlert');
    if (alertBox && /(\?|&)welcome=1/.test(location.search)) {
      alertBox.classList.remove('d-none');
      if (hasGSAP && !prefersReduced) gsap.fromTo(alertBox, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out' });
    }
    const creds = getCreds();
    const siEmail = $('#siEmail');
    if (siEmail && creds && creds.email && !siEmail.value) {
      siEmail.value = creds.email;
      if (siEmail.closest('.field')) siEmail.closest('.field').classList.remove('is-bad');
    }

    /* show / hide password */
    $$('[data-toggle-pass]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.togglePass);
        if (!input) return;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = '<i class="bi bi-eye' + (show ? '-off' : '') + '"></i>';
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    });

    const checkField = f => {
      const field = f.closest('.field');
      let ok = true;

      if (f.type === 'checkbox') {
        ok = f.checked;
      } else if (f.type === 'email') {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      } else if (f.minLength > 0) {
        ok = f.value.length >= f.minLength;
      } else {
        ok = f.value.trim() !== '';
      }

      if (ok && f.dataset.match) {
        const other = document.getElementById(f.dataset.match);
        if (other && f.value !== other.value) ok = false;
      }

      f.classList.toggle('is-invalid', !ok);
      if (field) {
        field.classList.toggle('is-bad', !ok);
        const fb = field.querySelector('.invalid-feedback');
        if (fb && fb.dataset.def) fb.textContent = fb.dataset.def;
      }
      return ok;
    };

    /* remember each field's default error text (sign-in overwrites some) */
    $$('form[data-auth] .invalid-feedback').forEach(fb => { fb.dataset.def = fb.textContent; });

    $$('form[data-auth]').forEach(form => {
      const fields = $$('[required]', form);

      form.addEventListener('submit', e => {
        e.preventDefault();
        let valid = true;
        fields.forEach(f => { if (!checkField(f)) valid = false; });

        if (!valid) {
          if (hasGSAP && !prefersReduced) gsap.fromTo(form, { x: -9 }, { x: 0, duration: .5, ease: 'elastic.out(1,.35)' });
          const firstBad = form.querySelector('.is-invalid');
          if (firstBad) firstBad.focus({ preventScroll: false });
          return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        const mode = form.dataset.auth;
        btn.disabled = true;
        btn.innerHTML = mode === 'forgot' ? 'Sending… <i class="bi bi-arrow-repeat ms-1"></i>'
                                          : 'Please wait… <i class="bi bi-arrow-repeat ms-1"></i>';

        if (mode === 'forgot') {
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = original;
            form.reset();
            const alert = $('#authSuccess');
            if (alert) {
              alert.classList.remove('d-none');
              if (hasGSAP && !prefersReduced) gsap.fromTo(alert, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out' });
              alert.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
            }
          }, 900);
          return;
        }

        setTimeout(() => {
          const nameInput = form.querySelector('input[name="name"]');
          const emailInput = form.querySelector('input[type="email"]');

          /* SIGN UP — save the account, then hand the user over to the sign-in page */
          if (mode === 'signup') {
            const passInput = form.querySelector('input[type="password"]');
            try {
              localStorage.setItem(CREDS_KEY, JSON.stringify({
                name: nameInput ? nameInput.value.trim() : '',
                email: emailInput ? emailInput.value.trim() : '',
                passHash: hashStr(passInput ? passInput.value : '')
              }));
            } catch (err) { /* storage disabled */ }

            btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Account created';
            setTimeout(() => { window.location.href = 'signin.html?welcome=1'; }, 750);
            return;
          }

          /* SIGN IN — check the credentials created during signup */
          if (mode === 'signin') {
            const stored = getCreds();
            const passInput = form.querySelector('input[type="password"]');
            let credsOk = true;

            if (stored && stored.email) {
              if (emailInput.value.trim().toLowerCase() !== stored.email.toLowerCase()) {
                markBad(emailInput, 'No account found for this email — please sign up first.');
                credsOk = false;
              } else if (hashStr(passInput.value) !== stored.passHash) {
                markBad(passInput, 'Incorrect password — please try again.');
                credsOk = false;
              }
            }

            if (!credsOk) {
              btn.disabled = false;
              btn.innerHTML = original;
              if (hasGSAP && !prefersReduced) gsap.fromTo(form, { x: -9 }, { x: 0, duration: .5, ease: 'elastic.out(1,.35)' });
              const firstBad = form.querySelector('.is-invalid');
              if (firstBad) firstBad.focus();
              return;
            }

            try {
              localStorage.setItem(USER_KEY, JSON.stringify({
                name: stored && stored.name ? stored.name : '',
                email: emailInput.value.trim(),
                since: Date.now()
              }));
            } catch (err) { /* storage disabled */ }

            btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Success';
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 550);
            return;
          }

          /* profile / password — stay on page, confirm inline */
          if (mode === 'profile') {
            const user = getUser() || {};
            try {
              localStorage.setItem(USER_KEY, JSON.stringify(Object.assign({}, user, {
                name: nameInput ? nameInput.value.trim() : user.name,
                email: emailInput ? emailInput.value.trim() : user.email
              })));
            } catch (err) { /* storage disabled */ }
          }
          if (mode === 'password') form.reset();

          btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Saved';
          setTimeout(() => { btn.disabled = false; btn.innerHTML = original; }, 1800);
        }, 900);
      });

      fields.forEach(f => {
        f.addEventListener('input', () => {
          if (!f.classList.contains('is-invalid')) return;
          checkField(f);
        });
        f.addEventListener('change', () => checkField(f));
      });
    });

    /* password strength meter */
    const pw = $('#suPass');
    const meter = $('#passStrength');
    const meterLabel = $('#passStrengthLabel');
    if (pw && meter && meterLabel) {
      const words = ['Password strength', 'Weak — add more characters', 'Fair — mix in numbers', 'Good password', 'Strong password'];
      pw.addEventListener('input', () => {
        const v = pw.value;
        let s = 0;
        if (v.length >= 8) s++;
        if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
        if (/\d/.test(v)) s++;
        if (/[^A-Za-z0-9]/.test(v)) s++;
        if (v.length >= 12 && s < 4) s++;
        meter.dataset.level = v ? s : 0;
        meterLabel.textContent = words[v ? s : 0];
      });
    }

    /* social buttons (demo only) */
    $$('[data-social]').forEach(b => {
      b.addEventListener('click', () => {
        const original = b.innerHTML;
        b.innerHTML = '<i class="bi bi-arrow-repeat"></i> Connecting…';
        setTimeout(() => { b.innerHTML = original; }, 1400);
      });
    });
  }

  /* ---------------------------------------------------------
     14. APP SHELL (patient dashboard)
  --------------------------------------------------------- */
  function initApp() {
    const sidebar = $('#sidebar');
    if (!sidebar) return;

    const overlay = $('#sidebarOverlay');
    const open = () => { sidebar.classList.add('open'); overlay.classList.add('show'); document.body.style.overflow = 'hidden'; };
    const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); document.body.style.overflow = ''; };

    const openBtn = $('#sidebarOpen');
    const closeBtn = $('#sidebarClose');
    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 992) close(); });

    /* highlight the current page in the sidebar */
    const currentFile = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
    $$('.side-link[href]').forEach(l => {
      const href = (l.getAttribute('href').split('?')[0] || '').toLowerCase();
      l.classList.toggle('active', href === currentFile);
    });

    /* signed-in user */
    const user = getUser();
    const name = (user && user.name) || 'John Carter';
    const email = (user && user.email) || 'john.carter@email.com';
    $$('[data-user-name]').forEach(el => { el.textContent = name; });
    $$('[data-user-email]').forEach(el => { el.textContent = email; });
    $$('[data-user-first]').forEach(el => { el.textContent = name.split(' ')[0]; });

    /* sign out */
    const signOut = () => {
      try { localStorage.removeItem(USER_KEY); } catch (e) { /* ignore */ }
      window.location.href = 'signin.html';
    };
    ['#signOutBtn', '#userSignOut', '#signOutAll'].forEach(sel => {
      const el = $(sel);
      if (el) el.addEventListener('click', signOut);
    });

    /* list filters (appointments / invoices) */
    $$('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.filter;
        const group = btn.closest('.pill-tabs');
        if (group) $$('[data-filter]', group).forEach(b => b.classList.toggle('active', b === btn));
        const scope = btn.closest('.card-app') || document;
        $$('[data-status-row]', scope).forEach(row => {
          row.classList.toggle('d-none', !(val === 'all' || row.dataset.statusRow === val));
        });
      });
    });

    /* today's date chip */
    $$('[data-today]').forEach(el => {
      el.textContent = new Date().toLocaleDateString('en-US',
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    });

    /* whole switch-row acts as the toggle */
    $$('.switch-row').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', e => {
        if (e.target.closest('a, button, label')) return;
        const input = row.querySelector('input[type="checkbox"]');
        if (!input) return;
        if (e.target !== input) input.checked = !input.checked;
      });
    });
  }

  /* ---------------------------------------------------------
     14. ERROR / 404 PAGE
  --------------------------------------------------------- */
  function initError() {
    const page = $('.err-page');
    if (!page) return;

    /* back to previous page — fall back to home when there is no history */
    const backBtn = $('#errBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (history.length > 1) {
          history.back();
        } else {
          window.location.href = 'index.html';
        }
      });
    }

    if (!hasGSAP || prefersReduced) return;

    const startTl = () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      const add = (sel, vars, pos) => {
        const els = $$(sel);
        if (els.length) tl.from(els, vars, pos);
      };

      add('.err-page__badge', { y: -18, opacity: 0, duration: .6 }, 0);
      add('.err-page__digit', { y: 64, opacity: 0, duration: .9, stagger: .12, ease: 'back.out(1.6)' }, .1);
      add('.err-page__tooth', { scale: 0, rotate: -140, opacity: 0, duration: .85, ease: 'back.out(2)' }, .25);
      add('.err-page__title', { y: 30, opacity: 0, duration: .7 }, .5);
      add('.err-page__lead', { y: 26, opacity: 0, duration: .7 }, '-=.5');
      add('.err-page__actions', { y: 24, opacity: 0, duration: .65 }, '-=.45');
      add('.err-page__links', { y: 30, opacity: 0, duration: .7 }, '-=.4');
    };

    /* wait for the preloader to clear before playing */
    if (document.body.classList.contains('is-loading')) {
      const obs = new MutationObserver(() => {
        if (!document.body.classList.contains('is-loading')) {
          obs.disconnect();
          startTl();
        }
      });
      obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } else {
      startTl();
    }

    /* digits follow the cursor slightly */
    if (window.matchMedia('(hover: hover)').matches) {
      const digits = $$('.err-page__digit');
      const toX = digits.map(d => gsap.quickTo(d, 'x', { duration: .7, ease: 'power3' }));
      const toY = digits.map(d => gsap.quickTo(d, 'y', { duration: .7, ease: 'power3' }));
      page.addEventListener('mousemove', e => {
        const nx = (e.clientX / window.innerWidth - .5);
        const ny = (e.clientY / window.innerHeight - .5);
        digits.forEach((d, i) => { toX[i](nx * (i === 0 ? 22 : -22)); toY[i](ny * 16); });
      });
      page.addEventListener('mouseleave', () => {
        digits.forEach((d, i) => { toX[i](0); toY[i](0); });
      });
    }
  }

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  function boot() {
    initScrollFx();
    initReveals();
    startCounters();
    initSlider();
    initCursor();
    initTilt();
    initParallax();
    initForms();
    initMagnetic();
    initNavAuthState();
    initAuth();
    initApp();
    initError();
    runPreloader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('load', () => {
    if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
