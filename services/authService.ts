
import { 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider } from '../firebaseConfig';
import { UserProfile } from '../types';

export const authService = {
  
  // --- LOGIN (Email/Password) ---
  login: async (email: string, password: string): Promise<UserProfile> => {
    // 1. Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Fetch extended profile from Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    } else {
        // Fallback if auth exists but firestore doc is missing (rare sync issue)
        const fallbackProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: 'GUEST',
            currency: 'USD',
            isHostRegistered: false,
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
        // Auto-heal: Create the missing doc
        await setDoc(userRef, fallbackProfile);
        return fallbackProfile;
    }
  },

  // --- REGISTER (Email/Password) ---
  register: async (firstName: string, lastName: string, email: string, password: string): Promise<UserProfile> => {
    // 1. Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const displayName = `${firstName} ${lastName}`;

    // 2. Update Auth Profile (Display Name)
    await updateFirebaseProfile(user, { displayName });

    // 3. Create Firestore Document for persistent user data
    const newUserProfile: UserProfile = {
      uid: user.uid,
      displayName: displayName,
      email: email,
      photoURL: "", // Default empty, user can upload later
      role: 'GUEST',
      currency: 'USD',
      isHostRegistered: false,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    await setDoc(doc(db, "users", user.uid), newUserProfile);

    return newUserProfile;
  },

  // --- SOCIAL LOGIN (Google/Apple) ---
  socialLogin: async (providerName: 'google' | 'apple'): Promise<UserProfile> => {
    const provider = providerName === 'google' ? googleProvider : appleProvider;
    
    try {
        // 1. Trigger Popup
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // 2. Check if user profile exists in Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // LOGIN: Return existing profile
            return userSnap.data() as UserProfile;
        } else {
            // REGISTRATION: Create new profile for this social user
            const newUserProfile: UserProfile = {
                uid: user.uid,
                displayName: user.displayName || 'Tubo User',
                email: user.email || '',
                photoURL: user.photoURL || '',
                role: 'GUEST',
                currency: 'USD',
                isHostRegistered: false,
                joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            };

            await setDoc(userRef, newUserProfile);
            return newUserProfile;
        }
    } catch (error: any) {
        console.error("Social login error:", error);
        throw error; // Propagate error to UI
    }
  },

  // --- LOGOUT ---
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  // --- UPDATE PROFILE ---
  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!auth.currentUser) throw new Error("No user logged in");
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    // Update Firestore
    await updateDoc(userRef, updates);
    
    // Return updated object
    const snapshot = await getDoc(userRef);
    return snapshot.data() as UserProfile;
  }
};
