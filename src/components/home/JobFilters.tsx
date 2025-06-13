import React, { useState } from 'react';
import { Filter, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { jobCategories } from '../../data/jobCategories';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface JobFiltersProps {
  onFilterChange: (filters: any) => void;
  filters: {
    category: string;
    subCategory: string;
    experienceLevel: string;
    sortBy: 'newest' | 'oldest';
  };
}

const experienceLevels = [
  { id: 'entry', name: 'Yeni Başlayan' },
  { id: 'junior', name: 'Junior (1-3 Yıl)' },
  { id: 'mid', name: 'Mid-Level (3-5 Yıl)' },
  { id: 'senior', name: 'Senior (5+ Yıl)' }
];

export function JobFilters({ onFilterChange, filters }: JobFiltersProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCategory = jobCategories.find(c => c.id === filters.category);

  return (
    <div id="filters" className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2 text-gray-700">
          <Filter className="h-5 w-5" />
          <h3 className="font-medium">Filtreler</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="p-4 space-y-6 border-t">
          {/* CV Oluştur */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">CV Oluştur</h3>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Profesyonel CV'nizi oluşturun ve iş başvurularınızda kullanın
            </p>
            <Button
              onClick={() => navigate('/cv-olustur')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              CV Oluşturmaya Başla
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ana Kategori
              </label>
              <select
                value={filters.category}
                onChange={(e) => onFilterChange({ category: e.target.value, subCategory: '' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Tüm Kategoriler</option>
                {jobCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Kategori
                </label>
                <select
                  value={filters.subCategory}
                  onChange={(e) => onFilterChange({ subCategory: e.target.value })}
                  className="w-full p-2 border rounded-md"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deneyim Seviyesi
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => onFilterChange({ experienceLevel: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Tümü</option>
                {experienceLevels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sıralama
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}