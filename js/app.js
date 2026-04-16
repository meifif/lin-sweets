/**
 * Lin Sweets — public site
 * Menu and gallery are driven by Google Sheets (CSV).
 * Falls back to hardcoded data if the URL is empty or the fetch fails.
 */

/* ══════════════════════════════════════════════════════════════
   GOOGLE SHEET CONFIG  (menu)
   The sheet must be shared as "Anyone with the link can view".
   The tab must be named exactly: menu
   Columns: category | name | description | price | imageUrl
   ══════════════════════════════════════════════════════════════ */
const MENU_SHEET_ID  = '1qOc99bkyYpHTgf7EruO9QsSPHZ7qH-7lEJQTO1TDp6k';
const MENU_SHEET_TAB = 'menu'; // name of the sheet tab

const MENU_SHEET_URL = MENU_SHEET_ID
  ? `https://docs.google.com/spreadsheets/d/${MENU_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(MENU_SHEET_TAB)}`
  : '';

/* ══════════════════════════════════════════════════════════════
   GOOGLE DRIVE GALLERY CONFIG
   The owner drops photos into a Drive folder — no sheet needed.
   Setup (one-time, done by developer):
   1. Go to https://console.cloud.google.com → create a project
   2. Enable "Google Drive API"
   3. Create an API key (Credentials → Create credentials → API key)
   4. Restrict it: Application restrictions → HTTP referrers → add your domain
   5. Paste the key and the Drive folder ID below
   The folder must be shared as "Anyone with the link can view".
   ══════════════════════════════════════════════════════════════ */
const GOOGLE_API_KEY          = ''; // ← paste your Google API key here
const GALLERY_DRIVE_FOLDER_ID = ''; // ← paste the Drive folder ID here (from the folder URL)

/* ══════════════════════════════════════════════════════════════
   FALLBACK DATA — used when URLs above are empty or unreachable
   ══════════════════════════════════════════════════════════════ */
const MENU_FALLBACK = {
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

const GALLERY_FALLBACK = [
  { imageUrl: 'images/menu/rolls.jpg',      caption: 'ביס לחמניות בית', size: 'tall' },
  { imageUrl: 'images/menu/quiche.jpg',     caption: 'קיש אישי',        size: ''     },
  { imageUrl: 'images/menu/puff-pastry.jpg',caption: 'בצק עלים מלוח',   size: ''     },
  { imageUrl: 'images/menu/vegetables.jpg', caption: 'מגש ירקות',       size: 'wide' },
  { imageUrl: 'images/menu/fruits.jpg',     caption: 'מגש פירות',       size: 'tall' },
  { imageUrl: 'images/menu/croissant.jpg',  caption: 'קוראסון בולגרית', size: ''     },
];

/* ══════════════════════════════════════════════════════════════
   GOOGLE DRIVE URL HELPER
   Converts a Drive share link to a direct image URL.
   Share link:  https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   Direct link: https://drive.usercontent.google.com/download?id=FILE_ID&export=view
   ══════════════════════════════════════════════════════════════ */
function driveUrl(url) {
  if (!url) return '';
  // Match /file/d/ID/view share links
  const shareMatch = url.match(/\/file\/d\/([^/?#]+)/);
  if (shareMatch) return `https://drive.usercontent.google.com/download?id=${shareMatch[1]}&export=view`;
  // Match uc?export=view&id=ID or uc?id=ID legacy links
  const ucMatch = url.match(/[?&]id=([^&]+)/);
  if (ucMatch && url.includes('drive.google.com')) return `https://drive.usercontent.google.com/download?id=${ucMatch[1]}&export=view`;
  return url; // external or already-converted URL — use as-is
}

/* ══════════════════════════════════════════════════════════════
   CSV PARSER
   ══════════════════════════════════════════════════════════════ */
function parseCSVRow(line) {
  const fields = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(field.trim());
      field = '';
    } else {
      field += ch;
    }
  }
  fields.push(field.trim());
  return fields;
}

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVRow(lines[0]);
  return lines.slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseCSVRow(line);
      return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
    });
}

/* ══════════════════════════════════════════════════════════════
   DATA LOADERS
   ══════════════════════════════════════════════════════════════ */
async function loadMenuData() {
  if (!MENU_SHEET_URL) return MENU_FALLBACK;
  try {
    const res = await fetch(MENU_SHEET_URL);
    if (!res.ok) throw new Error(res.status);
    const rows = parseCSV(await res.text());
    const menu = {};
    rows.forEach((row) => {
      const cat = row['category'];
      if (!cat) return;
      if (!menu[cat]) menu[cat] = [];
      menu[cat].push({
        name:     row['name'],
        desc:     row['description'],
        price:    row['price'],
        imageUrl: driveUrl(row['imageUrl']),
      });
    });
    return Object.keys(menu).length ? menu : MENU_FALLBACK;
  } catch {
    return MENU_FALLBACK;
  }
}

// Mosaic size pattern applied to gallery images in order
const GALLERY_SIZE_PATTERN = ['tall', '', '', 'wide', 'tall', ''];

async function loadGalleryData() {
  try {
    const res = await fetch('images/gallery/');
    if (!res.ok) throw new Error(res.status);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const files = [...doc.querySelectorAll('a[href]')]
      .map((a) => a.getAttribute('href'))
      .filter((href) => /\.(jpe?g|png|webp)$/i.test(href))
      .map((href) => 'images/gallery/' + href.replace(/^.*\//, ''));
    if (!files.length) return GALLERY_FALLBACK;
    return files.map((path, i) => ({
      imageUrl: path,
      caption:  '',
      size:     GALLERY_SIZE_PATTERN[i % GALLERY_SIZE_PATTERN.length],
    }));
  } catch {
    return GALLERY_FALLBACK;
  }
}

/* ══════════════════════════════════════════════════════════════
   HEADER
   ══════════════════════════════════════════════════════════════ */
function initHeader() {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');

  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 50);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
    drawer.setAttribute('aria-hidden', !open);
  });

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
function renderMenu(menuData, category) {
  const grid = document.getElementById('menu-grid');
  const items = menuData[category] || [];
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
      img.referrerPolicy = 'no-referrer';
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

function initMenuTabs(menuData) {
  const tabsEl = document.getElementById('menu-tabs');
  const categories = Object.keys(menuData);
  let active = categories[0];

  const setActive = (cat) => {
    active = cat;
    tabsEl.querySelectorAll('.menu-tab').forEach((btn) => {
      const on = btn.dataset.cat === cat;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on);
    });
    renderMenu(menuData, cat);
  };

  categories.forEach((cat, i) => {
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

  renderMenu(menuData, active);
}

/* ══════════════════════════════════════════════════════════════
   GALLERY
   ══════════════════════════════════════════════════════════════ */
function renderGallery(items) {
  const mosaic = document.querySelector('.gallery-mosaic');
  if (!mosaic) return;
  mosaic.innerHTML = '';

  items.forEach((item) => {
    const fig = document.createElement('figure');
    fig.className = 'gal-item' +
      (item.size === 'tall' ? ' gal-item--tall' : '') +
      (item.size === 'wide' ? ' gal-item--wide' : '');
    fig.setAttribute('data-reveal', '');

    const imgWrap = document.createElement('div');
    imgWrap.className = 'gal-img';

    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.caption;
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';

    imgWrap.appendChild(img);
    fig.appendChild(imgWrap);

    if (item.caption) {
      const cap = document.createElement('figcaption');
      cap.textContent = item.caption;
      fig.appendChild(cap);
    }

    mosaic.appendChild(fig);
  });
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
document.addEventListener('DOMContentLoaded', async () => {
  setFooterYear();
  initHeader();
  initSmoothScroll();

  const [menuData, galleryData] = await Promise.all([
    loadMenuData(),
    loadGalleryData(),
  ]);

  initMenuTabs(menuData);
  renderGallery(galleryData);
  initReveal();
});
