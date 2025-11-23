
// @ts-ignore
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
// Get these from https://console.firebase.google.com/
export const firebaseConfig = {
  apiKey: "AIzaSyDOC-REPLACE-THIS-WITH-YOUR-KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Helper to check if config is valid (Optional, for UI warnings)
export const isConfigValid = () => {
  return firebaseConfig.apiKey !== "AIzaSyDOC-REPLACE-THIS-WITH-YOUR-KEY";
};
