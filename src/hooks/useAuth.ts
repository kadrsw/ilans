import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { ref, set, get, remove } from 'firebase/database';
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

  const deleteAccount = async () => {
    if (!user || !auth.currentUser) {
      throw new Error('Kullanıcı bulunamadı');
    }

    try {
      // Kullanıcının tüm ilanlarını sil
      const userJobsRef = ref(db, 'jobs');
      const snapshot = await get(userJobsRef);
      
      if (snapshot.exists()) {
        const jobs = snapshot.val();
        const deletePromises = [];
        
        Object.entries(jobs).forEach(([jobId, job]: [string, any]) => {
          if (job.userId === user.id) {
            deletePromises.push(remove(ref(db, `jobs/${jobId}`)));
          }
        });
        
        await Promise.all(deletePromises);
      }

      // Kullanıcı verilerini sil
      await remove(ref(db, `users/${user.id}`));
      await remove(ref(db, `favorites/${user.id}`));
      
      // Firebase Auth'dan kullanıcıyı sil
      await deleteUser(auth.currentUser);
      
      setUser(null);
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  };
  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    deleteAccount,
    isAdmin: user?.role === 'admin'
  };
}