import React, { useState } from 'react';
import { JobSearchInput } from './JobSearchInput';
import { CategorySearch } from './CategorySearch';
import { LocationSearch } from './LocationSearch';
import { Button } from '../ui/Button';
import { Filter, FileText, TrendingUp, MapPin, Briefcase } from 'lucide-react';

interface SearchHeroProps {
  onSearch: (search: string) => void;
  onLocationChange: (location: string) => void;
  onCategorySelect: (categoryId: string) => void;
  availableCategories?: Set<string>;
}

export function SearchHero({ 
  onSearch, 
  onLocationChange, 
  onCategorySelect,
  availableCategories 
}: SearchHeroProps) {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 lg:py-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Hero Content */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Türkiye'nin En Güncel
            <span className="block text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              İş İlanları 2025
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-2 max-w-3xl mx-auto">
            İstanbul, Ankara, İzmir ve tüm illerde binlerce iş fırsatı
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-blue-200 mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Günlük Güncelleme</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>81 İl</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>20+ Sektör</span>
            </div>
          </div>
        </div>
        
        {/* Search Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-strong max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="relative">
              <JobSearchInput 
                onSearch={onSearch} 
                onFocus={() => setShowCategories(true)}
              />
              {showCategories && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-strong border border-gray-200 p-3">
                  <CategorySearch 
                    onCategorySelect={(category) => {
                      onCategorySelect(category);
                      setShowCategories(false);
                    }}
                    availableCategories={availableCategories}
                  />
                </div>
              )}
            </div>
            <LocationSearch onLocationChange={onLocationChange} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              onClick={() => {
                const filtersElement = document.getElementById('filters');
                if (filtersElement) {
                  filtersElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Filter className="h-4 w-4" />
              Detaylı Filtreler
            </Button>
            <Button
              onClick={() => window.location.href = '/cv-olustur'}
              className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <FileText className="h-4 w-4" />
              Ücretsiz CV Oluştur
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-white">1000+</div>
            <div className="text-sm text-blue-200">Aktif İlan</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-white">81</div>
            <div className="text-sm text-blue-200">İl</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-white">20+</div>
            <div className="text-sm text-blue-200">Sektör</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-white">7/24</div>
            <div className="text-sm text-blue-200">Destek</div>
          </div>
        </div>
      </div>
    </section>
  );
}