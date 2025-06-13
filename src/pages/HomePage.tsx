import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SearchHero } from '../components/home/SearchHero';
import { JobList } from '../components/home/JobList';
import { JobFilters } from '../components/home/JobFilters';
import { FavoriteJobs } from '../components/home/FavoriteJobs';
import { useJobs } from '../hooks/useJobs';
import { useJobFilters } from '../hooks/useJobFilters';
import { jobCategories } from '../data/jobCategories';
import { useAuthContext } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';

export function HomePage() {
  const { user } = useAuthContext();
  const { pageNumber } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const { jobs, categories, loading, error } = useJobs(undefined, searchTerm);
  const { filters, updateFilters, filteredJobs } = useJobFilters(jobs);

  useEffect(() => {
    // Sayfa numarası değiştiğinde scroll pozisyonunu geri yükle
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    const previousPath = sessionStorage.getItem('previousPath');
    
    if (scrollPosition && previousPath && previousPath.includes(window.location.pathname)) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollPosition));
        sessionStorage.removeItem('scrollPosition');
        sessionStorage.removeItem('previousPath');
      }, 100);
    }
  }, [pageNumber]);

  const getCategoryName = (categoryId: string) => {
    const category = jobCategories.find(c => c.id === categoryId);
    return category ? `${category.name} İlanları` : 'Tüm İlanlar';
  };

  return (
    <div className="space-y-8">
      <SearchHero
        onSearch={setSearchTerm}
        onLocationChange={(city) => updateFilters({ city })}
        onCategorySelect={(category) => updateFilters({ category, subCategory: '' })}
        availableCategories={categories}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <JobFilters
            filters={filters}
            onFilterChange={updateFilters}
            availableCategories={categories}
          />

          {/* Favorites Section */}
          {user && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-blue-600" />
                <h2 className="font-medium">Favori İlanlarım</h2>
              </div>
              <FavoriteJobs />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {filters.category ? getCategoryName(filters.category) : 'Tüm İlanlar'}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <JobList jobs={filteredJobs} />
          )}
        </div>
      </div>
    </div>
  );
}