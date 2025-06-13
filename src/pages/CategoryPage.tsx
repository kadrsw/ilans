import React from 'react';
import { useParams } from 'react-router-dom';
import { JobList } from '../components/home/JobList';
import { JobFilters } from '../components/home/JobFilters';

export function CategoryPage() {
  const { category } = useParams();

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {category?.charAt(0).toUpperCase() + category?.slice(1)} İş İlanları
        </h1>
        <p className="text-gray-600">
          En güncel {category} pozisyonlarını keşfedin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <JobFilters />
        </div>
        <div className="lg:col-span-3">
          <JobList category={category} />
        </div>
      </div>
    </div>
  );
}