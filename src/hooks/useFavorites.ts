import { useState, useEffect } from 'react';
import { ref, set, get, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../contexts/AuthContext';
import type { JobListing } from '../types';

export function useFavorites() {
  const { user } = useAuthContext();
  const [favorites, setFavorites] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const favoritesRef = ref(db, `favorites/${user.id}`);
    
    const unsubscribe = get(favoritesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const favoritesData = snapshot.val();
        setFavorites(Object.values(favoritesData));
      }
      setLoading(false);
    });

    return () => {
      // Cleanup if needed
    };
  }, [user]);

  const addToFavorites = async (job: JobListing) => {
    if (!user) return false;

    try {
      const favoriteRef = ref(db, `favorites/${user.id}/${job.id}`);
      await set(favoriteRef, {
        ...job,
        addedAt: Date.now()
      });
      setFavorites([...favorites, job]);
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  };

  const removeFromFavorites = async (jobId: string) => {
    if (!user) return false;

    try {
      const favoriteRef = ref(db, `favorites/${user.id}/${jobId}`);
      await remove(favoriteRef);
      setFavorites(favorites.filter(job => job.id !== jobId));
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  };

  const isFavorite = (jobId: string) => {
    return favorites.some(job => job.id === jobId);
  };

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
}