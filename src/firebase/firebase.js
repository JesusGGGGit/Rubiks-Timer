import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration (provided by the user)
const firebaseConfig = {
  apiKey: "AIzaSyDLiklu561YiusEaf7Cn9y2hEbRQbu6W8I",
  authDomain: "rubiks-timer-19ce8.firebaseapp.com",
  projectId: "rubiks-timer-19ce8",
  storageBucket: "rubiks-timer-19ce8.firebasestorage.app",
  messagingSenderId: "844950117423",
  appId: "1:844950117423:web:aea50e384103e2d99b7ada",
  measurementId: "G-62RCY7LQLC"
};

// Initialize Firebase app and Firestore
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
