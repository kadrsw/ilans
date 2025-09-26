import React from 'react';
import { useParams } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useJobFilters } from '../hooks/useJobFilters';
import { JobList } from '../components/home/JobList';
import { JobFilters } from '../components/home/JobFilters';

export function LocationPage() {
  const { location, category } = useParams();

  // Fetch all jobs
  const { jobs, loading, error } = useJobs({ 
    categoryFilter: 'all',
    enableRealTime: true 
  });

  // Apply location and category filters
  const {
    filteredJobs,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    availableCategories
  } = useJobFilters(jobs, { 
    city: location?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || '',
    category: category || ''
  });
  
  const formattedLocation = location?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Lokasyon açıklamasını SEO dostu hale getir
  const getLocationDescription = () => {
    if (!location) return 'En güncel iş fırsatlarını keşfedin';
    
    if (location.includes('istanbul')) {
      return `İstanbul'da ücretsiz iş ilanı ver ve en güncel iş fırsatlarını keşfet. ${category ? category + ' alanında' : ''} tam zamanlı, part-time ve uzaktan çalışma imkanları.`;
    }
    
    if (location.includes('ankara')) {
      return `Ankara'da en güncel iş ilanları ve kariyer fırsatları. ${category ? category + ' sektöründe' : ''} binlerce açık pozisyon.`;
    }
    
    if (location.includes('izmir')) {
      return `İzmir'de iş arayanlar için güncel ilanlar. ${category ? category + ' alanında' : ''} profesyonel kariyer imkanları.`;
    }
    
    if (location.includes('antalya')) {
      return `Antalya'da uzaktan ve yerinde çalışma fırsatları. ${category ? category + ' sektöründe' : ''} en yeni iş ilanları.`;
    }
    
    return `${formattedLocation}'daki en güncel iş fırsatlarını keşfedin ${category ? '- ' + category + ' alanında' : ''}`;
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2" id="lokasyon-baslik">
          {formattedLocation} İş İlanları
          {category && ` - ${category.charAt(0).toUpperCase() + category.slice(1)}`}
        </h1>
        <p className="text-gray-600">
          {getLocationDescription()}
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