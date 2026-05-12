/* ═══════════════════════════════════════════════════════════
   MAIN JS — 5Ws of Fashion
   Custom cursor, nav scroll, scroll reveal, mobile menu,
   events horizontal scroll
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Touch Device Detection ────────────────────────────
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  // ── Custom Cursor ─────────────────────────────────────
  if (!isTouchDevice) {
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');

    if (cursor && ring) {
      let mx = 0, my = 0, rx = 0, ry = 0;

      document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
      }, { passive: true });

      function animateCursor() {
        cursor.style.transform = `translate(${mx}px, ${my}px)`;
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(animateCursor);
      }

      animateCursor();

      // Hover effect on interactive elements
      document.querySelectorAll('a, button').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursor.style.width = '20px';
          cursor.style.height = '20px';
          ring.style.width = '54px';
          ring.style.height = '54px';
          ring.style.opacity = '0.3';
        });

        el.addEventListener('mouseleave', () => {
          cursor.style.width = '10px';
          cursor.style.height = '10px';
          ring.style.width = '36px';
          ring.style.height = '36px';
          ring.style.opacity = '0.6';
        });
      });
    }
  }

  // ── Nav Scroll Effect ─────────────────────────────────
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ── Mobile Menu Toggle ────────────────────────────────
  const hamburger = document.getElementById('navHamburger');
  const mobileOverlay = document.getElementById('mobileMenuOverlay');

  if (hamburger && mobileOverlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileOverlay.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    mobileOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileOverlay.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileOverlay.classList.contains('open')) {
        mobileOverlay.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Scroll Reveal (IntersectionObserver) ──────────────
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((r) => observer.observe(r));

  // ── Horizontal Scroll for Events Grid ─────────────────
  const eventsContainer = document.querySelector('.events-grid');

  if (eventsContainer) {
    eventsContainer.addEventListener(
      'wheel',
      (e) => {
        // Only intercept if the container has horizontal overflow
        if (eventsContainer.scrollWidth > eventsContainer.clientWidth) {
          e.preventDefault();
          eventsContainer.scrollLeft += e.deltaY * 1.5;
        }
      },
      { passive: false }
    );
  }

  // ── Contact Form Modal ──────────────────────────────
  const contactModal = document.getElementById('contactModal');
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactFormSuccess');
  const openBtn = document.getElementById('openContactForm');
  const openBtns = document.querySelectorAll('.open-contact-form');
  const closeBtn = document.getElementById('contactModalClose');
  const backdrop = document.getElementById('contactModalBackdrop');

  function openModal() {
    if (!contactModal) return;
    // Close mobile menu if open
    if (mobileOverlay && mobileOverlay.classList.contains('open')) {
      mobileOverlay.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
    contactModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus first input for accessibility
    setTimeout(() => {
      const firstInput = contactForm?.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }, 400);
  }

  function closeModal() {
    if (!contactModal) return;
    contactModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  openBtns.forEach((btn) => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal?.classList.contains('open')) {
      closeModal();
    }
  });

  // Formspree async submission
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('contactSubmitBtn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          contactForm.style.display = 'none';
          contactSuccess.classList.add('show');
          contactForm.reset();
        } else {
          throw new Error('Form submission failed');
        }
      } catch (err) {
        submitBtn.textContent = 'Error — Try Again';
        submitBtn.disabled = false;
        setTimeout(() => { submitBtn.textContent = originalText; }, 3000);
      }
    });
  }
});
