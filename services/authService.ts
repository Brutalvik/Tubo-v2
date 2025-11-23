import { auth, db, googleProvider, appleProvider } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export const authService = {
  // Login with Email/Password
  login: async (email: string, password: string): Promise<UserProfile> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Fetch user profile from Firestore
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      throw new Error("User profile not found in database.");
    }
  },

  // Register new account
  register: async (firstName: string, lastName: string, email: string, password: string): Promise<UserProfile> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const displayName = `${firstName} ${lastName}`;

    // Update Auth Profile
    await updateFirebaseProfile(user, { displayName });

    const newUserProfile: UserProfile = {
      uid: user.uid,
      displayName,
      email: email,
      photoURL: "",
      role: 'GUEST',
      currency: 'USD',
      isHostRegistered: false,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    // Save to Firestore
    await setDoc(doc(db, "users", user.uid), newUserProfile);

    return newUserProfile;
  },

  // Social Login (Google/Apple)
  socialLogin: async (providerName: 'google' | 'apple'): Promise<UserProfile> => {
    const provider = providerName === 'google' ? googleProvider : appleProvider;
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      // Create new social user in Firestore if they don't exist
      const newUserProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || "User",
        email: user.email || "",
        photoURL: user.photoURL || "",
        role: 'GUEST',
        currency: 'USD',
        isHostRegistered: false,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
      await setDoc(userRef, newUserProfile);
      return newUserProfile;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  // Update Profile
  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user logged in");

    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, updates);

    // If photoURL is updated, sync it to Firebase Auth object too for consistency
    if (updates.photoURL) {
      await updateFirebaseProfile(currentUser, { photoURL: updates.photoURL });
    }

    // Return the updated profile
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.data() as UserProfile;
  }
};