import { useState, useEffect, useMemo } from 'react';
import {
  ref,
  query,
  orderByChild,
  onValue,
  equalTo,
  get,
  set,
  limitToLast,
  endAt,
} from 'firebase/database';
import { db } from '../lib/firebase';
import type { JobListing } from '../types';

interface UseJobsOptions {
  categoryFilter?: string;
  searchTerm?: string;
  limit?: number;
  enableRealTime?: boolean;
}

export function useJobs(options: UseJobsOptions = {}) {
  const { 
    categoryFilter = 'all', 
    searchTerm = '', 
    limit = 20,
    enableRealTime = true 
  } = options;

  // State'ler - sıra önemli, değiştirmeyin!
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [cachedJobs] = useState(() => new Map<string, JobListing>());
  const [refreshKey, setRefreshKey] = useState(0);

  // Ana veri yükleme effect'i
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadInitialJobs = async () => {
      setLoading(true);
      setError(null);
      setJobs([]);
      setLastKey(null);
      setHasMore(true);
      
      try {
        const jobsRef = ref(db, 'jobs');
        
        // Query oluştur - EN YENİ İLANLARI AL
        let jobsQuery = query(
          jobsRef,
          orderByChild('createdAt'),
          limitToLast(limit) // ✅ Son 20 = en yeni
        );

        if (categoryFilter && categoryFilter !== 'all') {
          jobsQuery = query(
            jobsRef,
            orderByChild('category'),
            equalTo(categoryFilter),
            limitToLast(limit) // ✅ Son 20 = en yeni
          );
        }

        if (enableRealTime) {
          // Real-time listener
          unsubscribe = onValue(jobsQuery, (snapshot) => {
            processSnapshot(snapshot, true);
          }, (error) => {
            console.error('Real-time listener hatası:', error);
            setError('Veri dinleme hatası');
            setLoading(false);
          });
        } else {
          // Tek seferlik veri çekme
          const snapshot = await get(jobsQuery);
          processSnapshot(snapshot, true);
        }

      } catch (error) {
        console.error('İlanlar yüklenirken hata:', error);
        setError('İlanlar yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    // Snapshot işleme fonksiyonu
    const processSnapshot = (snapshot: any, isInitial: boolean) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const jobsList: JobListing[] = [];
        const categorySet = new Set(categories);

        let newLastKey: string | null = null;

        // Firebase'den gelen veriyi array'e çevir ve tarihe göre sırala
        const dataEntries = Object.entries(data).sort(([,a], [,b]) => {
          const aTime = (a as any).createdAt || 0;
          const bTime = (b as any).createdAt || 0;
          return bTime - aTime; // Yeniden eskiye
        });

        dataEntries.forEach(([key, value]) => {
          const job = value as Omit<JobListing, 'id'>;
          const jobWithId = { id: key, ...job } as JobListing;

          if (jobWithId.status === 'active') {
            // Varsayılan değerler
            if (!jobWithId.title) jobWithId.title = 'İlan Başlığı';
            if (!jobWithId.description) jobWithId.description = 'Açıklama bulunmuyor';
            if (!jobWithId.company) jobWithId.company = 'Şirket Adı';
            if (!jobWithId.location) jobWithId.location = 'Lokasyon';
            
            if (!jobWithId.createdAt || isNaN(jobWithId.createdAt) || jobWithId.createdAt <= 0) {
              jobWithId.createdAt = Date.now();
            }
            
            if (!jobWithId.updatedAt || isNaN(jobWithId.updatedAt) || jobWithId.updatedAt <= 0) {
              jobWithId.updatedAt = jobWithId.createdAt;
            }

            // Cache'e ekle
            cachedJobs.set(key, jobWithId);
            jobsList.push(jobWithId);
            categorySet.add(jobWithId.category);
            newLastKey = key;
          }
        });

        // Premium ilanları önce sırala
        const sortedJobs = jobsList.sort((a, b) => {
          const aIsPremium = a.isPremium && a.premiumEndDate && a.premiumEndDate > Date.now();
          const bIsPremium = b.isPremium && b.premiumEndDate && b.premiumEndDate > Date.now();
          
          if (aIsPremium && !bIsPremium) return -1;
          if (!aIsPremium && bIsPremium) return 1;
          
          return (b.createdAt || 0) - (a.createdAt || 0);
        });

        // State güncellemeleri
        setCategories(Array.from(categorySet));
        setLastKey(newLastKey);
        setHasMore(sortedJobs.length === limit);

        if (isInitial) {
          setJobs(sortedJobs);
        } else {
          setJobs(prevJobs => [...prevJobs, ...sortedJobs]);
        }
        
        console.log(`✅ ${sortedJobs.length} ilan yüklendi`);
      } else {
        setHasMore(false);
      }

      setLoading(false);
      setLoadingMore(false);
    };

    loadInitialJobs();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [categoryFilter, limit, enableRealTime, refreshKey]);

  // Daha fazla ilan yükleme fonksiyonu
  const loadMoreJobs = async () => {
    if (!hasMore || loadingMore || !lastKey) return;

    setLoadingMore(true);
    
    try {
      const jobsRef = ref(db, 'jobs');
      
      // Son yüklenen ilan tarihini al
      const lastJob = cachedJobs.get(lastKey);
      const lastTimestamp = lastJob?.createdAt || Date.now();
      
      let jobsQuery = query(
        jobsRef,
        orderByChild('createdAt'),
        endAt(lastTimestamp - 1), // Son yüklenen ilandan önceki ilanlar
        limitToLast(limit) // ✅ En yeni limit adet al
      );

      if (categoryFilter && categoryFilter !== 'all') {
        jobsQuery = query(
          jobsRef,
          orderByChild('category'),
          equalTo(categoryFilter),
          limitToLast(limit) // ✅ En yeni limit adet al
        );
      }

      const snapshot = await get(jobsQuery);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const jobsList: JobListing[] = [];
        let newLastKey: string | null = null;

        // Verileri tarihe göre sırala (yeniden eskiye)
        const dataEntries = Object.entries(data)
          .filter(([key]) => !cachedJobs.has(key)) // Zaten cache'de olanları filtrele
          .sort(([,a], [,b]) => {
            const aTime = (a as any).createdAt || 0;
            const bTime = (b as any).createdAt || 0;
            return bTime - aTime;
          });

        dataEntries.forEach(([key, value]) => {
          const job = value as Omit<JobListing, 'id'>;
          const jobWithId = { id: key, ...job } as JobListing;

          if (jobWithId.status === 'active') {
            if (!jobWithId.title) jobWithId.title = 'İlan Başlığı';
            if (!jobWithId.description) jobWithId.description = 'Açıklama bulunmuyor';
            if (!jobWithId.company) jobWithId.company = 'Şirket Adı';
            if (!jobWithId.location) jobWithId.location = 'Lokasyon';
            
            if (!jobWithId.createdAt || isNaN(jobWithId.createdAt) || jobWithId.createdAt <= 0) {
              jobWithId.createdAt = Date.now();
            }
            
            if (!jobWithId.updatedAt || isNaN(jobWithId.updatedAt) || jobWithId.updatedAt <= 0) {
              jobWithId.updatedAt = jobWithId.createdAt;
            }

            cachedJobs.set(key, jobWithId);
            jobsList.push(jobWithId);
            newLastKey = key;
          }
        });

        const sortedJobs = jobsList.sort((a, b) => {
          const aIsPremium = a.isPremium && a.premiumEndDate && a.premiumEndDate > Date.now();
          const bIsPremium = b.isPremium && b.premiumEndDate && b.premiumEndDate > Date.now();
          
          if (aIsPremium && !bIsPremium) return -1;
          if (!aIsPremium && bIsPremium) return 1;
          
          return (b.createdAt || 0) - (a.createdAt || 0);
        });

        setJobs(prevJobs => [...prevJobs, ...sortedJobs]);
        setLastKey(newLastKey);
        setHasMore(sortedJobs.length === limit);
      } else {
        setHasMore(false);
      }

    } catch (error) {
      console.error('Daha fazla ilan yüklenirken hata:', error);
      setError('Daha fazla ilan yüklenirken bir hata oluştu');
    } finally {
      setLoadingMore(false);
    }
  };

  // Veri yenileme fonksiyonu
  const refetchJobs = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Arama filtresi - useMemo ile optimize edilmiş
  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobs;

    return jobs.filter(job => 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobs, searchTerm]);

  return {
    jobs: filteredJobs,
    allJobs: jobs,
    categories,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMoreJobs,
    refetchJobs,
    cachedJobsCount: cachedJobs.size
  };
}