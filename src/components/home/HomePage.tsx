import React, { useState } from 'react';
import { SearchHero } from '../components/home/SearchHero';
import { JobList } from '../components/home/JobList';
import { JobFilters } from '../components/home/JobFilters';
import { FavoriteJobs } from '../components/home/FavoriteJobs';
import { useJobs } from '../hooks/useJobs';
import { useJobFilters } from '../hooks/useJobFilters';
import { jobCategories } from '../data/jobCategories';
import { useAuthContext } from '../contexts/AuthContext';
import { Heart, Filter } from 'lucide-react';

export function HomePage() {
  const { user } = useAuthContext();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { jobs, categories, loading, error } = useJobs(undefined, searchTerm);
  const { filters, updateFilters, filteredJobs } = useJobFilters(jobs);

  const getCategoryName = (categoryId: string) => {
    const category = jobCategories.find(c => c.id === categoryId);
    return category ? `${category.name} İlanları` : 'Tüm İlanlar';
  };

  return (
    <div className="space-y-4">
      <SearchHero
        onSearch={setSearchTerm}
        onLocationChange={(city) => updateFilters({ city })}
        onCategorySelect={(category) => updateFilters({ category, subCategory: '' })}
        availableCategories={categories}
      />

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-center gap-2 p-2 bg-white rounded-lg shadow-sm text-gray-700"
        >
          <Filter className="h-5 w-5" />
          <span>Filtreleri {showFilters ? 'Gizle' : 'Göster'}</span>
        </button>

        {/* Left Sidebar */}
        <div className={`lg:col-span-3 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
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
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold">
              {filters.category ? getCategoryName(filters.category) : 'Tüm İlanlar'}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredJobs.length} ilan
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Bu kriterlere uygun ilan bulunamadı
            </div>
          ) : (
            <JobList jobs={filteredJobs} />
          )}
        </div>
      </div>
    </div>
  );
}