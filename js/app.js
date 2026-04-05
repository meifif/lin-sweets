/**
 * Public site: layout, Firestore-driven content, gallery, menu tabs.
 */
import { db } from './firebase-config.js';
import {
  MENU_CATEGORIES,
  fetchMainSettings,
  fetchMenuItems,
  fetchGalleryPage,
} from './menu.js';

const PLACEHOLDER_PRODUCT = 'images/placeholder/product.svg';
const PLACEHOLDER_HERO = 'images/placeholder/hero.svg';

const DEFAULT_SETTINGS = {
  heroTitle: 'מתוקים עם אהבה',
  heroSubtitle: 'כי כל רגע מיוחד מגיע לקבל משהו מתוק',
  heroCtaText: 'לגלות את התפריט',
  heroBgImageUrl: '',
  aboutText: document.getElementById('about-text')?.textContent?.trim() ?? '',
  aboutImageUrl: '',
  phone: '',
  whatsapp: '',
  contactEmail: '',
  instagram: '',
  facebook: '',
  serviceArea: 'תל אביב והמרכז',
};

const GALLERY_PAGE_SIZE = 12;

/** @type {InstanceType<typeof window.SimpleLightbox> | null} */
let galleryLightbox = null;

function digitsOnly(s) {
  return String(s || '').replace(/\D/g, '');
}

function instagramUrl(handle) {
  const h = String(handle || '').replace(/^@/, '').trim();
  if (!h) return '#';
  return `https://instagram.com/${encodeURIComponent(h)}`;
}

function applySettings(data) {
  const s = { ...DEFAULT_SETTINGS, ...data };

  const hero = document.getElementById('hero');
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const heroCta = document.getElementById('hero-cta');
  const aboutText = document.getElementById('about-text');
  const aboutImage = document.getElementById('about-image');

  if (hero) {
    const url = s.heroBgImageUrl || PLACEHOLDER_HERO;
    const safe = String(url).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    hero.style.backgroundImage = `url("${safe}")`;
  }
  if (heroTitle) heroTitle.textContent = s.heroTitle || DEFAULT_SETTINGS.heroTitle;
  if (heroSubtitle) heroSubtitle.textContent = s.heroSubtitle || DEFAULT_SETTINGS.heroSubtitle;
  if (heroCta) heroCta.textContent = s.heroCtaText || DEFAULT_SETTINGS.heroCtaText;

  if (aboutText) {
    const t = s.aboutText?.trim();
    if (t) aboutText.textContent = t;
  }
  if (aboutImage) {
    aboutImage.src = s.aboutImageUrl || PLACEHOLDER_PRODUCT;
    aboutImage.alt = 'לין יפרח';
  }

  const phoneEl = document.getElementById('contact-phone');
  const waEl = document.getElementById('contact-whatsapp');
  const emailEl = document.getElementById('contact-email');
  const igEl = document.getElementById('contact-instagram');
  const fbEl = document.getElementById('contact-facebook');
  const serviceText = document.getElementById('service-area-text');
  const footerIg = document.getElementById('footer-instagram');
  const footerFb = document.getElementById('footer-facebook');

  const phone = s.phone?.trim();
  if (phoneEl) {
    phoneEl.textContent = phone || 'טלפון';
    phoneEl.href = phone ? `tel:${digitsOnly(phone)}` : 'tel:';
  }

  const wa = digitsOnly(s.whatsapp);
  if (waEl) {
    waEl.textContent = wa ? 'וואטסאפ' : 'וואטסאפ';
    waEl.href = wa ? `https://wa.me/${wa}` : '#';
    if (!wa) waEl.setAttribute('aria-disabled', 'true');
    else waEl.removeAttribute('aria-disabled');
  }

  const em = s.contactEmail?.trim();
  if (emailEl) {
    emailEl.textContent = em || 'מייל';
    emailEl.href = em ? `mailto:${em}` : 'mailto:';
  }

  const ig = s.instagram?.trim();
  if (igEl) {
    igEl.textContent = ig ? (ig.startsWith('@') ? ig : `@${ig}`) : 'אינסטגרם';
    igEl.href = instagramUrl(ig);
  }
  if (footerIg) {
    footerIg.href = instagramUrl(ig);
  }

  const fb = s.facebook?.trim();
  if (fbEl) {
    fbEl.textContent = 'פייסבוק';
    fbEl.href = fb || '#';
  }
  if (footerFb) {
    footerFb.href = fb || '#';
  }

  if (serviceText) {
    serviceText.textContent = s.serviceArea || DEFAULT_SETTINGS.serviceArea;
  }
}

function renderMenuSkeleton(count) {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('div');
    el.className = 'skeleton';
    el.setAttribute('aria-hidden', 'true');
    grid.appendChild(el);
  }
}

function renderMenuItems(items, category) {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  const filtered = items.filter((it) => (it.category || '') === category);
  grid.innerHTML = '';

  if (filtered.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-state';
    p.textContent = 'בקרוב יתווספו פריטים לקטגוריה זו.';
    grid.appendChild(p);
    return;
  }

  for (const it of filtered) {
    const card = document.createElement('article');
    card.className = 'menu-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'menu-card__img-wrap';
    const img = document.createElement('img');
    img.className = 'menu-card__img';
    img.src = it.imageUrl || PLACEHOLDER_PRODUCT;
    img.alt = it.name || 'מוצר';
    img.loading = 'lazy';
    imgWrap.appendChild(img);

    const body = document.createElement('div');
    body.className = 'menu-card__body';

    const name = document.createElement('h3');
    name.className = 'menu-card__name';
    name.textContent = it.name || '';

    const desc = document.createElement('p');
    desc.className = 'menu-card__desc';
    desc.textContent = it.description || '';

    body.appendChild(name);
    body.appendChild(desc);

    if (it.price) {
      const price = document.createElement('p');
      price.className = 'menu-card__price';
      price.textContent = it.price;
      body.appendChild(price);
    }

    const tags = Array.isArray(it.tags) ? it.tags : [];
    if (tags.length) {
      const tagRow = document.createElement('div');
      tagRow.className = 'menu-card__tags';
      for (const t of tags) {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = t;
        tagRow.appendChild(span);
      }
      body.appendChild(tagRow);
    }

    card.appendChild(imgWrap);
    card.appendChild(body);
    grid.appendChild(card);
  }
}

function buildMenuTabs(items) {
  const wrap = document.getElementById('menu-tabs');
  if (!wrap) return;

  wrap.innerHTML = '';
  let activeCategory = MENU_CATEGORIES[0];

  const setActive = (cat) => {
    activeCategory = cat;
    wrap.querySelectorAll('.menu-tab').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.category === cat);
      btn.setAttribute('aria-selected', btn.dataset.category === cat ? 'true' : 'false');
    });
    renderMenuItems(items, cat);
  };

  MENU_CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-tab' + (i === 0 ? ' is-active' : '');
    btn.textContent = cat;
    btn.dataset.category = cat;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', () => setActive(cat));
    wrap.appendChild(btn);
  });

  setActive(activeCategory);
}

/** @param {import('firebase/firestore').QueryDocumentSnapshot[]} docSnaps */
function appendGalleryNodes(docSnaps, grid) {
  for (const d of docSnaps) {
    const data = d.data();
    const url = data.imageUrl;
    if (!url) continue;

    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('data-caption', data.caption || '');
    const img = document.createElement('img');
    img.src = url;
    img.alt = data.caption || 'גלריה';
    img.loading = 'lazy';
    a.appendChild(img);
    grid.appendChild(a);
  }
}

function refreshLightbox() {
  const Ctor = window.SimpleLightbox;
  const grid = document.querySelector('.gallery-grid');
  if (!Ctor || !grid) return;

  if (galleryLightbox && typeof galleryLightbox.destroy === 'function') {
    galleryLightbox.destroy();
    galleryLightbox = null;
  }

  const anchors = grid.querySelectorAll('a[href]');
  if (!anchors.length) return;

  galleryLightbox = new Ctor('.gallery-grid a', {
    captionsData: 'caption',
    captionDelay: 250,
  });
}

async function loadGallery() {
  const grid = document.getElementById('gallery-grid');
  const moreBtn = document.getElementById('gallery-load-more');
  if (!grid) return;

  grid.innerHTML = '';
  /** @type {import('firebase/firestore').QueryDocumentSnapshot | null} */
  let cursor = null;
  let hasMore = true;

  const loadPage = async () => {
    try {
      const { docs, empty } = await fetchGalleryPage(db, GALLERY_PAGE_SIZE, cursor);
      if (empty && !cursor) {
        const p = document.createElement('p');
        p.className = 'empty-state';
        p.textContent = 'הגלריה תעודכן בקרוב.';
        grid.appendChild(p);
        if (moreBtn) moreBtn.hidden = true;
        return;
      }
      appendGalleryNodes(docs, grid);
      cursor = docs.length ? docs[docs.length - 1] : cursor;
      hasMore = docs.length === GALLERY_PAGE_SIZE;
      if (moreBtn) moreBtn.hidden = !hasMore;
      refreshLightbox();
    } catch {
      const p = document.createElement('p');
      p.className = 'empty-state';
      p.textContent = 'לא ניתן לטעון את הגלריה כרגע. נסו שוב מאוחר יותר.';
      grid.appendChild(p);
      if (moreBtn) moreBtn.hidden = true;
    }
  };

  await loadPage();

  if (moreBtn) {
    moreBtn.addEventListener('click', async () => {
      moreBtn.disabled = true;
      await loadPage();
      moreBtn.disabled = false;
    });
  }
}

function initHeader() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('nav-mobile');

  const solidOnScroll = () => {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 40);
  };
  solidOnScroll();
  window.addEventListener('scroll', solidOnScroll, { passive: true });

  const closeMenu = () => {
    if (!header || !toggle) return;
    header.classList.remove('is-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle?.addEventListener('click', () => {
    if (!header || !toggle) return;
    const open = header.classList.toggle('is-menu-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  mobile?.querySelectorAll('a[data-scroll]').forEach((a) => {
    a.addEventListener('click', closeMenu);
  });

  document.querySelectorAll('a[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMenu();
      }
    });
  });
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  els.forEach((el) => io.observe(el));
}

function setFooterYear() {
  const el = document.getElementById('footer-copy');
  if (!el) return;
  const y = new Date().getFullYear();
  el.textContent = `© ${y} לין יפרח — כל הזכויות שמורות`;
}

async function bootstrap() {
  setFooterYear();
  initHeader();
  initReveal();

  renderMenuSkeleton(6);

  try {
    const settings = await fetchMainSettings(db);
    if (settings) applySettings(settings);
    else applySettings({});
  } catch {
    applySettings({});
  }

  try {
    const items = await fetchMenuItems(db);
    buildMenuTabs(items);
  } catch {
    const tabs = document.getElementById('menu-tabs');
    const grid = document.getElementById('menu-grid');
    if (tabs) tabs.innerHTML = '';
    if (grid) {
      grid.innerHTML = '';
      const p = document.createElement('p');
      p.className = 'empty-state';
      p.textContent = 'לא ניתן לטעון את התפריט. בדקו את החיבור או את הגדרות Firebase.';
      grid.appendChild(p);
    }
  }

  await loadGallery();
}

bootstrap();
