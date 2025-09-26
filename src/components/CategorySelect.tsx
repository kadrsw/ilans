import React, { useState, useEffect } from 'react';
import { jobCategories, Category, SubCategory } from '../data/jobCategories';

interface CategorySelectProps {
  onCategoryChange: (category: string, subCategory: string) => void;
  error?: string;
  selectedCategory?: string;
  selectedSubCategory?: string;
}

export function CategorySelect({ 
  onCategoryChange, 
  error, 
  selectedCategory = '', 
  selectedSubCategory = '' 
}: CategorySelectProps) {
  const [customCategory, setCustomCategory] = useState<string>('');
  const [currentSubCategories, setCurrentSubCategories] = useState<SubCategory[]>([]);

  // Kategori değiştiğinde alt kategorileri güncelle
  useEffect(() => {
    if (selectedCategory) {
      const category = jobCategories.find(c => c.id === selectedCategory);
      if (category) {
        setCurrentSubCategories(category.subCategories);
      }
    }
  }, [selectedCategory]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    onCategoryChange(categoryId, '');
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subCategoryId = e.target.value;
    
    if (selectedCategory === 'diger' && subCategoryId === 'custom') {
      onCategoryChange('diger', customCategory);
    } else {
      onCategoryChange(selectedCategory, subCategoryId);
    }
  };

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomCategory(value);
    if (selectedCategory === 'diger') {
      onCategoryChange('diger', value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Ana Kategori
        </label>
        <select
          className="w-full px-3 py-2 border rounded-lg shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">Seçiniz</option>
          {jobCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Alt Kategori
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedSubCategory}
            onChange={handleSubCategoryChange}
          >
            <option value="">Seçiniz</option>
            {currentSubCategories.map(subCategory => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedCategory === 'diger' && selectedSubCategory === 'custom' && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Özel Kategori
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={customCategory}
            onChange={handleCustomCategoryChange}
            placeholder="Kategori adını yazın"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}