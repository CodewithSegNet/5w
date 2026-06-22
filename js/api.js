/* ══════════════════════════════════════════════════
   5Ws of Fashion — Frontend API Integration
   Loads blog posts, events carousel, and contact form
   ══════════════════════════════════════════════════ */

const API_URL = 'https://reminiscent-jaguar-550.convex.site';
    
document.addEventListener('DOMContentLoaded', () => {
  loadHeroSection();
  loadFeaturedBlog();
  loadPublicEvents();
  setupContactForm();
  setupBlogDetail();
});

/* ── HERO SECTION ──────────────────────────────── */
async function loadHeroSection() {
  const container = document.getElementById('heroDynamicContainer');
  if (!container) return;
  try {
    const res = await fetch(`${API_URL}/api/hero/public`);
    if (!res.ok) return;
    const data = await res.json();
    
    if ((!data.cards || data.cards.length === 0) && (!data.stats || data.stats.length === 0)) {
      return; // Fallback to static HTML if empty
    }

    let html = '';
    
    // Sort and map cards
    const sortedCards = (data.cards || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    sortedCards.forEach(c => {
      let tagHtml = '';
      if (c.title) {
        // Just alternating between tag styles randomly based on index, or by default use 'hero-photo-tag'
        // Let's use 'hero-photo-tag' for the first one, 'hero-photo-tag-two' for others as in the static version
        tagHtml = `<div class="${c.display_order === 1 ? 'hero-photo-tag' : 'hero-photo-tag-two'}">${esc(c.title)}</div>`;
      }
      
      html += `
      <div class="hero-photo">
        <img src="${resolveImageUrl(c.image_url)}" alt="${esc(c.title)}" loading="lazy">
        <div class="hero-photo-overlay">
          <p class="hero-photo-quote">${esc(c.quote)}</p>
        </div>
        ${tagHtml}
      </div>`;
    });

    // Add stats strip
    if (data.stats && data.stats.length > 0) {
      const sortedStats = data.stats.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      html += '<div class="hero-stats-strip">';
      sortedStats.forEach(s => {
        html += `
        <div class="stat-item">
          <div class="stat-num">${esc(s.stat_value)}</div>
          <div class="stat-label">${esc(s.stat_label)}</div>
        </div>`;
      });
      html += '</div>';
    }

    container.innerHTML = html;
  } catch (e) { /* silently fallback to static HTML */ }
}

/* ── BLOG (Homepage — 3 Latest) ────────────────── */
async function loadFeaturedBlog() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;
  try {
    const res = await fetch(`${API_URL}/api/blog/public?limit=3&page=1`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.posts || !data.posts.length) {
      grid.innerHTML = '<div class="blog-empty"><h3>Coming Soon</h3><p>New articles are on the way.</p></div>';
      return;
    }
    grid.innerHTML = data.posts.map(p => blogCardHTML(p)).join('');
  } catch(e) { /* silently fail */ }
}

function blogCardHTML(p) {
  const date = new Date(p.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  const imgHtml = p.cover_image
    ? `<img src="${resolveImageUrl(p.cover_image)}" alt="${esc(p.title)}" loading="lazy">`
    : `<div class="blog-card-image-fallback" data-initial="${esc(p.title.charAt(0))}"></div>`;
  const catHtml = p.category ? `<span class="blog-card-category">${esc(p.category)}</span>` : '';
  const tagsHtml = p.tags ? p.tags.split(',').slice(0,3).map(t => `<span>${esc(t.trim())}</span>`).join('') : '';

  return `<article class="blog-card" data-slug="${esc(p.slug)}" onclick="openBlogDetail('${esc(p.slug)}')">
    <div class="blog-card-image">
      ${imgHtml}
      ${catHtml}
    </div>
    <div class="blog-card-body">
      <p class="blog-card-meta">${date}</p>
      <h3 class="blog-card-title">${esc(p.title)}</h3>
      <p class="blog-card-excerpt">${esc(p.excerpt || '')}</p>
      ${tagsHtml ? `<div class="blog-card-tags">${tagsHtml}</div>` : ''}
      <div class="blog-card-footer">
        <span class="blog-card-author">${esc(p.author)}</span>
        <span class="blog-card-readmore">Read more</span>
      </div>
    </div>
  </article>`;
}

/* ── BLOG DETAIL MODAL ─────────────────────────── */
function setupBlogDetail() {
  const overlay = document.getElementById('blogDetailOverlay');
  const closeBtn = document.getElementById('blogDetailClose');
  if (!overlay) return;

  closeBtn?.addEventListener('click', closeBlogDetail);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeBlogDetail();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBlogDetail();
  });
}

async function openBlogDetail(slug) {
  const overlay = document.getElementById('blogDetailOverlay');
  const hero = document.getElementById('blogDetailHero');
  const body = document.getElementById('blogDetailBody');
  if (!overlay) return;

  try {
    const res = await fetch(`${API_URL}/api/blog/public/${slug}`);
    if (!res.ok) return;
    const p = await res.json();

    const date = new Date(p.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });

    hero.innerHTML = p.cover_image
      ? `<img src="${resolveImageUrl(p.cover_image)}" alt="${esc(p.title)}">`
      : '';
    hero.style.background = p.cover_image ? '' : 'linear-gradient(135deg, var(--navy) 0%, var(--pink) 100%)';

    const tagsHtml = p.tags
      ? `<div class="blog-detail-tags">${p.tags.split(',').map(t => `<span class="blog-card-tags"><span>${esc(t.trim())}</span></span>`).join('')}</div>`
      : '';

    const linkHtml = p.external_link
      ? `<a href="${esc(p.external_link)}" target="_blank" rel="noopener" class="blog-detail-link">Read More →</a>`
      : '';

    // Render content as HTML to preserve WordPress images and formatting
    const contentHtml = renderBlogContent(p.content);

    body.innerHTML = `
      <p class="blog-detail-meta">${date} · ${esc(p.author)} · ${esc(p.category || '')}</p>
      <h1>${esc(p.title)}</h1>
      <div class="blog-content">${contentHtml}</div>
      ${tagsHtml}
      ${linkHtml}
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch(e) { /* fail silently */ }
}

function closeBlogDetail() {
  const overlay = document.getElementById('blogDetailOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ── EVENTS CAROUSEL ───────────────────────────── */
async function loadPublicEvents() {
  const carousel = document.getElementById('eventsCarousel');
  if (!carousel) return;
  try {
    const res = await fetch(`${API_URL}/api/events/public?limit=10`);
    if (!res.ok) return;
    const events = await res.json();
    if (!events.length) return;

    carousel.innerHTML = events.map(ev => {
      const badgeHtml = ev.badge ? `<div class="event-badge">${esc(ev.badge)}</div>` : '';
      const imgStyle = ev.image_url
        ? `background-image:url('${resolveImageUrl(ev.image_url)}');background-size:cover;background-position:center;`
        : 'background:linear-gradient(135deg, #210747 0%, #811654 70%, #c43b8e 100%);';
      const linkHtml = ev.external_link
        ? `<a href="${esc(ev.external_link)}" class="event-link" target="_blank" rel="noopener">${esc(ev.link_text||'View details')}</a>`
        : '';

      return `<div class="event-card">
        <div class="event-card-img" style="${imgStyle}">
          ${badgeHtml}
          ${!ev.image_url ? '<p class="event-featured-watermark">5 Ws</p>' : ''}
        </div>
        <div class="event-card-body">
          <p class="event-date">${esc(ev.event_date||'')}${ev.author?' · '+esc(ev.author):''}</p>
          <h3 class="event-title">${esc(ev.title)}</h3>
          <p class="event-desc">${esc(ev.description)}</p>
          ${linkHtml}
        </div>
      </div>`;
    }).join('');

    initCarousel();
  } catch(e) { /* silently fail — keep empty */ }
}

function initCarousel() {
  const carousel = document.getElementById('eventsCarousel');
  const prevBtn = document.getElementById('eventPrev');
  const nextBtn = document.getElementById('eventNext');
  const dotsWrap = document.getElementById('carouselDots');
  if (!carousel) return;

  const cards = carousel.querySelectorAll('.event-card');
  if (!cards.length) return;

  // Create dots
  const totalDots = cards.length;
  if (dotsWrap) {
    dotsWrap.innerHTML = Array.from({length: totalDots}, (_, i) =>
      `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></button>`
    ).join('');

    dotsWrap.addEventListener('click', (e) => {
      const dot = e.target.closest('.carousel-dot');
      if (!dot) return;
      const idx = parseInt(dot.dataset.index);
      cards[idx]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
  }

  // Arrow navigation
  const scrollAmount = () => {
    const card = cards[0];
    return card ? card.offsetWidth + 24 : 300;
  };

  prevBtn?.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });

  nextBtn?.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });

  // Update dots on scroll
  carousel.addEventListener('scroll', () => {
    const scrollLeft = carousel.scrollLeft;
    const cardWidth = scrollAmount();
    const activeIdx = Math.round(scrollLeft / cardWidth);
    dotsWrap?.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === activeIdx);
    });
  });

  // Auto-play (pause on hover)
  let autoplay = setInterval(() => {
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    if (carousel.scrollLeft >= maxScroll - 10) {
      carousel.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    }
  }, 5000);

  carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
  carousel.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (carousel.scrollLeft >= maxScroll - 10) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
      }
    }, 5000);
  });
}

/* ── CONTACT FORM ──────────────────────────────── */
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Prevent Formspree default action — we handle submission via JS
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('#contactSubmitBtn') || form.querySelector('button[type="submit"]');
    const success = document.getElementById('contactFormSuccess');
    const origText = btn ? btn.textContent : 'Send';
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

    const data = {
      name: form.querySelector('#contactName').value.trim(),
      email: form.querySelector('#contactEmail').value.trim(),
      subject: form.querySelector('#contactSubject').value,
      message: form.querySelector('#contactMessage').value.trim(),
    };

    // Basic validation
    if (!data.name || !data.email || !data.subject || !data.message) {
      if (btn) { btn.textContent = origText; btn.disabled = false; }
      return;
    }

    let submitted = false;

    // Primary: try the backend API (connects to dashboard)
    try {
      const res = await fetch(`${API_URL}/api/contacts/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) submitted = true;
    } catch (_) { /* backend unreachable — fall through */ }

    // Fallback: Formspree via AJAX (no page redirect)
    if (!submitted) {
      try {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('subject', data.subject);
        formData.append('message', data.message);
        formData.append('_subject', 'New enquiry from 5Ws of Fashion website');

        const res = await fetch('https://formspree.io/f/xpwrrwqo', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) submitted = true;
      } catch (_) { /* Formspree also failed */ }
    }

    if (submitted) {
      form.style.display = 'none';
      if (success) success.classList.add('show');
      form.reset();
    } else {
      if (btn) {
        btn.textContent = 'Error — Try Again';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = origText; }, 3000);
      }
    }
  });
}

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* Resolve image URLs: prefix relative paths with API_URL */
function resolveImageUrl(url) {
  if (!url) return '';
  // Already absolute URL — leave as-is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  // Relative path from backend (e.g. /uploads/...) — prepend API_URL
  return API_URL + url;
}

/* Render blog content preserving HTML (images, links, formatting from WordPress) */
function renderBlogContent(content) {
  if (!content) return '';
  // If content already contains HTML tags, render it directly
  if (/<[a-z][\s\S]*>/i.test(content)) {
    // Fix any relative image URLs within the HTML content
    return content.replace(/(<img[^>]+src=["'])(\/uploads\/[^"']+)(["'])/gi, (match, prefix, path, suffix) => {
      return prefix + API_URL + path + suffix;
    });
  }
  // Plain text — convert newlines to paragraphs
  return content.split('\n\n').map(para => `<p>${esc(para)}</p>`).join('');
}
