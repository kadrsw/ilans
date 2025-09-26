import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, MapPin, Briefcase, Clock, DollarSign, X, RotateCcw } from 'lucide-react';
import { jobCategories } from '../../data/jobCategories';
import { turkishCities } from '../../data/turkishCities';

interface JobFiltersProps {
  filters: {
    searchTerm: string;
    category: string;
    subCategory: string;
    city: string;
    experienceLevel: string;
    sortBy: 'newest' | 'oldest';
  };
  onFilterChange: (filters: any) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  availableCategories?: Set<string>;
}

const experienceLevels = [
  { id: 'entry', name: 'Yeni Başlayan (0-1 Yıl)' },
  { id: 'junior', name: 'Junior (1-3 Yıl)' },
  { id: 'mid', name: 'Mid-Level (3-5 Yıl)' },
  { id: 'senior', name: 'Senior (5+ Yıl)' },
  { id: 'expert', name: 'Uzman (10+ Yıl)' }
];

export function JobFilters({ filters, onFilterChange, onClearFilters, hasActiveFilters, availableCategories }: JobFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCategory = jobCategories.find(c => c.id === filters?.category);

  return (
    <div id="filters" className="filter-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors touch-target"
        >
          <Filter className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-bold text-gray-900">Filtreler</h3>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors touch-target"
            title="Tüm filtreleri temizle"
          >
            <RotateCcw className="h-3 w-3" />
            Temizle
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs font-medium text-blue-800 mb-2">Aktif Filtreler:</div>
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                Arama: {filters.searchTerm}
                <button
                  onClick={() => onFilterChange({ searchTerm: '' })}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.city && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">
                Şehir: {filters.city}
                <button
                  onClick={() => onFilterChange({ city: '' })}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">
                Kategori: {jobCategories.find(c => c.id === filters.category)?.name}
                <button
                  onClick={() => onFilterChange({ category: '', subCategory: '' })}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filters Content */}
      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Category Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Briefcase className="h-4 w-4 text-red-600" />
              Kategori
            </label>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value, subCategory: '' })}
              className="form-input w-full"
            >
              <option value="">Tüm Kategoriler</option>
              {jobCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Category Filter */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Alt Kategori
              </label>
              <select
                value={filters.subCategory}
                onChange={(e) => onFilterChange({ subCategory: e.target.value })}
                className="form-input w-full"
              >
                <option value="">Tüm Alt Kategoriler</option>
                {selectedCategory.subCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* City Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <MapPin className="h-4 w-4 text-red-600" />
              Şehir
            </label>
            <select
              value={filters.city}
              onChange={(e) => onFilterChange({ city: e.target.value })}
              className="form-input w-full"
            >
              <option value="">Tüm Şehirler</option>
              {turkishCities.slice(0, 20).map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            
            {filters.city && (
              <p className="text-xs text-blue-600 mt-2">
                💡 İpucu: Seçilen şehirde ilan yoksa diğer şehirlerdeki benzer ilanlar gösterilir
              </p>
            )}
          </div>

          {/* Experience Level */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Clock className="h-4 w-4 text-red-600" />
              Deneyim Seviyesi
            </label>
            <select
              value={filters.experienceLevel}
              onChange={(e) => onFilterChange({ experienceLevel: e.target.value })}
              className="form-input w-full"
            >
              <option value="">Tümü</option>
              {experienceLevels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <DollarSign className="h-4 w-4 text-red-600" />
              Sıralama
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value })}
              className="form-input w-full"
            >
              <option value="newest">En Yeni İlanlar</option>
              <option value="oldest">En Eski İlanlar</option>
            </select>
          </div>

          {/* Popular Searches */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">🔥 Popüler Aramalar</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Mühendis', category: 'teknoloji' },
                { name: 'Garson', category: 'hizmet' },
                { name: 'Kurye', category: 'lojistik' },
                { name: 'Güvenlik', category: 'guvenlik' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => onFilterChange({ category: item.category })}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}