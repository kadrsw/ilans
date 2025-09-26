import { useState } from 'react';
import { ref, remove, update, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { onJobUpdated, onJobDeleted } from '../services/sitemapService';
import { toast } from 'react-hot-toast';

export function useJobActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteJob = async (jobId: string) => {
    try {
      setIsDeleting(true);
      setError(null);
      
      console.log('İlan siliniyor:', jobId);
      
      // Önce mevcut ilan verilerini al
      const jobRef = ref(db, `jobs/${jobId}`);
      const snapshot = await get(jobRef);
      
      if (!snapshot.exists()) {
        throw new Error('İlan bulunamadı');
      }
      
      const existingJobData = snapshot.val();
      
      // Mevcut verilerle birleştirerek güncelle
      const updatedJobData = {
        ...existingJobData,
        // Ensure all required fields have non-falsy values with fallbacks
        title: existingJobData.title || 'Başlık Yok',
        company: existingJobData.company || 'Şirket Belirtilmemiş',
        description: existingJobData.description || 'Açıklama Yok',
        location: existingJobData.location || 'Konum Belirtilmemiş',
        type: existingJobData.type || 'Belirtilmemiş',
        category: existingJobData.category || existingJobData.subCategory || 'Diğer',
        userId: existingJobData.userId || 'unknown',
        createdAt: existingJobData.createdAt || Date.now(),
        status: 'deleted',
        updatedAt: Date.now()
      };
      
      await update(jobRef, updatedJobData);
      
      // Sitemap'i güncelle ve Google'a bildir
      try {
        console.log('İlan silindi, sitemap güncelleniyor...');
        await onJobDeleted(jobId);
        console.log('✅ Sitemap güncellendi (ilan silme)');
      } catch (sitemapError) {
        console.error('❌ Sitemap güncelleme hatası (silme):', sitemapError);
      }

      toast.success('İlan başarıyla silindi');
      
      return true;
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('İlan silinirken bir hata oluştu');
      toast.error('İlan silinirken bir hata oluştu');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const updateJob = async (jobId: string, data: any) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // Önce mevcut ilan verilerini al
      const jobRef = ref(db, `jobs/${jobId}`);
      const snapshot = await get(jobRef);
      
      if (!snapshot.exists()) {
        throw new Error('İlan bulunamadı');
      }
      
      const existingJobData = snapshot.val();
      
      // Mevcut verilerle birleştirerek güncelle
      const updatedData = {
        ...existingJobData,
        ...data,
        updatedAt: Date.now()
      };
      
      // Tüm zorunlu alanların var olduğundan emin ol
      if (!updatedData.title || !updatedData.company || 
          !updatedData.description || !updatedData.location || 
          !updatedData.type || !updatedData.category || 
          !updatedData.userId || !updatedData.createdAt) {
        console.error('Eksik zorunlu alanlar:', updatedData);
        throw new Error('İlan güncelleme için zorunlu alanlar eksik');
      }
      
      console.log('İlan güncelleniyor:', jobId);
      await update(jobRef, updatedData);
      
      // Sitemap'i güncelle ve Google'a bildir
      try {
        console.log('İlan güncellendi, sitemap güncelleniyor...');
        await onJobUpdated({ id: jobId, ...updatedData });
        console.log('✅ Sitemap güncellendi (ilan güncelleme)');
      } catch (sitemapError) {
        console.error('❌ Sitemap güncelleme hatası (güncelleme):', sitemapError);
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