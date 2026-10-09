/* ============================================================
   Haseeb Ur Rehman Malik — Portfolio
   script.js
   ------------------------------------------------------------
   Vanilla JavaScript only. No frameworks, no build step.
   Open index.html directly in a browser and it works.
   ============================================================ */

'use strict';

/* ============================================================
   ★★★  CONFIG — EDIT EVERYTHING HERE  ★★★
   ============================================================
   This is the only section you need to touch for most changes.
   ============================================================ */
const CONFIG = {

  /* ---------- Personal information ---------- */
  name:     'Haseeb Ur Rehman Malik',
  email:    'hasseburrahmanmalik@gmail.com',
  linkedin: 'https://linkedin.com/in/haseeb-ur-rehman-malik-830226410',
  location: 'Hyderabad, Sindh, Pakistan',

  /* ---------- CV ----------
     Put your PDF at:  portfolio/resume/Haseeb-Ur-Rehman-Malik-CV.pdf
     Then leave this path as-is.                                        */
  cvPath: 'resume/Haseeb-Ur-Rehman-Malik-CV.pdf',

  /* ---------- Theme ----------
     These override the CSS variables in style.css at runtime.
     Set a value to null to keep the CSS default.                       */
  theme: {
    accent:  null,   // e.g. '#38bdf8'  — electric cyan
    accent2: null,   // e.g. '#818cf8'  — indigo
    accent3: null    // e.g. '#c084fc'  — purple
  },

  /* ---------- Project links ----------
     Replace '#' with the real URL when the project is live.
     Leave as '#' and the button points to '#' (placeholder).
     Set github to '' (empty string) to HIDE the GitHub button.         */
  projects: {
    hiLubricant: {
      live:   '#',   // ADD YOUR LIVE PROJECT URL HERE
      github: ''     // ADD YOUR GITHUB REPO URL HERE (empty = hidden)
    },
    ecommerce: {
      live:   '#',   // ADD YOUR LIVE PROJECT URL HERE
      github: ''     // ADD YOUR GITHUB REPO URL HERE (empty = hidden)
    },
    responsiveCollection: {
      live:   '#',   // ADD YOUR LIVE PROJECT URL HERE
      github: ''     // ADD YOUR GITHUB REPO URL HERE (empty = hidden)
    }
  },

  /* ---------- Terminal typing animation ----------
     Set to false to show the lines instantly (no typing).             */
  terminalTyping: true
};

/* ============================================================
   END OF CONFIG
   ============================================================ */


/* ============================================================
   1. SMALL HELPERS
   ============================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ============================================================
   2. APPLY CONFIG TO THE PAGE
   ============================================================ */
function applyConfig() {
  // Personal links
  $$('[data-cfg="email"]').forEach(el => {
    el.href = `mailto:${CONFIG.email}`;
  });

  $$('[data-cfg="linkedin"]').forEach(el => {
    el.href = CONFIG.linkedin;
  });

  $$('[data-cfg="cv"]').forEach(el => {
    el.href = CONFIG.cvPath;
  });

  // Theme overrides
  const root = document.documentElement;
  if (CONFIG.theme.accent)  root.style.setProperty('--accent',   CONFIG.theme.accent);
  if (CONFIG.theme.accent2) root.style.setProperty('--accent-2', CONFIG.theme.accent2);
  if (CONFIG.theme.accent3) root.style.setProperty('--accent-3', CONFIG.theme.accent3);

  // Project buttons
  $$('[data-project]').forEach(el => {
    const key = el.dataset.project;
    const cfg = CONFIG.projects[key];
    if (!cfg) return;

    el.href = cfg.live || '#';
    if (cfg.live && cfg.live !== '#') {
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    }
  });

  // GitHub buttons — hidden unless a real URL exists
  $$('[data-github]').forEach(el => {
    const key = el.dataset.github;
    const cfg = CONFIG.projects[key];
    const url = cfg && cfg.github ? cfg.github.trim() : '';

    if (url) {
      el.href = url;
      el.hidden = false;
    } else {
      el.hidden = true;   // no fake URLs, just hide it
    }
  });
}


/* ============================================================
   3. HEADER — scroll state + mobile menu
   ============================================================ */
function initHeader() {
  const header = $('#siteHeader');
  const toggle = $('#navToggle');
  const menu   = $('#navMenu');
  if (!header || !toggle || !menu) return;

  /* --- Scrolled state (blur / translucent) --- */
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Mobile menu open / close --- */
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => {
    setMenu(!menu.classList.contains('is-open'));
  });

  // Close when a nav link is clicked
  $$('.nav__link, .nav__cv', menu).forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (menu.contains(e.target) || toggle.contains(e.target)) return;
    setMenu(false);
  });

  // Reset the menu when resizing back to desktop
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 860) setMenu(false);
    }, 150);
  });
}


/* ============================================================
   4. ACTIVE NAV LINK ON SCROLL
   ============================================================ */
function initActiveNav() {
  const sections = $$('main section[id]');
  const links    = $$('.nav__link');
  if (!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, {
    rootMargin: '-45% 0px -50% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
}


/* ============================================================
   5. SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  // Respect reduced motion — show everything immediately
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);   // reveal once
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  items.forEach(el => observer.observe(el));
}


/* ============================================================
   6. PROJECT FILTER
   ============================================================ */
function initProjectFilter() {
  const filterBar = $('#projectFilters');
  const grid      = $('#projectsGrid');
  if (!filterBar || !grid) return;

  const buttons = $$('.filter', filterBar);
  const cards   = $$('.project-card', grid);

  const applyFilter = (category) => {
    cards.forEach(card => {
      const cats = (card.dataset.categories || '').split(/\s+/);
      const show = category === 'all' || cats.includes(category);

      card.classList.remove('is-filtering');

      if (show) {
        card.classList.remove('is-hidden');
        // Force reflow so the animation restarts each time
        void card.offsetWidth;
        if (!prefersReducedMotion()) card.classList.add('is-filtering');
      } else {
        card.classList.add('is-hidden');
      }
    });
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');

      applyFilter(btn.dataset.filter);
    });
  });
}


/* ============================================================
   7. HIDE BROKEN PROJECT IMAGES
   ============================================================ */
function initImageFallbacks() {
  $$('.project-card__media img').forEach(img => {
    const hide = () => { img.style.display = 'none'; };
    img.addEventListener('error', hide);
    // Already failed before JS ran?
    if (img.complete && img.naturalWidth === 0) hide();
  });
}


/* ============================================================
   8. TERMINAL TYPING ANIMATION
   ============================================================ */
function initTerminal() {
  const body = $('#terminalBody');
  if (!body) return;

  /* Each line is an array of [cssClass, text] segments.
     Edit freely — this is purely decorative. */
  const lines = [
    [['t-mut',  '$ '], ['t-cmd', 'whoami']],
    [['t-str',  'haseeb — web developer']],
    [['t-mut',  '$ '], ['t-cmd', 'cat skills.json']],
    [['t-key',  '{']],
    [['t-key',  '  "frontend": '], ['t-str', '["HTML","CSS"]'], ['t-mut', ',']],
    [['t-key',  '  "learning": '], ['t-str', '["JavaScript","Python"]'], ['t-mut', ',']],
    [['t-key',  '  "focus":    '], ['t-str', '"responsive + AI-assisted"']],
    [['t-key',  '}']],
    [['t-mut',  '$ '], ['t-cmd', 'npm run future']],
    [['t-fn',   '✔'], ['t-str', ' ready for an internship']]
  ];

  /* Build one line element from segments */
  const buildLine = (segments) => {
    const line = document.createElement('span');
    line.className = 't-line';
    segments.forEach(([cls, text]) => {
      const span = document.createElement('span');
      span.className = cls;
      span.textContent = text;
      line.appendChild(span);
    });
    return line;
  };

  /* No animation: render everything at once */
  if (!CONFIG.terminalTyping || prefersReducedMotion()) {
    lines.forEach(segments => body.appendChild(buildLine(segments)));
    return;
  }

  /* Animated: type the first two lines, then drop the rest in */
  const caret = document.createElement('span');
  caret.className = 't-caret';

  let lineIndex = 0;

  const typeNextLine = () => {
    if (lineIndex >= lines.length) {
      caret.remove();
      return;
    }

    const segments = lines[lineIndex];
    const line = document.createElement('span');
    line.className = 't-line';
    body.appendChild(line);

    // Flatten to a character queue: [{char, cls}, ...]
    const queue = [];
    segments.forEach(([cls, text]) => {
      for (const char of text) queue.push({ char, cls });
    });

    let i = 0;
    let currentSpan = null;
    let currentCls = null;

    const tick = () => {
      if (i >= queue.length) {
        lineIndex++;
        // Short pause between lines
        setTimeout(typeNextLine, lineIndex === 2 ? 260 : 130);
        return;
      }

      const { char, cls } = queue[i];

      if (cls !== currentCls) {
        currentSpan = document.createElement('span');
        currentSpan.className = cls;
        line.appendChild(currentSpan);
        currentCls = cls;
      }

      currentSpan.textContent += char;
      i++;

      setTimeout(tick, 22 + Math.random() * 28);
    };

    tick();
  };

  typeNextLine();

  // Hide the caret when done
  setTimeout(() => {
    body.appendChild(caret);
    setTimeout(() => caret.remove(), 600);
  }, 100);
}


/* ============================================================
   9. BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  });
}


/* ============================================================
   10. CONTACT FORM — validation + mailto fallback
   ============================================================ */
function initContactForm() {
  const form   = $('#contactForm');
  const status = $('#formStatus');
  if (!form || !status) return;

  const fields = {
    name:    { el: $('#name'),    error: $('#nameError'),    label: 'Name'    },
    email:   { el: $('#email'),   error: $('#emailError'),   label: 'Email'   },
    message: { el: $('#message'), error: $('#messageError'), label: 'Message' }
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---- Helpers ---- */
  const showError = (field, message) => {
    field.el.closest('.form-field').classList.add('has-error');
    field.el.setAttribute('aria-invalid', 'true');
    field.error.textContent = message;
    field.error.hidden = false;
  };

  const clearError = (field) => {
    field.el.closest('.form-field').classList.remove('has-error');
    field.el.removeAttribute('aria-invalid');
    field.error.textContent = '';
    field.error.hidden = true;
  };

  const clearStatus = () => {
    status.textContent = '';
    status.className = 'form-status';
  };

  /* ---- Validate one field. Returns true when valid. ---- */
  const validateField = (key) => {
    const field = fields[key];
    const value = field.el.value.trim();

    if (!value) {
      showError(field, `${field.label} is required.`);
      return false;
    }

    if (key === 'name' && value.length < 2) {
      showError(field, 'Please enter at least 2 characters.');
      return false;
    }

    if (key === 'email' && !EMAIL_RE.test(value)) {
      showError(field, 'Please enter a valid email address.');
      return false;
    }

    if (key === 'message' && value.length < 10) {
      showError(field, 'Please write at least 10 characters.');
      return false;
    }

    clearError(field);
    return true;
  };

  /* ---- Live re-validation once a field has an error ---- */
  Object.keys(fields).forEach(key => {
    const field = fields[key];

    field.el.addEventListener('blur', () => {
      // Only validate on blur if the user typed something,
      // so the form isn't hostile on first load.
      if (field.el.value.trim() !== '') validateField(key);
    });

    field.el.addEventListener('input', () => {
      if (field.el.closest('.form-field').classList.contains('has-error')) {
        validateField(key);
      }
    });
  });

  /* ---- Submit ---- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearStatus();

    // Validate every field (don't short-circuit — show all errors)
    const results = Object.keys(fields).map(validateField);
    const allValid = results.every(Boolean);

    if (!allValid) {
      status.textContent = 'Please fix the highlighted fields and try again.';
      status.className = 'form-status is-error';

      // Focus the first invalid input
      const firstInvalid = Object.keys(fields).find(
        key => fields[key].el.closest('.form-field').classList.contains('has-error')
      );
      if (firstInvalid) fields[firstInvalid].el.focus();
      return;
    }

    /* ==========================================================
       ⚠  NO BACKEND IS CONNECTED.
       ==========================================================
       This form does NOT send email by itself. It builds a
       mailto: link so the visitor's own email client opens with
       the message pre-filled. That is honest and works offline.

       TO SEND EMAILS AUTOMATICALLY LATER, replace the mailto
       block below with a fetch() to your service, e.g.:

         const res = await fetch('https://formspree.io/f/YOUR_ID', {
           method:  'POST',
           headers: { 'Accept': 'application/json' },
           body:    new FormData(form)
         });
         if (res.ok) { ...success... }

       Or connect EmailJS, Netlify Forms, or your own backend.
       ========================================================== */

    const name    = fields.name.el.value.trim();
    const email   = fields.email.el.value.trim();
    const message = fields.message.el.value.trim();

    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const bodyText = encodeURIComponent(
      `Name: ${name}\n` +
      `Email: ${email}\n\n` +
      `${message}\n`
    );

    const mailto = `mailto:${CONFIG.email}?subject=${subject}&body=${bodyText}`;

    // Open the visitor's email client
    window.location.href = mailto;

    // Confirm to the user
    status.textContent =
      'Thanks! Your email app should now open with your message ready to send. ' +
      'You can also email me directly at ' + CONFIG.email + '.';
    status.className = 'form-status is-success';

    form.reset();

    // Clear any lingering error styling
    Object.keys(fields).forEach(clearError);
  });
}


/* ============================================================
   11. SMOOTH SCROLL FOR IN-PAGE ANCHORS
   ------------------------------------------------------------
   Native CSS scroll-behavior handles most of this. This adds
   a graceful fallback and updates the URL hash cleanly.
   ============================================================ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const headerH = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--header-h'), 10
      ) || 72;

      const top = target.getBoundingClientRect().top
                + window.scrollY
                - headerH
                - 16;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });

      // Keep the URL in sync without jumping
      history.pushState(null, '', href);

      // Move focus for keyboard / screen reader users
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.removeAttribute('tabindex');
    });
  });
}


/* ============================================================
   12. CURRENT YEAR IN FOOTER (optional safety net)
   ------------------------------------------------------------
   The footer is hard-coded to 2026 as requested. If you would
   rather have it auto-update each year, uncomment the block
   below and remove the hard-coded year in index.html.
   ============================================================ */
/*
function initFooterYear() {
  const copy = document.querySelector('.footer__copy');
  if (!copy) return;
  copy.innerHTML = `&copy; ${new Date().getFullYear()} ${CONFIG.name}. All rights reserved.`;
}
*/


/* ============================================================
   13. INIT — run everything once the DOM is ready
   ============================================================ */
function init() {
  applyConfig();
  initHeader();
  initActiveNav();
  initReveal();
  initProjectFilter();
  initImageFallbacks();
  initTerminal();
  initBackToTop();
  initContactForm();
  initSmoothScroll();
  // initFooterYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}