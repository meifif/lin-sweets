/**
 * Lin Sweets — public site
 * Static, no Firebase. Update MENU data below to edit content.
 */

/* ══════════════════════════════════════════════════════════════
   STATIC MENU DATA — edit this to update the site
   ══════════════════════════════════════════════════════════════ */
const MENU = {
  'עוגיות': [
    {
      name: 'עוגיות שוקולד צ׳יפס',
      desc: 'עוגיות ביתיות עם שוקולד מריר טובעני ונגיסות',
      price: '30₪ / 6 יחידות',
      tags: ['כשר'],
      initial: 'ש',
      grad: 'linear-gradient(145deg, #2C1810, #5C3020)',
    },
    {
      name: 'עוגיות חמאה',
      desc: 'עוגיות חמאה פריכות ועדינות, אפשרות לקינמון',
      price: '28₪ / 6 יחידות',
      tags: ['כשר'],
      initial: 'ח',
      grad: 'linear-gradient(145deg, #1A1812, #4A3820)',
    },
    {
      name: 'עוגיות שיבולת שועל',
      desc: 'עם שוקולד ואגוזים, בריא וטעים',
      price: '25₪ / 6 יחידות',
      tags: ['כשר', 'ללא גלוטן'],
      initial: 'ב',
      grad: 'linear-gradient(145deg, #1E1C10, #504028)',
    },
  ],
  'עוגות': [
    {
      name: 'עוגת שוקולד',
      desc: 'עוגת שוקולד לחה ועשירה עם גנאש מריר',
      price: 'מ-120₪',
      tags: ['כשר'],
      initial: 'ע',
      grad: 'linear-gradient(145deg, #1C1010, #4A2020)',
    },
    {
      name: 'עוגת גבינה',
      desc: 'גבינה קרמית על בסיס ביסקוויט פריך',
      price: 'מ-140₪',
      tags: ['כשר'],
      initial: 'ג',
      grad: 'linear-gradient(145deg, #201818, #503838)',
    },
    {
      name: 'עוגת קרמל',
      desc: 'קרמל עם מלח ים ומוס שמנת מפנק',
      price: 'מ-150₪',
      tags: ['כשר'],
      initial: 'ק',
      grad: 'linear-gradient(145deg, #201810, #5A4018)',
    },
  ],
  'מתוקים': [
    {
      name: 'מקרונים',
      desc: 'מקרונים צרפתיים בטעמים עונתיים מפתיעים',
      price: '12₪ ליחידה',
      tags: ['כשר'],
      initial: 'מ',
      grad: 'linear-gradient(145deg, #1A1218, #4A2840)',
    },
    {
      name: 'טראפלס שוקולד',
      desc: 'כדורי שוקולד בלגי איכותי בציפוי קקאו',
      price: '8₪ ליחידה',
      tags: ['כשר', 'טבעוני'],
      initial: 'ט',
      grad: 'linear-gradient(145deg, #181210, #3C2818)',
    },
    {
      name: 'בראוניז',
      desc: 'בראוניז לחים ועשירים בשוקולד מריר',
      price: '35₪ / 6 יחידות',
      tags: ['כשר'],
      initial: 'ב',
      grad: 'linear-gradient(145deg, #1C1410, #4A3020)',
    },
  ],
  'עונתי': [
    {
      name: 'לחמניות קינמון',
      desc: 'לחמניות חמות עם קינמון, פקאן וציפוי שמנת',
      price: '20₪ ליחידה',
      tags: ['כשר'],
      initial: 'ל',
      grad: 'linear-gradient(145deg, #201810, #583820)',
    },
    {
      name: 'עוגיות ג׳ינג׳ר',
      desc: 'עוגיות תבלין חגיגיות עם ג׳ינג׳ר וקינמון',
      price: '30₪ / 6 יחידות',
      tags: ['כשר', 'טבעוני'],
      initial: 'ג',
      grad: 'linear-gradient(145deg, #1E1A10, #4E3C18)',
    },
  ],
};

const CATEGORIES = Object.keys(MENU);

/* ══════════════════════════════════════════════════════════════
   HEADER
   ══════════════════════════════════════════════════════════════ */
function initHeader() {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');

  // Solid on scroll
  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 50);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile drawer toggle
  burger.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
    drawer.setAttribute('aria-hidden', !open);
  });

  // Close drawer on link click
  drawer.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      header.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   SMOOTH SCROLL
   ══════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   MENU
   ══════════════════════════════════════════════════════════════ */
function renderMenu(category) {
  const grid = document.getElementById('menu-grid');
  const items = MENU[category] || [];
  grid.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'menu-card';

    const imgDiv = document.createElement('div');
    imgDiv.className = 'menu-card__img';

    const placeholder = document.createElement('div');
    placeholder.className = 'menu-card__img-placeholder';
    placeholder.style.setProperty('--placeholder-grad', item.grad);
    placeholder.dataset.initial = item.initial || '';
    placeholder.style.background = item.grad;
    imgDiv.appendChild(placeholder);

    const body = document.createElement('div');
    body.className = 'menu-card__body';

    const name = document.createElement('h3');
    name.className = 'menu-card__name';
    name.textContent = item.name;

    const desc = document.createElement('p');
    desc.className = 'menu-card__desc';
    desc.textContent = item.desc;

    body.appendChild(name);
    body.appendChild(desc);

    if (item.price) {
      const price = document.createElement('p');
      price.className = 'menu-card__price';
      price.textContent = item.price;
      body.appendChild(price);
    }

    if (item.tags && item.tags.length) {
      const tags = document.createElement('div');
      tags.className = 'menu-card__tags';
      item.tags.forEach((t) => {
        const span = document.createElement('span');
        span.className = 'menu-tag';
        span.textContent = t;
        tags.appendChild(span);
      });
      body.appendChild(tags);
    }

    card.appendChild(imgDiv);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

function initMenuTabs() {
  const tabsEl = document.getElementById('menu-tabs');
  let active = CATEGORIES[0];

  const setActive = (cat) => {
    active = cat;
    tabsEl.querySelectorAll('.menu-tab').forEach((btn) => {
      const on = btn.dataset.cat === cat;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on);
    });
    renderMenu(cat);
  };

  CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-tab' + (i === 0 ? ' is-active' : '');
    btn.textContent = cat;
    btn.dataset.cat = cat;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0);
    btn.addEventListener('click', () => setActive(cat));
    tabsEl.appendChild(btn);
  });

  renderMenu(active);
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEALS
   ══════════════════════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
  );

  els.forEach((el) => io.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   FOOTER YEAR
   ══════════════════════════════════════════════════════════════ */
function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setFooterYear();
  initHeader();
  initSmoothScroll();
  initMenuTabs();
  initReveal();
});
