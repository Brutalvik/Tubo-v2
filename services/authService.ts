
import { UserProfile } from '../types';

const STORAGE_KEY = 'tubo_user_session';

export const authService = {
  getCurrentUser: (): UserProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  login: async (email: string, password: string): Promise<UserProfile> => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Login failed');
    }

    const user = await response.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  register: async (firstName: string, lastName: string, email: string, password: string): Promise<UserProfile> => {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Registration failed');
    }

    const user = await response.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  socialLogin: async (provider: 'google' | 'apple'): Promise<UserProfile> => {
    // In a real app, this would involve a popup, redirect, and token exchange.
    // Since we don't have API keys, we mock the *provider* part but 
    // persist the result to our *real* backend so the account exists.
    
    const mockProfile = {
        provider,
        email: `user.${provider}.${Date.now()}@example.com`,
        firstName: provider === 'google' ? 'Google' : 'Apple',
        lastName: 'User',
        photoURL: provider === 'google' 
            ? 'https://lh3.googleusercontent.com/a/default-user=s96-c' 
            : 'https://i.pravatar.cc/150?u=apple'
    };

    const response = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockProfile)
    });

    if (!response.ok) {
         throw new Error('Social login failed');
    }

    const user = await response.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
    return Promise.resolve();
  },

  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const current = authService.getCurrentUser();
    if (!current) throw new Error("No user logged in");

    const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: current.uid, updates })
    });

    if (!response.ok) {
        throw new Error("Failed to update profile");
    }

    const updatedUser = await response.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
};
