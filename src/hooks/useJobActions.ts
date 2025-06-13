import { useState } from 'react';
import { ref, remove, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { onJobUpdated, onJobDeleted } from '../services/sitemapService';

export function useJobActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteJob = async (jobId: string) => {
    try {
      setIsDeleting(true);
      setError(null);
      await remove(ref(db, `jobs/${jobId}`));
      
      // Sitemap'i güncelle
      try {
        await onJobDeleted(jobId);
        console.log('İlan silindi, sitemap güncellendi');
      } catch (sitemapError) {
        console.error('Sitemap güncelleme hatası:', sitemapError);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('İlan silinirken bir hata oluştu');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const updateJob = async (jobId: string, data: any) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedData = {
        ...data,
        updatedAt: Date.now()
      };
      
      await update(ref(db, `jobs/${jobId}`), updatedData);
      
      // Sitemap'i güncelle
      try {
        await onJobUpdated({ id: jobId, ...updatedData });
        console.log('İlan güncellendi, sitemap güncellendi');
      } catch (sitemapError) {
        console.error('Sitemap güncelleme hatası:', sitemapError);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating job:', err);
      setError('İlan güncellenirken bir hata oluştu');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    deleteJob,
    updateJob,
    isDeleting,
    isUpdating,
    error
  };
}