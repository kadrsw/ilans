import { useState } from 'react';
import { ref, push, serverTimestamp } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../contexts/AuthContext';

export function useJobScraper() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const startScraping = async () => {
    if (!user?.role === 'admin') {
      setError('Bu işlem için admin yetkisi gerekiyor');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Örnek iş ilanları
      const sampleJobs = [
        {
          title: 'Yazılım Geliştirici',
          company: 'Tech Company',
          description: 'React ve TypeScript deneyimi olan yazılım geliştirici aranıyor. Minimum 2 yıl deneyimli, takım çalışmasına yatkın, problem çözme becerileri yüksek adaylar başvurabilir.',
          location: 'İstanbul',
          type: 'Tam Zamanlı',
          category: 'teknoloji',
          subCategory: 'yazilim-gelistirici',
          contactEmail: user.email,
          userId: user.id,
          createdAt: serverTimestamp(),
          status: 'active',
          salary: '25.000₺ - 40.000₺'
        },
        {
          title: 'Gemi Personeli',
          company: 'Deniz Taşımacılık',
          description: 'Uluslararası yük ve yolcu gemilerimizde çalışacak; vasıflı veya vasıfsız, bay/bayan, 18-40 yaş arası, sabıka kaydı olmayan, seyahat engeli olmayan, en az ilkokul mezunu, denizcilik sektöründe kariyer hedefleyen personeller alınacaktır.',
          location: 'İstanbul',
          type: 'Tam Zamanlı',
          category: 'denizcilik',
          subCategory: 'gemi-kaptani',
          contactEmail: user.email,
          userId: user.id,
          createdAt: serverTimestamp(),
          status: 'active',
          salary: '20.000₺ - 30.000₺'
        },
        {
          title: 'Satış Danışmanı',
          company: 'Retail Group',
          description: 'Mağazamızda görevlendirilmek üzere satış danışmanları arıyoruz. Müşteri ilişkileri konusunda deneyimli, prezentabl, ikna kabiliyeti yüksek adaylar başvurabilir.',
          location: 'Ankara',
          type: 'Tam Zamanlı',
          category: 'ticaret',
          subCategory: 'satis-temsilcisi',
          contactEmail: user.email,
          userId: user.id,
          createdAt: serverTimestamp(),
          status: 'active',
          salary: '12.000₺ - 15.000₺'
        }
      ];

      const jobsRef = ref(db, 'jobs');
      
      // İlanları ekle
      for (const job of sampleJobs) {
        await push(jobsRef, job);
      }
      
      return true;
    } catch (err) {
      console.error('İş ilanı ekleme hatası:', err);
      setError('İş ilanları eklenirken bir hata oluştu');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startScraping,
    isLoading,
    error
  };
}