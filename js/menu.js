/**
 * Firestore data access for the public site.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

export const MENU_CATEGORIES = ['עוגיות', 'עוגות', 'מתוקים', 'עונתי'];

/** @param {import('firebase/firestore').Firestore} db */
export async function fetchMainSettings(db) {
  const dRef = doc(db, 'settings', 'main');
  const snap = await getDoc(dRef);
  if (!snap.exists()) return null;
  return snap.data();
}

/**
 * Active menu items, sorted by `order`.
 * @param {import('firebase/firestore').Firestore} db
 */
export async function fetchMenuItems(db) {
  const q = query(collection(db, 'menu_items'), where('active', '==', true));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return items;
}

/**
 * Gallery page ordered by `order`.
 * @param {import('firebase/firestore').Firestore} db
 * @param {number} pageSize
 * @param {import('firebase/firestore').QueryDocumentSnapshot | null} cursor
 */
export async function fetchGalleryPage(db, pageSize, cursor) {
  const col = collection(db, 'gallery');
  const q = cursor
    ? query(col, orderBy('order'), startAfter(cursor), limit(pageSize))
    : query(col, orderBy('order'), limit(pageSize));
  const snap = await getDocs(q);
  return { docs: snap.docs, empty: snap.empty };
}
