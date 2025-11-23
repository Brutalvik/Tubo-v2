import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: REPLACE WITH YOUR ACTUAL FIREBASE CONFIG KEYS
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project
// 3. Add a Web App
// 4. Copy the config object below
// 5. Enable Authentication (Email/Password, Google, Apple) in the console
// 6. Enable Firestore Database in the console

const firebaseConfig = {
  apiKey: "AIzaSyDUMMYKEY_REPLACE_THIS_WITH_YOURS",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');