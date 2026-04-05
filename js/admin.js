/**
 * Admin panel: Firebase Auth, Firestore CRUD, Storage uploads, Sortable reorder.
 */
import { auth, db, storage } from './firebase-config.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getDownloadURL, ref, uploadBytes } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

const settingsRef = () => doc(db, 'settings', 'main');

/** @type {boolean} */
let adminFormListenersBound = false;

function showToast(message, isError = false) {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' toast--error' : '');
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 4200);
}

async function uploadImage(pathPrefix, file) {
  const safeName = file.name.replace(/[^\w.\-]/g, '_');
  const storageRef = ref(storage, `${pathPrefix}/${Date.now()}_${safeName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

async function loadSettingsForm() {
  const snap = await getDoc(settingsRef());
  const data = snap.exists() ? snap.data() : {};

  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v ?? '';
  };

  setVal('hero-title', data.heroTitle);
  setVal('hero-subtitle', data.heroSubtitle);
  setVal('hero-cta', data.heroCtaText);
  setVal('about-text', data.aboutText);
  setVal('contact-phone', data.phone);
  setVal('contact-whatsapp', data.whatsapp);
  setVal('contact-email', data.contactEmail);
  setVal('contact-instagram', data.instagram);
  setVal('contact-facebook', data.facebook);
  setVal('contact-service', data.serviceArea);

  const heroPrev = document.getElementById('hero-bg-preview');
  if (heroPrev && data.heroBgImageUrl) {
    heroPrev.src = data.heroBgImageUrl;
    heroPrev.classList.remove('is-hidden');
  }
  const aboutPrev = document.getElementById('about-image-preview');
  if (aboutPrev && data.aboutImageUrl) {
    aboutPrev.src = data.aboutImageUrl;
    aboutPrev.classList.remove('is-hidden');
  }
}

async function saveSettingsPartial(patch) {
  await setDoc(settingsRef(), patch, { merge: true });
}

/** @returns {string[]} */
function readMenuTags() {
  const tags = [];
  if (document.getElementById('tag-kosher')?.checked) tags.push('כשר');
  if (document.getElementById('tag-gluten')?.checked) tags.push('ללא גלוטן');
  if (document.getElementById('tag-vegan')?.checked) tags.push('טבעוני');
  return tags;
}

function setMenuTags(tags) {
  const set = new Set(Array.isArray(tags) ? tags : []);
  const k = document.getElementById('tag-kosher');
  const g = document.getElementById('tag-gluten');
  const v = document.getElementById('tag-vegan');
  if (k) k.checked = set.has('כשר');
  if (g) g.checked = set.has('ללא גלוטן');
  if (v) v.checked = set.has('טבעוני');
}

function resetMenuForm() {
  const form = document.getElementById('menu-item-form');
  form?.reset();
  setMenuTags([]);
  const editId = document.getElementById('menu-edit-id');
  if (editId) editId.value = '';
  const prev = document.getElementById('menu-image-preview');
  if (prev) {
    prev.src = '';
    prev.classList.add('is-hidden');
  }
  const saveBtn = document.getElementById('menu-save-btn');
  if (saveBtn) saveBtn.textContent = 'הוספת מוצר';
  document.getElementById('menu-cancel-edit')?.classList.add('is-hidden');
}

async function getNextMenuOrder() {
  const snap = await getDocs(collection(db, 'menu_items'));
  let max = 0;
  snap.forEach((d) => {
    const o = d.data().order;
    if (typeof o === 'number' && o > max) max = o;
  });
  return max + 1;
}

async function getNextGalleryOrder() {
  const snap = await getDocs(collection(db, 'gallery'));
  let max = 0;
  snap.forEach((d) => {
    const o = d.data().order;
    if (typeof o === 'number' && o > max) max = o;
  });
  return max + 1;
}

async function renderMenuList() {
  const ul = document.getElementById('menu-admin-list');
  if (!ul) return;
  if (ul._sortableInstance) {
    ul._sortableInstance.destroy();
    ul._sortableInstance = null;
  }
  ul.innerHTML = '';
  const snap = await getDocs(collection(db, 'menu_items'));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const row of rows) {
    const li = document.createElement('li');
    li.className = 'admin-list__item';
    li.dataset.id = row.id;

    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.textContent = '⠿';
    handle.title = 'גרירה לסידור';

    const img = document.createElement('img');
    img.src = row.imageUrl || 'images/placeholder/product.svg';
    img.alt = '';

    const mid = document.createElement('div');
    const title = document.createElement('div');
    title.textContent = row.name || '(ללא שם)';
    const meta = document.createElement('div');
    meta.className = 'item-meta';
    meta.textContent = `${row.category || ''} · ${row.active === false ? 'מוסתר' : 'פעיל'}`;

    mid.appendChild(title);
    mid.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn--ghost';
    editBtn.textContent = 'עריכה';
    editBtn.addEventListener('click', () => startEditMenuItem(row));

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn btn--danger';
    delBtn.textContent = 'מחיקה';
    delBtn.addEventListener('click', async () => {
      if (!confirm('למחוק מוצר זה?')) return;
      try {
        await deleteDoc(doc(db, 'menu_items', row.id));
        showToast('המוצר נמחק');
        await renderMenuList();
      } catch (e) {
        showToast('שגיאה במחיקה', true);
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(handle);
    li.appendChild(img);
    li.appendChild(mid);
    li.appendChild(actions);
    ul.appendChild(li);
  }

  const SortableCtor = window.Sortable;
  if (SortableCtor) {
    ul._sortableInstance = SortableCtor.create(ul, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: async () => {
        const ids = [...ul.querySelectorAll('.admin-list__item')].map((el) => el.dataset.id);
        const batch = writeBatch(db);
        ids.forEach((id, index) => {
          if (id) batch.update(doc(db, 'menu_items', id), { order: index + 1 });
        });
        try {
          await batch.commit();
          showToast('סדר התפריט עודכן');
        } catch {
          showToast('שגיאה בעדכון הסדר', true);
        }
      },
    });
  }
}

function startEditMenuItem(row) {
  const editId = document.getElementById('menu-edit-id');
  if (editId) editId.value = row.id;
  const name = document.getElementById('menu-name');
  const cat = document.getElementById('menu-category');
  const desc = document.getElementById('menu-desc');
  const price = document.getElementById('menu-price');
  if (name) name.value = row.name || '';
  if (cat) cat.value = row.category || 'עוגיות';
  if (desc) desc.value = row.description || '';
  if (price) price.value = row.price || '';
  setMenuTags(row.tags);

  const prev = document.getElementById('menu-image-preview');
  if (prev && row.imageUrl) {
    prev.src = row.imageUrl;
    prev.classList.remove('is-hidden');
  }
  const saveBtn = document.getElementById('menu-save-btn');
  if (saveBtn) saveBtn.textContent = 'עדכון מוצר';
  document.getElementById('menu-cancel-edit')?.classList.remove('is-hidden');
  document.getElementById('card-menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function renderGalleryList() {
  const ul = document.getElementById('gallery-admin-list');
  if (!ul) return;
  if (ul._sortableInstance) {
    ul._sortableInstance.destroy();
    ul._sortableInstance = null;
  }
  ul.innerHTML = '';
  const snap = await getDocs(collection(db, 'gallery'));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const row of rows) {
    const li = document.createElement('li');
    li.className = 'admin-list__item';
    li.dataset.id = row.id;

    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.textContent = '⠿';

    const img = document.createElement('img');
    img.src = row.imageUrl || '';
    img.alt = '';

    const mid = document.createElement('div');
    const cap = document.createElement('div');
    cap.textContent = row.caption || '(ללא כיתוב)';
    mid.appendChild(cap);

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn btn--danger';
    delBtn.textContent = 'מחיקה';
    delBtn.addEventListener('click', async () => {
      if (!confirm('למחוק תמונה זו מהגלריה?')) return;
      try {
        await deleteDoc(doc(db, 'gallery', row.id));
        showToast('התמונה הוסרה');
        await renderGalleryList();
      } catch {
        showToast('שגיאה במחיקה', true);
      }
    });
    actions.appendChild(delBtn);

    li.appendChild(handle);
    li.appendChild(img);
    li.appendChild(mid);
    li.appendChild(actions);
    ul.appendChild(li);
  }

  const SortableCtor = window.Sortable;
  if (SortableCtor) {
    ul._sortableInstance = SortableCtor.create(ul, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: async () => {
        const ids = [...ul.querySelectorAll('.admin-list__item')].map((el) => el.dataset.id);
        const batch = writeBatch(db);
        ids.forEach((id, index) => {
          if (id) batch.update(doc(db, 'gallery', id), { order: index + 1 });
        });
        try {
          await batch.commit();
          showToast('סדר הגלריה עודכן');
        } catch {
          showToast('שגיאה בעדכון הסדר', true);
        }
      },
    });
  }
}

function bindAdminFormListeners() {
  if (adminFormListenersBound) return;
  adminFormListenersBound = true;

  document.getElementById('hero-save-text')?.addEventListener('click', async () => {
    try {
      await saveSettingsPartial({
        heroTitle: document.getElementById('hero-title')?.value?.trim() || '',
        heroSubtitle: document.getElementById('hero-subtitle')?.value?.trim() || '',
        heroCtaText: document.getElementById('hero-cta')?.value?.trim() || '',
      });
      showToast('טקסטי ה-Hero נשמרו');
    } catch {
      showToast('שגיאה בשמירה', true);
    }
  });

  document.getElementById('hero-bg-file')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage('hero', file);
      await saveSettingsPartial({ heroBgImageUrl: url });
      const prev = document.getElementById('hero-bg-preview');
      if (prev) {
        prev.src = url;
        prev.classList.remove('is-hidden');
      }
      showToast('תמונת רקע הועלתה');
    } catch {
      showToast('שגיאה בהעלאת תמונה', true);
    }
    e.target.value = '';
  });

  document.getElementById('about-save')?.addEventListener('click', async () => {
    try {
      const text = document.getElementById('about-text')?.value ?? '';
      const file = document.getElementById('about-image-file')?.files?.[0];
      const patch = { aboutText: text };
      if (file) {
        patch.aboutImageUrl = await uploadImage('about', file);
        const prev = document.getElementById('about-image-preview');
        if (prev) {
          prev.src = patch.aboutImageUrl;
          prev.classList.remove('is-hidden');
        }
      }
      await saveSettingsPartial(patch);
      showToast('סעיף ״מי אני״ נשמר');
      const imgInput = document.getElementById('about-image-file');
      if (imgInput) imgInput.value = '';
    } catch {
      showToast('שגיאה בשמירה', true);
    }
  });

  document.getElementById('about-upload-only')?.addEventListener('click', async () => {
    const file = document.getElementById('about-image-file')?.files?.[0];
    if (!file) {
      showToast('בחרו קובץ תמונה', true);
      return;
    }
    try {
      const url = await uploadImage('about', file);
      await saveSettingsPartial({ aboutImageUrl: url });
      const prev = document.getElementById('about-image-preview');
      if (prev) {
        prev.src = url;
        prev.classList.remove('is-hidden');
      }
      showToast('תמונת הפרופיל עודכנה');
      document.getElementById('about-image-file').value = '';
    } catch {
      showToast('שגיאה בהעלאה', true);
    }
  });

  document.getElementById('contact-save')?.addEventListener('click', async () => {
    try {
      await saveSettingsPartial({
        phone: document.getElementById('contact-phone')?.value?.trim() || '',
        whatsapp: document.getElementById('contact-whatsapp')?.value?.trim() || '',
        contactEmail: document.getElementById('contact-email')?.value?.trim() || '',
        instagram: document.getElementById('contact-instagram')?.value?.trim() || '',
        facebook: document.getElementById('contact-facebook')?.value?.trim() || '',
        serviceArea: document.getElementById('contact-service')?.value?.trim() || '',
      });
      showToast('פרטי קשר נשמרו');
    } catch {
      showToast('שגיאה בשמירה', true);
    }
  });

  document.getElementById('menu-item-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('menu-edit-id')?.value?.trim();
    const name = document.getElementById('menu-name')?.value?.trim();
    const category = document.getElementById('menu-category')?.value;
    const description = document.getElementById('menu-desc')?.value?.trim() || '';
    const price = document.getElementById('menu-price')?.value?.trim() || '';
    const tags = readMenuTags();
    const file = document.getElementById('menu-image-file')?.files?.[0];

    if (!name) {
      showToast('נא למלא שם מוצר', true);
      return;
    }

    try {
      let imageUrl = '';
      const prev = document.getElementById('menu-image-preview');
      if (file) {
        imageUrl = await uploadImage('menu', file);
      } else if (editId) {
        const snap = await getDoc(doc(db, 'menu_items', editId));
        imageUrl = snap.data()?.imageUrl || '';
      }

      if (!imageUrl && !editId) {
        showToast('נא להעלות תמונת מוצר', true);
        return;
      }

      const payload = { name, category, description, price, tags, active: true };
      if (imageUrl) payload.imageUrl = imageUrl;

      if (editId) {
        await updateDoc(doc(db, 'menu_items', editId), payload);
        showToast('המוצר עודכן');
      } else {
        const order = await getNextMenuOrder();
        await addDoc(collection(db, 'menu_items'), { ...payload, order });
        showToast('המוצר נוסף');
      }
      resetMenuForm();
      await renderMenuList();
    } catch {
      showToast('שגיאה בשמירת המוצר', true);
    }
  });

  document.getElementById('menu-cancel-edit')?.addEventListener('click', () => {
    resetMenuForm();
  });

  document.getElementById('menu-image-file')?.addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    const prev = document.getElementById('menu-image-preview');
    if (!prev) return;
    if (!f) {
      prev.src = '';
      prev.classList.add('is-hidden');
      return;
    }
    prev.src = URL.createObjectURL(f);
    prev.classList.remove('is-hidden');
  });

  document.getElementById('gallery-upload-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('gallery-files');
    const files = input?.files ? [...input.files] : [];
    const defaultCaption = document.getElementById('gallery-caption-default')?.value?.trim() || '';
    if (!files.length) {
      showToast('בחרו קבצים להעלאה', true);
      return;
    }
    let orderBase = await getNextGalleryOrder();
    try {
      for (let i = 0; i < files.length; i += 1) {
        const url = await uploadImage('gallery', files[i]);
        await addDoc(collection(db, 'gallery'), {
          imageUrl: url,
          caption: defaultCaption,
          order: orderBase + i,
          createdAt: serverTimestamp(),
        });
      }
      showToast('התמונות הועלו');
      input.value = '';
      await renderGalleryList();
    } catch {
      showToast('שגיאה בהעלאת הגלריה', true);
    }
  });
}

async function initAdminUi() {
  await loadSettingsForm();
  await renderMenuList();
  await renderGalleryList();
  bindAdminFormListeners();
}

function showLogin() {
  document.getElementById('login-panel')?.classList.remove('is-hidden');
  document.getElementById('admin-panel')?.classList.add('is-hidden');
}

function showAdmin() {
  document.getElementById('login-panel')?.classList.add('is-hidden');
  document.getElementById('admin-panel')?.classList.remove('is-hidden');
}

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value ?? '';
  const errEl = document.getElementById('login-error');
  const submit = document.getElementById('login-submit');
  if (errEl) {
    errEl.style.display = 'none';
    errEl.textContent = '';
  }
  submit.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (errEl) {
      errEl.textContent = 'התחברות נכשלה. בדקו אימייל וסיסמה.';
      errEl.style.display = 'block';
    }
  } finally {
    submit.disabled = false;
  }
});

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    showToast('התנתקתם בהצלחה');
  } catch {
    showToast('שגיאה בהתנתקות', true);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    showAdmin();
    try {
      await initAdminUi();
    } catch (e) {
      showToast('שגיאה בטעינת הנתונים. בדקו את Firebase.', true);
    }
  } else {
    showLogin();
  }
});
