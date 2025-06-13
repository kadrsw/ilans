import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { JobDetailsModal } from '../components/job/JobDetailsModal';
import { JobDetails } from '../components/job/JobDetails';
import { generateMetaTags } from '../utils/seoUtils';
import type { JobListing } from '../types';

export function JobDetailsPage() {
  const { id } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we navigated here from the job list
  const isModalView = location.state?.modal;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchJob = async () => {
      try {
        if (!id) return;
        const jobRef = ref(db, `jobs/${id}`);
        const snapshot = await get(jobRef);
        
        if (snapshot.exists()) {
          const jobData = { id, ...snapshot.val() } as JobListing;
          setJob(jobData);
          
          // Update meta tags for SEO
          generateMetaTags({
            title: jobData.title,
            description: jobData.description.substring(0, 160),
            keywords: [jobData.category, jobData.type, jobData.location, 'iş ilanı', 'kariyer'],
            url: window.location.pathname,
          });
        } else {
          setError('İlan bulunamadı');
        }
      } catch (err) {
        setError('İlan yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleClose = () => {
    const previousPath = sessionStorage.getItem('previousPath') || '/';
    navigate(previousPath, { 
      replace: true,
      state: { scrollToPosition: sessionStorage.getItem('scrollPosition') }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-red-600">
        {error || 'İlan bulunamadı'}
      </div>
    );
  }

  // Show modal if we navigated from job list, otherwise show full page
  return isModalView ? (
    <JobDetailsModal job={job} onClose={handleClose} />
  ) : (
    <JobDetails job={job} />
  );
}