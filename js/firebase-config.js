/**
 * Firebase client bootstrap. Replace placeholders with your project config
 * from Firebase Console → Project settings → Your apps.
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyBoxSMjLvWrOjnl1eu0jwlEeR8Atu-2X8o",
  authDomain: "lin-sweets.firebaseapp.com",
  projectId: "lin-sweets",
  storageBucket: "lin-sweets.firebasestorage.app",
  messagingSenderId: "99527436316",
  appId: "1:99527436316:web:d407752b65188200e5d7d9",
  measurementId: "G-73J76J159T"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
