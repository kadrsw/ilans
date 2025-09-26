import React from 'react';
import { useParams } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useJobFilters } from '../hooks/useJobFilters';
import { JobList } from '../components/home/JobList';
import { JobFilters } from '../components/home/JobFilters';

export function CategoryPage() {
  const { category } = useParams();

  // Fetch jobs with category filter
  const { jobs, loading, error } = useJobs({ 
    categoryFilter: category || 'all',
    enableRealTime: true 
  });

  // Apply additional filters
  const {
    filteredJobs,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    availableCategories
  } = useJobFilters(jobs, { category: category || '' });

  // Kategori adını SEO dostu hale getir
  const getCategoryTitle = () => {
    if (!category) return 'İş İlanları';
    
    switch(category) {
      case 'teknoloji': return 'Mühendis ve Teknoloji İş İlanları';
      case 'hizmet': return 'Garson, Aşçı ve Hizmet Sektörü İş İlanları';
      case 'lojistik': return 'Kurye ve Lojistik İş İlanları';
      case 'turizm': return 'Resepsiyon Görevlisi ve Turizm İş İlanları';
      case 'guvenlik': return 'Özel Güvenlik İş İlanları';
      default: return `${category?.charAt(0).toUpperCase() + category?.slice(1)} İş İlanları`;
    }
  };

  // Kategori açıklamasını SEO dostu hale getir
  const getCategoryDescription = () => {
    if (!category) return 'En güncel iş fırsatlarını keşfedin';
    
    switch(category) {
      case 'teknoloji': return 'Mühendis, yazılım geliştirici ve teknoloji pozisyonları için güncel iş ilanları';
      case 'hizmet': return 'Garson, aşçı yardımcısı ve hizmet sektörü için en yeni iş fırsatları';
      case 'lojistik': return 'Kurye, şoför ve lojistik alanında kariyer fırsatları';
      case 'turizm': return 'Resepsiyon görevlisi ve turizm sektöründe çalışmak isteyenler için iş ilanları';
      case 'guvenlik': return 'Özel güvenlik görevlisi pozisyonları ve güvenlik sektörü iş fırsatları';
      default: return `En güncel ${category} pozisyonlarını keşfedin`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">Bir hata oluştu: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2" id="kategori-baslik">
          {getCategoryTitle()}
        </h1>
        <p className="text-gray-600">
          {getCategoryDescription()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <JobFilters
            filters={filters}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            availableCategories={availableCategories}
          />
        </div>
        <div className="lg:col-span-3">
          <JobList jobs={filteredJobs} />
        </div>
      </div>
    </div>
  );
}