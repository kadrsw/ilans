import { ref, get, set, query, orderByChild, startAt, endAt } from 'firebase/database';
import { db } from '../lib/firebase';

interface ScrapingStatus {
  lastRun: number;
  isRunning: boolean;
  error?: string;
}

export async function getScrapingStatus(): Promise<ScrapingStatus | null> {
  try {
    const statusRef = ref(db, 'admin_settings/scraping_status');
    const snapshot = await get(statusRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // Varsayılan durum
      const defaultStatus: ScrapingStatus = {
        lastRun: Date.now() - (24 * 60 * 60 * 1000), // 1 gün önce
        isRunning: false
      };
      
      await set(statusRef, defaultStatus);
      return defaultStatus;
    }
  } catch (error) {
    console.error('Durum kontrolü hatası:', error);
    return null;
  }
}

export async function updateScrapingStatus(status: Partial<ScrapingStatus>): Promise<boolean> {
  try {
    const statusRef = ref(db, 'admin_settings/scraping_status');
    const currentSnapshot = await get(statusRef);
    
    let currentStatus: ScrapingStatus;
    
    if (currentSnapshot.exists()) {
      currentStatus = currentSnapshot.val();
    } else {
      currentStatus = {
        lastRun: Date.now() - (24 * 60 * 60 * 1000),
        isRunning: false
      };
    }
    
    // Durumu güncelle
    const updatedStatus = {
      ...currentStatus,
      ...status
    };
    
    await set(statusRef, updatedStatus);
    return true;
  } catch (error) {
    console.error('Durum güncelleme hatası:', error);
    return false;
  }
}

export async function checkNewJobs(): Promise<number> {
  try {
    const oneHourAgo = Date.now() - (60 * 60 * 1000); // Son 1 saat
    
    const jobsRef = ref(db, 'jobs');
    const recentJobsQuery = query(
      jobsRef,
      orderByChild('createdAt'),
      startAt(oneHourAgo)
    );
    
    const snapshot = await get(recentJobsQuery);
    
    if (snapshot.exists()) {
      return Object.keys(snapshot.val()).length;
    }
    
    return 0;
  } catch (error) {
    console.error('Yeni iş kontrolü hatası:', error);
    return 0;
  }
}

export async function startScraping(): Promise<boolean> {
  try {
    // Scraping durumunu güncelle
    await updateScrapingStatus({
      isRunning: true,
      error: undefined
    });
    
    // Burada gerçek scraping işlemi yapılacak
    // Şimdilik sadece durum güncellemesi yapıyoruz
    
    // İşlem tamamlandı
    await updateScrapingStatus({
      lastRun: Date.now(),
      isRunning: false
    });
    
    return true;
  } catch (error) {
    console.error('Scraping hatası:', error);
    
    // Hata durumunu güncelle
    await updateScrapingStatus({
      isRunning: false,
      error: 'Scraping işlemi sırasında bir hata oluştu'
    });
    
    return false;
  }
}