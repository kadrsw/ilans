import { useState, useEffect } from 'react';
import { ref, query, orderByChild, onValue, equalTo } from 'firebase/database';
import { db } from '../lib/firebase';
import type { JobListing } from '../types';

export function useJobs(categoryFilter?: string, searchTerm?: string) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const jobsRef = ref(db, 'jobs');
    const jobsQuery = categoryFilter 
      ? query(jobsRef, orderByChild('category'), equalTo(categoryFilter))
      : query(jobsRef, orderByChild('createdAt'));

    const unsubscribe = onValue(jobsQuery, (snapshot) => {
      try {
        const data = snapshot.val();
        const jobsList: JobListing[] = [];
        const newCategories = new Set<string>();

        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            const job = value as Omit<JobListing, 'id'>;
            const jobWithId = { id: key, ...job } as JobListing;

            // Sadece aktif ilanları göster
            if (jobWithId.status !== 'active') return;

            // Search filter
            if (searchTerm) {
              const searchLower = searchTerm.toLowerCase();
              const matchesSearch = 
                jobWithId.title.toLowerCase().includes(searchLower) ||
                jobWithId.description.toLowerCase().includes(searchLower) ||
                jobWithId.company.toLowerCase().includes(searchLower) ||
                jobWithId.location.toLowerCase().includes(searchLower);

              if (!matchesSearch) return;
            }

            jobsList.push(jobWithId);
            
            // Track categories
            if (job.category) {
              newCategories.add(job.category);
            }
            if (job.subCategory) {
              newCategories.add(job.subCategory);
            }
          });
        }

        // Yeni ilanlar en üstte olacak şekilde sırala (createdAt'e göre azalan)
        setJobs(jobsList.sort((a, b) => b.createdAt - a.createdAt));
        setCategories(newCategories);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('İlanlar yüklenirken bir hata oluştu');
        setLoading(false);
      }
    }, (err) => {
      console.error('Database error:', err);
      setError('Veritabanı bağlantısında bir hata oluştu');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryFilter, searchTerm]);

  return { jobs, categories, loading, error };
}