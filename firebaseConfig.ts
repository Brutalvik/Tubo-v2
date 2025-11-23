
// Mock Firebase Configuration for Demo Environment
// This replaces the actual Firebase SDK imports to resolve build errors in environments 
// where 'firebase' package is missing or configuration is invalid.

export const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "00000000000",
  appId: "1:00000000000:web:0000000000000"
};

// Mock Auth Object
type AuthListener = (user: any) => void;

export const auth = {
  currentUser: null as any,
  listeners: [] as AuthListener[],
  
  onAuthStateChanged(callback: AuthListener) {
    this.listeners.push(callback);
    // Trigger initial state
    setTimeout(() => callback(this.currentUser), 0);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  },

  // Internal method to simulate auth state change
  _setUser(user: any) {
    this.currentUser = user;
    this.listeners.forEach(cb => cb(user));
  }
};

// Initialize mock user from local storage if available
try {
  const stored = localStorage.getItem('tubo_user');
  if (stored) {
    auth.currentUser = JSON.parse(stored);
  }
} catch (e) {
  console.error('Failed to restore auth state', e);
}

// Mock DB and Providers
export const db = {};
export const googleProvider = {};
export const appleProvider = {};
