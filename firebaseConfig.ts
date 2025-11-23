
// @ts-ignore
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// Real Firebase Configuration for Tubo Car Rental
export const firebaseConfig = {
  apiKey: "AIzaSyCK1poVVToVVJJPAyuVenwEJsXfR0iBRec",
  authDomain: "tubo-rental.firebaseapp.com",
  projectId: "tubo-rental",
  storageBucket: "tubo-rental.firebasestorage.app",
  messagingSenderId: "331587266410",
  appId: "1:331587266410:web:fe6d71d23f1ecde641a713",
  measurementId: "G-JY4K1EB205"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);

// Initialize Firestore with settings to avoid "Client is offline" errors in sandboxed environments
// Using experimentalForceLongPolling helps when WebSocket connections are restricted or unstable
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Helper to check if config is valid (Always true now that we have real keys)
export const isConfigValid = () => {
  return true;
};