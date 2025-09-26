import { useState, useCallback, useEffect } from 'react';
import type { JobListing } from '../types';

interface JobFilters {
  searchTerm: string;
  category: string;
  subCategory: string;
  city: string;
  experienceLevel: string;
  sortBy: 'newest' | 'oldest';
}

export function useJobFilters(jobs: JobListing[]) {
  // Initialize filters with stored values if they exist
  const [filters, setFilters] = useState<JobFilters>(() => {
    const storedFilters = sessionStorage.getItem('jobFilters');
    return storedFilters ? JSON.parse(storedFilters) : {
      searchTerm: '',
      category: '',
      subCategory: '',
      city: '',
      experienceLevel: '',
      sortBy: 'newest'
    };
  });

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('jobFilters', JSON.stringify(filters));
  }, [filters]);

  const filteredJobs = useCallback(() => {
    console.log("🔍 Filtreleme ve sıralama başlıyor, toplam ilan sayısı:", jobs.length);
    
    // Önce filtreleme yap
    const filtered = jobs.filter(job => {
      const matchesSearch = !filters.searchTerm || 
        job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesCategory = !filters.category || job.category === filters.category;
      const matchesSubCategory = !filters.subCategory || job.subCategory === filters.subCategory;
      
      // Şehir filtresi - daha esnek eşleştirme
      let matchesCity = true;
      if (filters.city) {
        const cityFilter = filters.city.toLowerCase();
        const jobLocation = job.location.toLowerCase();
        
        // Tam eşleşme veya içerik eşleşmesi
        matchesCity = jobLocation.includes(cityFilter) || 
                     cityFilter.includes(jobLocation) ||
                     jobLocation === cityFilter;
      }
      
      const matchesExperience = !filters.experienceLevel || job.experienceLevel === filters.experienceLevel;

      return matchesSearch && matchesCategory && matchesSubCategory && matchesCity && matchesExperience;
    });
    
    console.log("🔍 Filtreleme sonrası ilan sayısı:", filtered.length);
    
    // Eğer şehir filtresi var ama sonuç yoksa, diğer şehirlerdeki benzer ilanları göster
    if (filters.city && filtered.length === 0) {
      console.log("🏙️ Seçilen şehirde ilan bulunamadı, benzer ilanlar gösteriliyor...");
      
      const similarJobs = jobs.filter(job => {
        const matchesSearch = !filters.searchTerm || 
          job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(filters.searchTerm.toLowerCase());

        const matchesCategory = !filters.category || job.category === filters.category;
        const matchesSubCategory = !filters.subCategory || job.subCategory === filters.subCategory;
        const matchesExperience = !filters.experienceLevel || job.experienceLevel === filters.experienceLevel;

        return matchesSearch && matchesCategory && matchesSubCategory && matchesExperience;
      });
      
      console.log("🔍 Benzer ilanlar bulundu:", similarJobs.length);
      return similarJobs.sort((a, b) => {
        const timeA = a.createdAt || 0; 
        const timeB = b.createdAt || 0;
        
        if (filters.sortBy === 'newest') {
          return timeB - timeA;
        } else {
          return timeA - timeB;
        }
      });
    }
    
    // Sonra sıralama yap - SADECE createdAt TARİHİNE GÖRE
    const sorted = [...filtered].sort((a, b) => {
      // Kesinlikle sadece createdAt kullan, başka hiçbir alan kullanma
      const timeA = a.createdAt || 0; 
      const timeB = b.createdAt || 0;
      
      if (filters.sortBy === 'newest') {
        // AZALAN SIRALAMA: En yeni tarih önce (büyük timestamp önce)
        return timeB - timeA;
      } else {
        // ARTAN SIRALAMA: En eski tarih önce (küçük timestamp önce)
        return timeA - timeB;
      }
    });
    
    // Sıralama sonrası ilk 5 ilanı kontrol et
    console.log("🔍 Sıralama sonrası ilk 5 ilan:");
    sorted.slice(0, 5).forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - ${new Date(job.createdAt).toLocaleString('tr-TR')} (${job.createdAt})`);
    });
    
    return sorted;
  }, [jobs, filters]);

  const updateFilters = (newFilters: Partial<JobFilters>) => {
    console.log("🔄 Filtreler güncelleniyor:", newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    console.log("🧹 Tüm filtreler temizleniyor");
    setFilters({
      searchTerm: '',
      category: '',
      subCategory: '',
      city: '',
      experienceLevel: '',
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = () => {
    return filters.searchTerm || filters.category || filters.subCategory || 
           filters.city || filters.experienceLevel;
  };
  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    filteredJobs: filteredJobs(),
    isShowingSimilar: filters.city && filteredJobs().length > 0 && 
                     !filteredJobs().some(job => 
                       job.location.toLowerCase().includes(filters.city.toLowerCase())
                     )
  };
}