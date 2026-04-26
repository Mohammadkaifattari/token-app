import { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Sync with Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          lastLogin: serverTimestamp(),
        };

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            ...userData,
            createdAt: serverTimestamp(),
            role: 'user', // Default role
          });
        } else {
          await setDoc(userRef, userData, { merge: true });
        }

        setUser({ ...userData, ...(userSnap.exists() ? userSnap.data() : { role: 'user' }) });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Login Error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  return { user, loading, error, loginWithGoogle, logout };
};
