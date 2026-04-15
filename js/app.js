/**
 * Lin Sweets — public site
 * Static, no Firebase. Update MENU data below to edit content.
 */

/* ══════════════════════════════════════════════════════════════
   STATIC MENU DATA — edit this to update the site
   ══════════════════════════════════════════════════════════════ */
const MENU = {
  'מגשי ביס': [
    {
      name: 'ביס לחמניות בית',
      desc: '15 יחידות לחמניות ביתיות במילואים — לבחירה: סביח, סלט טונה, סלט ביצים, שמנת מטובלת. מיקס של כמה סוגים 200₪',
      price: '180₪ (סוג אחד) | 200₪ (מיקס)',
      imageUrl: 'images/menu/rolls.jpg',
    },
    {
      name: 'טורטיה במילוי',
      desc: '12 יחידות טורטיה עם מילויים משתנים ומגוונים',
      price: '140₪',
      imageUrl: 'images/menu/tortilla.jpg',
    },
    {
      name: 'מגש ביס תפוחי אדמה מדורה',
      desc: 'תפוחי אדמה אפויים בשום ושמן זית — רכים מבפנים ומוזהבים מבחוץ',
      price: '120₪',
      imageUrl: 'images/menu/potatoes.jpg',
    },
    {
      name: 'מגש ביס בצק עלים מלוח',
      desc: '20 יחידות בצק עלים פריך ומלוח — מושלם לאירוע',
      price: '150₪',
      imageUrl: 'images/menu/puff-pastry.jpg',
    },
    {
      name: 'קוראסון בולגרית',
      desc: '15 יחידות קוראסון בולגרי ממולא בשכבות — פריך ועשיר',
      price: '180₪',
      imageUrl: 'images/menu/croissant.jpg',
    },
    {
      name: 'קיש אישי',
      desc: '20 יחידות קיש בגדלים אישיים עם מילויים מגוונים',
      price: '160₪',
      imageUrl: 'images/menu/quiche.jpg',
    },
    {
      name: 'לחמניות בית שום',
      desc: '10 יחידות לחמניות ביתיות ברוטב שום עשיר — ריח שלא ניתן לעמוד בפניו',
      price: '80₪',
      imageUrl: 'images/menu/garlic-buns.jpg',
    },
  ],
  'סלטים': [
    {
      name: 'מגש ירקות',
      desc: 'מגש ירקות טריים וצבעוניים — תירס, גזר, מלפפון, פלפל, עגבניות שרי, צנוניות ועוד',
      price: '100₪',
      imageUrl: 'images/menu/vegetables.jpg',
    },
    {
      name: 'מגש סלטים',
      desc: 'מבחר סלטים עשירים ומגוונים — מתאים לכל אירוע',
      price: '100₪',
      imageUrl: 'images/menu/salads.jpg',
    },
  ],
  'פירות': [
    {
      name: 'מגש פירות',
      desc: 'מגש פירות העונה בסידור מרהיב — אבטיח, מנגו, ענבים, קיווי, פסיפלורה ועוד. מינימום הזמנה 10 יחידות',
      price: 'החל מ-120₪',
      imageUrl: 'images/menu/fruits.jpg',
    },
    {
      name: 'כוסות ／ קופסאות פירות',
      desc: 'כוסות או קופסאות אישיות חצי קילו / קילו — פירות העונה הטריים ביותר. מינימום הזמנה 10 יחידות',
      price: 'לפי עונה',
      imageUrl: 'images/menu/fruits.jpg',
    },
  ],
  'שולחן מתוק': [
    {
      name: 'שולחן מתוק',
      desc: '8 סוגי קינוחים מתחלפים לעד 15 סועדים — חוויה מתוקה ומרשימה לכל אירוע',
      price: 'לפי הזמנה',
      grad: 'linear-gradient(145deg, #2C1018, #6C2840)',
      initial: 'מ',
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

    if (item.imageUrl) {
      const img = document.createElement('img');
      img.src = item.imageUrl;
      img.alt = item.name;
      img.loading = 'lazy';
      imgDiv.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'menu-card__img-placeholder';
      placeholder.style.setProperty('--placeholder-grad', item.grad);
      placeholder.dataset.initial = item.initial || '';
      placeholder.style.background = item.grad;
      imgDiv.appendChild(placeholder);
    }

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
