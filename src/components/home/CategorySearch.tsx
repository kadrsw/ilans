import React from 'react';
import { jobCategories } from '../../data/jobCategories';

interface CategorySearchProps {
  onCategorySelect: (categoryId: string) => void;
  availableCategories?: Set<string>;
}

export function CategorySearch({ onCategorySelect, availableCategories }: CategorySearchProps) {
  // Filter categories that have active listings
  const activeCategories = jobCategories.filter(category => 
    !availableCategories || availableCategories.has(category.id)
  );

  return (
    <div className="flex flex-wrap gap-2">
      {activeCategories.slice(0, 8).map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className="px-3 py-1.5 text-sm rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          {category.name}
        </button>
      ))}
      <button
        onClick={() => onCategorySelect('')}
        className="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
      >
        Tüm Kategoriler
      </button>
    </div>
  );
}