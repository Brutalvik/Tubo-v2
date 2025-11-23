
import { auth } from '../firebaseConfig';
import { UserProfile } from '../types';

// Simulated delay for async actions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Login Simulation
  login: async (email: string, password: string): Promise<UserProfile> => {
    await delay(800);
    
    // Simulate fetching user from "database" (localStorage)
    const storedKey = `tubo_user_${email}`;
    const storedUser = localStorage.getItem(storedKey);
    
    let userProfile: UserProfile;
    
    if (storedUser) {
        userProfile = JSON.parse(storedUser);
    } else {
        // Create a mock profile if not found for demo purposes
        userProfile = {
            uid: 'user_' + Math.random().toString(36).substr(2, 9),
            displayName: 'Demo User',
            email: email,
            photoURL: '',
            role: 'GUEST',
            currency: 'USD',
            isHostRegistered: false,
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
        localStorage.setItem(storedKey, JSON.stringify(userProfile));
    }

    // Persist active session
    localStorage.setItem('tubo_user', JSON.stringify(userProfile));
    
    // Update global auth state
    auth._setUser(userProfile);
    
    return userProfile;
  },

  // Register Simulation
  register: async (firstName: string, lastName: string, email: string, password: string): Promise<UserProfile> => {
    await delay(800);
    
    const newUserProfile: UserProfile = {
      uid: 'user_' + Math.random().toString(36).substr(2, 9),
      displayName: `${firstName} ${lastName}`,
      email: email,
      photoURL: "",
      role: 'GUEST',
      currency: 'USD',
      isHostRegistered: false,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    // Save to "database" and active session
    localStorage.setItem(`tubo_user_${email}`, JSON.stringify(newUserProfile));
    localStorage.setItem('tubo_user', JSON.stringify(newUserProfile));
    
    auth._setUser(newUserProfile);
    
    return newUserProfile;
  },

  // Social Login Simulation
  socialLogin: async (providerName: 'google' | 'apple'): Promise<UserProfile> => {
    await delay(800);
    
    const socialUser: UserProfile = {
        uid: 'social_' + Math.random().toString(36).substr(2, 9),
        displayName: providerName === 'google' ? 'Google User' : 'Apple User',
        email: `user@${providerName}.com`,
        photoURL: "https://i.pravatar.cc/150?u=social",
        role: 'GUEST',
        currency: 'USD',
        isHostRegistered: false,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    localStorage.setItem('tubo_user', JSON.stringify(socialUser));
    auth._setUser(socialUser);
    return socialUser;
  },

  // Logout
  logout: async (): Promise<void> => {
    await delay(300);
    localStorage.removeItem('tubo_user');
    auth._setUser(null);
  },

  // Update Profile
  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    await delay(500);
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user logged in");

    const updatedProfile = { ...currentUser, ...updates };
    
    // Update active session and "database"
    localStorage.setItem('tubo_user', JSON.stringify(updatedProfile));
    if (currentUser.email) {
        localStorage.setItem(`tubo_user_${currentUser.email}`, JSON.stringify(updatedProfile));
    }

    auth._setUser(updatedProfile);
    return updatedProfile;
  }
};
