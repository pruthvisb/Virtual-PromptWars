import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';

// Standard sandbox/placeholder config.
// In development, this registers fine in the Firebase SDK.
const firebaseConfig = {
  apiKey: "VITE_FIREBASE_API_KEY_PLACEHOLDER",
  authDomain: "ecoverse-fb7d7.firebaseapp.com",
  projectId: "ecoverse-fb7d7",
  storageBucket: "ecoverse-fb7d7.firebasestorage.app",
  messagingSenderId: "1021133790919",
  appId: "1:1021133790919:web:6719aa3f0ad7385ac968e2",
  measurementId: "G-MS555M8C0Y"
};

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Export Firestore database client
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
};
export type { User };

