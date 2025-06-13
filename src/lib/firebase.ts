import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAUmnb0K1M6-U8uzSsYVpTxAAdXdU8I--o",
  authDomain: "btc3-d7d9b.firebaseapp.com",
  databaseURL: "https://btc3-d7d9b-default-rtdb.firebaseio.com",
  projectId: "btc3-d7d9b",
  storageBucket: "btc3-d7d9b.firebasestorage.app",
  messagingSenderId: "444798129246",
  appId: "1:444798129246:web:b5c9c03ab05c4303e310cf",
  measurementId: "G-RKW8HDW9EL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Analytics'i koşullu olarak başlat
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);