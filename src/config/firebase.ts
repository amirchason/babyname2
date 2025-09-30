import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || "AIzaSyCydKy79vU999mXO60x-mmg8MRuozPCqqE",
  authDomain: "babynames-app.firebaseapp.com",
  projectId: "babynames-app",
  storageBucket: "babynames-app.appspot.com",
  messagingSenderId: "792099154161",
  appId: "1:792099154161:web:babynames2024",
  measurementId: "G-BABYNAMES"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with offline persistence
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.log('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence
    console.log('Persistence not available in this browser');
  } else {
    console.error('Firebase persistence error:', err);
  }
});

// Log Firebase initialization for debugging
console.log('Firebase initialized with project:', firebaseConfig.projectId);

export default app;