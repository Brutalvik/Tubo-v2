
import { 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider, isConfigValid } from '../firebaseConfig';
import { UserProfile } from '../types';

export const authService = {
  
  // --- LOGIN ---
  login: async (email: string, password: string): Promise<UserProfile> => {
    if (!isConfigValid()) throw new Error("Please update firebaseConfig.ts with your actual Firebase keys.");

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user profile from Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    } else {
        // Fallback if firestore record is missing
        return {
            uid: user.uid,
            displayName: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: 'GUEST',
            currency: 'USD',
            isHostRegistered: false,
            joinDate: new Date().toLocaleDateString()
        };
    }
  },

  // --- REGISTER (Email/Password) ---
  register: async (firstName: string, lastName: string, email: string, password: string): Promise<UserProfile> => {
    if (!isConfigValid()) throw new Error("Please update firebaseConfig.ts with your actual Firebase keys.");

    // 1. Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const displayName = `${firstName} ${lastName}`;

    // 2. Update Auth Profile
    await updateFirebaseProfile(user, { displayName });

    // 3. Create Firestore Document
    const newUserProfile: UserProfile = {
      uid: user.uid,
      displayName: displayName,
      email: email,
      photoURL: "",
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
    if (!isConfigValid()) throw new Error("Please update firebaseConfig.ts with your actual Firebase keys.");

    const provider = providerName === 'google' ? googleProvider : appleProvider;
    
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        } else {
            // New Social User -> Create Profile
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
        throw error;
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
    
    // Return updated local object
    const snapshot = await getDoc(userRef);
    return snapshot.data() as UserProfile;
  }
};
