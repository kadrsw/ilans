import { useState, useCallback, useEffect } from 'react';
import type { JobListing } from '../types';

interface JobFilters {
  searchTerm: string;
  category: string;
  subCategory: string;
  city: string;
  experienceLevel: string;
  sortBy: 'newest' | 'oldest';
}

export function useJobFilters(jobs: JobListing[]) {
  // Initialize filters with stored values if they exist
  const [filters, setFilters] = useState<JobFilters>(() => {
    const storedFilters = sessionStorage.getItem('jobFilters');
    return storedFilters ? JSON.parse(storedFilters) : {
      searchTerm: '',
      category: '',
      subCategory: '',
      city: '',
      experienceLevel: '',
      sortBy: 'newest'
    };
  });

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('jobFilters', JSON.stringify(filters));
  }, [filters]);

  const filteredJobs = useCallback(() => {
    return jobs
      .filter(job => {
        const matchesSearch = !filters.searchTerm || 
          job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(filters.searchTerm.toLowerCase());

        const matchesCategory = !filters.category || job.category === filters.category;
        const matchesSubCategory = !filters.subCategory || job.subCategory === filters.subCategory;
        const matchesCity = !filters.city || job.location.toLowerCase().includes(filters.city.toLowerCase());
        const matchesExperience = !filters.experienceLevel || job.experienceLevel === filters.experienceLevel;

        return matchesSearch && matchesCategory && matchesSubCategory && matchesCity && matchesExperience;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'newest') {
          return b.createdAt - a.createdAt;
        }
        return a.createdAt - b.createdAt;
      });
  }, [jobs, filters]);

  const updateFilters = (newFilters: Partial<JobFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    filters,
    updateFilters,
    filteredJobs: filteredJobs()
  };
}