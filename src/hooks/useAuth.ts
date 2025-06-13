import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../lib/firebase';
import type { User } from '../types';

const ADMIN_EMAIL = 'acikadir1@gmail.com';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          // Eğer admin emaili ise ve rolü admin değilse güncelle
          if (firebaseUser.email === ADMIN_EMAIL && userData.role !== 'admin') {
            const updatedData = { ...userData, role: 'admin' };
            await set(userRef, updatedData);
            setUser(updatedData);
          } else {
            setUser(userData);
          }
        } else {
          // Yeni kullanıcı oluşturulduğunda admin kontrolü
          const isAdmin = firebaseUser.email === ADMIN_EMAIL;
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            createdAt: Date.now(),
            role: isAdmin ? 'admin' : 'user'
          };
          await set(userRef, userData);
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, phone?: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    const isAdmin = email === ADMIN_EMAIL;
    
    const userData: User = {
      id: firebaseUser.uid,
      email,
      phone,
      createdAt: Date.now(),
      role: isAdmin ? 'admin' : 'user'
    };
    
    await set(ref(db, `users/${firebaseUser.uid}`), userData);
    setUser(userData);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAdmin: user?.role === 'admin'
  };
}