import { useState, useEffect } from 'react';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../contexts/AuthContext';
import type { JobListing } from '../types';

export function useMyJobs() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) {
      setJobs([]);
      setLoading(false);
      return;
    }

    const jobsRef = ref(db, 'jobs');
    const userJobsQuery = query(
      jobsRef,
      orderByChild('userId'),
      equalTo(user.id)
    );

    const unsubscribe = onValue(userJobsQuery, (snapshot) => {
      try {
        const data = snapshot.val();
        const jobsList: JobListing[] = [];

        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            const job = value as Omit<JobListing, 'id'>;
            const expirationDate = job.createdAt + (60 * 24 * 60 * 60 * 1000); // 60 days
            
            if (Date.now() < expirationDate) {
              jobsList.push({
                id: key,
                ...job
              } as JobListing);
            }
          });
        }

        setJobs(jobsList.sort((a, b) => b.createdAt - a.createdAt));
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('İlanlarınız yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Database error:', err);
      setError('Veritabanı bağlantısında bir hata oluştu');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { jobs, loading, error };
}