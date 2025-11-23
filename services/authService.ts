import { auth } from '../firebaseConfig';
import { UserProfile } from '../types';

// Simulated delay for async actions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Login Logic
  login: async (email: string, password: string): Promise<UserProfile> => {
    await delay(800);
    
    // Check local database
    const storedKey = `tubo_user_${email.toLowerCase()}`;
    const storedUser = localStorage.getItem(storedKey);
    
    if (storedUser) {
        const userProfile = JSON.parse(storedUser);
        
        // Persist active session
        localStorage.setItem('tubo_user', JSON.stringify(userProfile));
        auth._setUser(userProfile);
        
        return userProfile;
    } else {
        throw new Error("auth/invalid-credential");
    }
  },

  // Register Logic
  register: async (firstName: string, lastName: string, email: string, password: string): Promise<UserProfile> => {
    await delay(800);
    
    const emailKey = `tubo_user_${email.toLowerCase()}`;
    
    // Check if user already exists
    if (localStorage.getItem(emailKey)) {
        throw new Error("auth/email-already-in-use");
    }

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
    localStorage.setItem(emailKey, JSON.stringify(newUserProfile));
    localStorage.setItem('tubo_user', JSON.stringify(newUserProfile));
    
    auth._setUser(newUserProfile);
    
    return newUserProfile;
  },

  // Social Login - Interactive Popup Flow with Real Logic
  socialLogin: async (providerName: 'google' | 'apple'): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
        // 1. Open the popup
        const width = 500;
        const height = 600;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        
        const popup = window.open(
            `/public/mock-login.html?provider=${providerName}`,
            `Sign In with ${providerName}`,
            `width=${width},height=${height},top=${top},left=${left}`
        );

        if (!popup) {
            reject(new Error("auth/popup-blocked"));
            return;
        }

        // 2. Listen for the response message
        const messageHandler = (event: MessageEvent) => {
            if (event.data?.type === 'OAUTH_RESPONSE') {
                const userData = event.data.payload;
                
                // 3. Process the user data (REAL LOGIC)
                const emailKey = `tubo_user_${userData.email.toLowerCase()}`;
                const existingUser = localStorage.getItem(emailKey);

                let userProfile: UserProfile;

                if (existingUser) {
                    // LOGIN: User exists, use their stored data
                    console.log("Social Login: User found in DB, logging in...");
                    userProfile = JSON.parse(existingUser);
                } else {
                    // REGISTER: Create new user
                    console.log("Social Login: New user, registering...");
                    userProfile = {
                        uid: 'social_' + Math.random().toString(36).substr(2, 9),
                        displayName: `${userData.firstName} ${userData.lastName}`.trim(),
                        email: userData.email,
                        photoURL: userData.photoURL || "",
                        role: 'GUEST',
                        currency: 'USD',
                        isHostRegistered: false,
                        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    };
                    
                    // Save to "DB"
                    localStorage.setItem(emailKey, JSON.stringify(userProfile));
                }

                // Persist Session
                localStorage.setItem('tubo_user', JSON.stringify(userProfile));
                auth._setUser(userProfile);

                // Cleanup
                window.removeEventListener('message', messageHandler);
                resolve(userProfile);
            }
        };

        window.addEventListener('message', messageHandler);

        // Detect popup closing
        const timer = setInterval(() => {
            if (popup.closed) {
                clearInterval(timer);
                window.removeEventListener('message', messageHandler);
                // If we haven't resolved yet, it's a cancellation, but we can't easily reject without triggering errors if race condition
            }
        }, 1000);
    });
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
    
    // Update active session
    localStorage.setItem('tubo_user', JSON.stringify(updatedProfile));
    
    // Update "database" record
    if (currentUser.email) {
        localStorage.setItem(`tubo_user_${currentUser.email.toLowerCase()}`, JSON.stringify(updatedProfile));
    }

    auth._setUser(updatedProfile);
    return updatedProfile;
  }
};