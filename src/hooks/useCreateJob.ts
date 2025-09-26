import { useState } from 'react';
import { ref, push, query, orderByChild, equalTo, get } from 'firebase/database';
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

      console.log('🚀 İlan oluşturma başladı:', {
        title: data.title,
        category: data.category,
        subCategory: data.subCategory,
        company: data.company,
        location: data.location
      });

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

      // YENİ İLAN EN ÜSTTE GÖRÜNMEK İÇİN TAM GÜNCEL TIMESTAMP KULLAN
      // Şu anki zamanı milisaniye cinsinden al
      const now = Date.now();

      // Timestamp'in kesinlikle geçerli olduğundan emin ol
      if (isNaN(now) || now <= 0) {
        throw new Error('Geçersiz timestamp oluşturuldu');
      }

      // Create job data for Firebase
      const jobData = {
        ...data,
        userId: user.id,
        createdAt: now, // TAM GÜNCEL TIMESTAMP - EN SON PAYLAŞILAN İLAN
        updatedAt: now, // İlk oluşturulduğunda updatedAt = createdAt
        status: 'active'
      };

      console.log('🚀 Yeni ilan Firebase\'e kaydediliyor (EN SON TARİH VE SAAT):', {
        title: data.title,
        timestamp: now,
        date: new Date(now).toLocaleString('tr-TR'),
        category: data.category,
        subCategory: data.subCategory,
        isValidTimestamp: !isNaN(now) && now > 0,
        willBeFirst: true // Bu ilan en üstte olacak
      });

      const newJobRef = await push(jobsRef, jobData);
      const jobId = newJobRef.key;

      if (!jobId) {
        throw new Error('İlan ID\'si oluşturulamadı');
      }

      console.log('✅ İlan başarıyla Firebase\'e kaydedildi (EN ÜSTTE OLACAK):', {
        id: jobId,
        title: data.title,
        timestamp: now,
        date: new Date(now).toLocaleString('tr-TR')
      });

      // Create a separate job data object for meta tags
      const metaJobData = {
        ...jobData,
        id: jobId,
      };

      // Generate meta tags
      generateMetaTags({
        title: data.title,
        description: data.description.substring(0, 155),
        keywords: [data.category, data.type, data.location, 'iş ilanı', 'kariyer'],
        url: `/ilan/${jobId}`,
        jobData: metaJobData
      });

      // SITEMAP'İ HEMEN GÜNCELLE VE GOOGLE'A BİLDİR
      try {
        console.log('Yeni ilan eklendi, sitemap güncelleniyor...');
        await onJobAdded(metaJobData);
        console.log('✅ Sitemap güncellendi ve Google\'a bildirildi');
        
        // Ek olarak manuel ping gönder
        const sitemapUrl = 'https://isilanlarim.org/sitemap-jobs.xml';
        const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        
        fetch(googlePingUrl, { method: 'GET', mode: 'no-cors' })
          .then(() => console.log('✅ Google\'a ek ping gönderildi'))
          .catch(err => console.log('⚠️ Google ping hatası:', err));
          
      } catch (sitemapError) {
        console.error('❌ Sitemap güncelleme hatası:', sitemapError);
        // Sitemap hatası ana işlemi etkilemesin
      }

      // BAŞARI MESAJI - YENİ İLAN EN ÜSTTE OLACAK
      toast.success('🎉 İlanınız yayınlandı ve en üstte görünecek!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500'
        },
        icon: '🚀'
      });

      return true;
    } catch (err) {
      console.error('❌ İlan oluşturma hatası:', err);
      setError('İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      toast.error('❌ İlan oluşturulurken bir hata oluştu');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createJob, isLoading, error };
}