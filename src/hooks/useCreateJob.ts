import { useState } from 'react';
import { ref, push, serverTimestamp, query, orderByChild, equalTo, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../contexts/AuthContext';
import { generateMetaTags } from '../utils/seoUtils';
import { onJobAdded } from '../services/sitemapService';
import toast from 'react-hot-toast';
import type { JobFormData } from '../types';

export function useCreateJob() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const createJob = async (data: JobFormData) => {
    if (!user) {
      setError('Lütfen giriş yapın');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check for duplicate title
      const jobsRef = ref(db, 'jobs');
      const titleQuery = query(
        jobsRef,
        orderByChild('title'),
        equalTo(data.title)
      );
      
      const snapshot = await get(titleQuery);
      if (snapshot.exists()) {
        setError('Bu başlıkta bir ilan zaten mevcut');
        toast.error('Bu başlıkta bir ilan zaten mevcut');
        return false;
      }

      // Create job data for Firebase with serverTimestamp
      const jobData = {
        ...data,
        userId: user.id,
        createdAt: serverTimestamp(),
        status: 'active'
      };

      const newJobRef = await push(jobsRef, jobData);

      // Create a separate job data object for meta tags with current timestamp
      const metaJobData = {
        ...jobData,
        id: newJobRef.key,
        createdAt: Date.now() // Use current timestamp for meta tags
      };

      // Generate meta tags with the current timestamp
      generateMetaTags({
        title: data.title,
        description: data.description.substring(0, 155),
        keywords: [data.category, data.type, data.location, 'iş ilanı', 'kariyer'],
        url: `/ilan/${newJobRef.key}`,
        jobData: metaJobData
      });

      // Sitemap'i güncelle ve arama motorlarına bildir
      try {
        await onJobAdded(metaJobData);
        console.log('Yeni ilan eklendi, sitemap güncellendi ve arama motorlarına bildirildi');
      } catch (sitemapError) {
        console.error('Sitemap güncelleme hatası:', sitemapError);
        // Sitemap hatası ana işlemi etkilemesin
      }

      toast.success('İlanınız başarıyla yayınlandı ve Google\'a gönderildi!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '8px',
        },
        icon: '✓'
      });

      return true;
    } catch (err) {
      console.error('İlan oluşturma hatası:', err);
      setError('İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      toast.error('İlan oluşturulurken bir hata oluştu');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createJob, isLoading, error };
}