// @ts-ignore
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
// Get these from https://console.firebase.google.com/
export const firebaseConfig = {
  apiKey: "demo-api-key", // REPLACE THIS
  authDomain: "demo-project.firebaseapp.com", // REPLACE THIS
  projectId: "demo-project", // REPLACE THIS
  storageBucket: "demo-project.appspot.com", // REPLACE THIS
  messagingSenderId: "00000000000", // REPLACE THIS
  appId: "1:00000000000:web:0000000000000" // REPLACE THIS
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Helper to check if config is valid
export const isConfigValid = () => {
  return firebaseConfig.apiKey !== "demo-api-key";
};