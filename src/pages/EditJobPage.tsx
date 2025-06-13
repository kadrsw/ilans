import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { useJobActions } from '../hooks/useJobActions';
import { JobForm } from '../components/JobForm';
import type { JobFormData } from '../types';

export function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateJob, isUpdating } = useJobActions();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (!id) return;
        const jobRef = ref(db, `jobs/${id}`);
        const snapshot = await get(jobRef);
        
        if (snapshot.exists()) {
          setJob(snapshot.val());
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

  const handleSubmit = async (data: JobFormData) => {
    if (!id) return;
    
    const success = await updateJob(id, {
      ...data,
      updatedAt: Date.now()
    });

    if (success) {
      navigate('/ilanlarim');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-8 text-red-600">
        {error || 'İlan bulunamadı'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">İlanı Düzenle</h1>
      <JobForm 
        initialData={job}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />
    </div>
  );
}