import React from 'react';
import { useNavigate } from 'react-router-dom';
import { JobForm } from './JobForm';
import { useCreateJob } from '../hooks/useCreateJob';
import { useAuth } from '../hooks/useAuth';
import { JobScraperControls } from './admin/JobScraperControls';
import type { JobFormData } from '../types';
import { Toaster } from 'react-hot-toast';

export function CreateJobPage() {
  const navigate = useNavigate();
  const { createJob, error, isLoading } = useCreateJob();
  const { isAdmin } = useAuth();

  const handleSubmit = async (data: JobFormData) => {
    const success = await createJob(data);
    if (success) {
      // Wait for toast to be visible before redirecting
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Toaster />
      
      <h1 className="text-2xl font-bold mb-6">Yeni İş İlanı Oluştur</h1>
      
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {isAdmin && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Admin Kontrolleri</h2>
          <JobScraperControls />
        </div>
      )}

      <JobForm 
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
      />
    </div>
  );
}