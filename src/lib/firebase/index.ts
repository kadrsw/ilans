import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { isSupported, getAnalytics } from 'firebase/analytics';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getDatabase(app);

// Initialize analytics conditionally
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectDatabaseEmulator(db, 'localhost', 9000);
  } catch (error) {
    console.error('Error connecting to emulators:', error);
  }
}