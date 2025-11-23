
import { UserProfile } from '../types';

const STORAGE_KEY = 'tubo_user_session';

// Simulate a backend user database in local storage if needed, 
// but for this demo, we just manage the active session.

export const authService = {
  // Check if user is logged in on app load
  getCurrentUser: (): UserProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Simulate Login
  login: async (email: string, password: string): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          // Mock successful login
          const user: UserProfile = {
            uid: 'u_' + Math.random().toString(36).substr(2, 9),
            displayName: email.split('@')[0],
            email: email,
            photoURL: `https://i.pravatar.cc/150?u=${email}`,
            role: 'GUEST',
            currency: 'USD',
            isHostRegistered: false,
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    });
  },

  // Simulate Registration
  register: async (firstName: string, lastName: string, email: string, password: string): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const user: UserProfile = {
            uid: 'u_' + Math.random().toString(36).substr(2, 9),
            displayName: `${firstName} ${lastName}`,
            email: email,
            photoURL: `https://i.pravatar.cc/150?u=${email}`,
            role: 'GUEST',
            currency: 'USD',
            isHostRegistered: false,
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Registration failed"));
        }
      }, 1500);
    });
  },

  // Simulate Social Login (Google/Apple)
  socialLogin: async (provider: 'google' | 'apple'): Promise<UserProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: UserProfile = {
          uid: 'u_' + provider + '_' + Math.random().toString(36).substr(2, 9),
          displayName: provider === 'google' ? 'Google User' : 'Apple User',
          email: `${provider}.user@example.com`,
          photoURL: provider === 'google' 
            ? 'https://lh3.googleusercontent.com/a/default-user=s96-c' 
            : 'https://i.pravatar.cc/150?u=apple',
          role: 'GUEST',
          currency: 'USD',
          isHostRegistered: false,
          joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        resolve(user);
      }, 1500);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            localStorage.removeItem(STORAGE_KEY);
            resolve();
        }, 500);
    });
  },

  updateProfile: (updates: Partial<UserProfile>) => {
    const current = authService.getCurrentUser();
    if (current) {
        const updated = { ...current, ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    }
    return null;
  }
};
